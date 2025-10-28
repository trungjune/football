import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PerformanceMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Add request ID for tracing
    const requestId = Math.random().toString(36).substring(7);
    req['requestId'] = requestId;

    // Log request start
    this.logger.log(`[${requestId}] ${req.method} ${req.url} - Start`);

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endMemory = process.memoryUsage();

      // Calculate memory usage
      const memoryDiff = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      };

      // Log performance metrics
      const logger = new Logger(PerformanceMiddleware.name);
      logger.log(
        `[${requestId}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - Memory: ${Math.round((memoryDiff.heapUsed / 1024 / 1024) * 100) / 100}MB`,
      );

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Request-ID', requestId);

      // Warn on slow requests
      if (duration > 1000) {
        logger.warn(`[${requestId}] Slow request detected: ${duration}ms`);
      }

      // Warn on high memory usage
      if (memoryDiff.heapUsed > 50 * 1024 * 1024) {
        // 50MB
        logger.warn(
          `[${requestId}] High memory usage: ${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`,
        );
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  }
}
