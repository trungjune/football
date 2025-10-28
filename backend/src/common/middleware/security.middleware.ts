import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private rateLimiter: any;

  constructor(private configService: ConfigService) {
    this.setupRateLimit();
  }

  private setupRateLimit() {
    this.rateLimiter = rateLimit({
      windowMs: this.configService.get<number>('RATE_LIMIT_TTL', 60) * 1000, // 1 minute default
      max: this.configService.get<number>('RATE_LIMIT_LIMIT', 100), // 100 requests per window
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
      },
      keyGenerator: (req: Request) => {
        // Use IP address and user ID if available
        const ip = req.ip || req.socket.remoteAddress;
        const userId = (req as any).user?.id || 'anonymous';
        return `${ip}:${userId}`;
      },
      handler: (req: Request, res: Response) => {
        this.logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          statusCode: 429,
        });
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Apply security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
          connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for development
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })(req, res, () => {
      // Apply rate limiting
      this.rateLimiter(req, res, () => {
        // Log security events
        this.logSecurityEvent(req);
        next();
      });
    });
  }

  private logSecurityEvent(req: Request) {
    const securityHeaders = {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'user-agent': req.headers['user-agent'],
      referer: req.headers['referer'],
      origin: req.headers['origin'],
    };

    // Log suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /eval\(/i,
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /delete.*from/i,
    ];

    const requestData = JSON.stringify({
      url: req.url,
      method: req.method,
      query: req.query,
      body: req.body,
    });

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(requestData));

    if (hasSuspiciousContent) {
      this.logger.warn(`Suspicious request detected from ${req.ip}:`, {
        url: req.url,
        method: req.method,
        headers: securityHeaders,
        userAgent: req.headers['user-agent'],
      });
    }

    // Log failed authentication attempts
    if (req.url.includes('/auth/') && req.method === 'POST') {
      this.logger.log(`Authentication attempt from ${req.ip} for ${req.url}`);
    }
  }
}
