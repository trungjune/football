import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly blockedIPs = new Set<string>();

  constructor(private configService: ConfigService) {
    // Clean up old records every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  checkRateLimit(
    key: string,
    windowMs: number = 60 * 1000,
    maxRequests: number = 100,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.records.get(key);

    // Check if IP is permanently blocked
    if (this.blockedIPs.has(key.split(':')[0])) {
      return { allowed: false, remaining: 0, resetTime: now + windowMs };
    }

    if (!record || now >= record.resetTime) {
      // Create new record or reset expired one
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      };
      this.records.set(key, newRecord);
      return { allowed: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
    }

    record.count++;

    if (record.count > maxRequests) {
      record.blocked = true;
      this.logger.warn(`Rate limit exceeded for key: ${key}`);
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  blockIP(ip: string, duration?: number) {
    this.blockedIPs.add(ip);
    this.logger.warn(`IP ${ip} has been blocked`);

    if (duration) {
      setTimeout(() => {
        this.blockedIPs.delete(ip);
        this.logger.log(`IP ${ip} has been unblocked after ${duration}ms`);
      }, duration);
    }
  }

  unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
    this.logger.log(`IP ${ip} has been manually unblocked`);
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  getRateLimitStats(): Array<{ key: string; count: number; resetTime: number; blocked: boolean }> {
    return Array.from(this.records.entries()).map(([key, record]) => ({
      key,
      ...record,
    }));
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.records.entries()) {
      if (now >= record.resetTime) {
        this.records.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired rate limit records`);
    }
  }

  // Advanced rate limiting for different endpoints
  checkAdvancedRateLimit(
    key: string,
    endpoint: string,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const limits = this.getEndpointLimits(endpoint);
    return this.checkRateLimit(key, limits.windowMs, limits.maxRequests);
  }

  private getEndpointLimits(endpoint: string): { windowMs: number; maxRequests: number } {
    // Different limits for different endpoints
    const endpointLimits: Record<string, { windowMs: number; maxRequests: number }> = {
      '/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
      '/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
      '/auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
      '/api/upload': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
      '/api/members': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
      '/api/sessions': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
      '/api/finance': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
    };

    // Check for pattern matches
    for (const [pattern, limits] of Object.entries(endpointLimits)) {
      if (endpoint.includes(pattern)) {
        return limits;
      }
    }

    // Default limits
    return { windowMs: 60 * 1000, maxRequests: 100 };
  }
}
