import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private redis: any;

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Only initialize Redis in production or when explicitly configured
      const redisUrl = this.configService.get<string>('UPSTASH_REDIS_URL');

      if (redisUrl) {
        const { Redis } = await import('@upstash/redis');
        this.redis = new Redis({
          url: redisUrl,
          token: this.configService.get<string>('UPSTASH_REDIS_TOKEN'),
        });
        this.logger.log('Redis cache initialized');
      } else {
        this.logger.warn('Redis not configured, using in-memory cache fallback');
        this.redis = new Map(); // Fallback to in-memory cache
      }
    } catch (error) {
      this.logger.error('Failed to initialize Redis, using in-memory cache', error);
      this.redis = new Map();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis instanceof Map) {
        const value = this.redis.get(key);
        return value ? JSON.parse(value) : null;
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (this.redis instanceof Map) {
        this.redis.set(key, serializedValue);
        // Simple TTL for in-memory cache
        setTimeout(() => this.redis.delete(key), ttlSeconds * 1000);
        return;
      }

      await this.redis.setex(key, ttlSeconds, serializedValue);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.redis instanceof Map) {
        this.redis.delete(key);
        return;
      }

      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis instanceof Map) {
        // Simple pattern matching for in-memory cache
        const keys = Array.from(this.redis.keys()).filter(key =>
          key.includes(pattern.replace('*', '')),
        );
        keys.forEach(key => this.redis.delete(key));
        return;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache invalidate pattern error for ${pattern}:`, error);
    }
  }

  // Cache decorator helper
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  // Generate cache keys
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // Cache statistics (for monitoring)
  async getStats(): Promise<any> {
    try {
      if (this.redis instanceof Map) {
        return {
          type: 'memory',
          keys: this.redis.size,
          memory: 'unknown',
        };
      }

      const info = await this.redis.info();
      return {
        type: 'redis',
        info: info,
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return { type: 'error', error: error.message };
    }
  }
}
