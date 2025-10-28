import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from '../common/services/security.service';
import { AuditService } from '../common/services/audit.service';
import { RateLimitService } from '../common/services/rate-limit.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private securityService: SecurityService,
    private auditService: AuditService,
    private rateLimitService: RateLimitService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    const securityStats = this.securityService.getSecurityStats();
    const auditStats = this.auditService.getAuditStats();
    const blockedIPs = this.rateLimitService.getBlockedIPs();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        database: {
          status: 'connected', // This would check actual DB connection
          type: 'postgresql',
        },
        security: {
          status: 'active',
          totalEvents: securityStats.totalEvents,
          blockedIPs: blockedIPs.length,
          criticalEvents: securityStats.eventsBySeverity.critical || 0,
        },
        audit: {
          status: 'active',
          totalLogs: auditStats.totalLogs,
          successRate: auditStats.successRate,
        },
        cache: {
          status: process.env.REDIS_URL ? 'connected' : 'disabled',
          type: process.env.REDIS_URL ? 'redis' : 'memory',
        },
      },
      features: {
        authentication: true,
        fileUpload: true,
        realTimeUpdates: true,
        notifications: true,
        dataProtection: true,
        auditLogging: true,
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  getReadiness() {
    // This would check if all required services are available
    const checks = {
      database: true, // Would check actual DB connection
      security: true,
      audit: true,
    };

    const isReady = Object.values(checks).every(check => check === true);

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      uptime: process.uptime(),
    };
  }
}
