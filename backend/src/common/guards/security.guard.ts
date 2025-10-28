import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SecurityService } from '../services/security.service';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);

  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
    private rateLimitService: RateLimitService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    const endpoint = request.url;

    // Check if IP is blocked
    if (this.rateLimitService.isBlocked(ip)) {
      this.securityService.logSecurityEvent({
        type: 'blocked_ip',
        ip,
        userAgent,
        endpoint,
        details: { reason: 'IP is blocked' },
        severity: 'high',
      });
      throw new ForbiddenException('Access denied');
    }

    // Check for suspicious patterns in request
    const requestData = JSON.stringify({
      url: request.url,
      query: request.query,
      body: request.body,
      headers: request.headers,
    });

    const { isSuspicious, patterns } = this.securityService.detectSuspiciousPatterns(requestData);

    if (isSuspicious) {
      this.securityService.logSecurityEvent({
        type: 'suspicious_request',
        ip,
        userAgent,
        endpoint,
        details: { patterns, requestData: this.sanitizeForLogging(requestData) },
        severity: 'high',
      });

      // Block IP for suspicious activity
      this.rateLimitService.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
      throw new ForbiddenException('Suspicious activity detected');
    }

    // Check advanced rate limiting per endpoint
    const rateLimitKey = `${ip}:${(request as any).user?.id || 'anonymous'}`;
    const rateLimitResult = this.rateLimitService.checkAdvancedRateLimit(rateLimitKey, endpoint);

    if (!rateLimitResult.allowed) {
      this.securityService.logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip,
        userAgent,
        endpoint,
        details: {
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime),
        },
        severity: 'medium',
      });
      throw new ForbiddenException('Rate limit exceeded');
    }

    return true;
  }

  private sanitizeForLogging(data: string): string {
    // Remove sensitive information from logs
    return data
      .replace(/"password":\s*"[^"]*"/gi, '"password": "[REDACTED]"')
      .replace(/"token":\s*"[^"]*"/gi, '"token": "[REDACTED]"')
      .replace(/"authorization":\s*"[^"]*"/gi, '"authorization": "[REDACTED]"')
      .substring(0, 1000); // Limit log size
  }

  // Admin methods for IP management
  blockIP(ip: string, duration?: number) {
    this.rateLimitService.blockIP(ip, duration);
    this.logger.warn(`IP ${ip} manually blocked`);
  }

  unblockIP(ip: string) {
    this.rateLimitService.unblockIP(ip);
    this.logger.log(`IP ${ip} manually unblocked`);
  }

  getBlockedIPs(): string[] {
    return this.rateLimitService.getBlockedIPs();
  }

  getRateLimitStats() {
    return this.rateLimitService.getRateLimitStats();
  }
}
