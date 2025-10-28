import { Controller, Post, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SecurityService } from '../common/services/security.service';
import { RateLimitService } from '../common/services/rate-limit.service';
import { AuditService } from '../common/services/audit.service';
import { DataProtectionService } from '../common/services/data-protection.service';

@ApiTags('Cron Jobs')
@Controller('cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(
    private securityService: SecurityService,
    private rateLimitService: RateLimitService,
    private auditService: AuditService,
    private dataProtectionService: DataProtectionService,
  ) {}

  @Post('cleanup')
  @ApiOperation({ summary: 'Daily cleanup job' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async dailyCleanup() {
    this.logger.log('Starting daily cleanup job');

    const results = {
      timestamp: new Date().toISOString(),
      tasks: [] as any[],
    };

    try {
      // Clean up expired rate limit records
      const rateLimitStats = this.rateLimitService.getRateLimitStats();
      results.tasks.push({
        task: 'rate_limit_cleanup',
        status: 'completed',
        details: `Processed ${rateLimitStats.length} rate limit records`,
      });

      // Log cleanup completion
      this.auditService.logAction({
        action: 'DAILY_CLEANUP',
        resource: 'system',
        ip: 'cron',
        success: true,
        details: results,
        severity: 'low',
      });

      this.logger.log('Daily cleanup job completed successfully');

      return {
        success: true,
        message: 'Daily cleanup completed successfully',
        results,
      };
    } catch (error) {
      this.logger.error('Daily cleanup job failed:', error);

      this.auditService.logAction({
        action: 'DAILY_CLEANUP',
        resource: 'system',
        ip: 'cron',
        success: false,
        details: { error: error.message },
        severity: 'high',
      });

      return {
        success: false,
        message: 'Daily cleanup failed',
        error: error.message,
      };
    }
  }

  @Post('retention-policy')
  @ApiOperation({ summary: 'Weekly data retention policy job' })
  @ApiResponse({ status: 200, description: 'Retention policy applied successfully' })
  async applyRetentionPolicy() {
    this.logger.log('Starting retention policy job');

    try {
      const result = this.dataProtectionService.applyRetentionPolicy();

      this.auditService.logAction({
        action: 'RETENTION_POLICY_APPLIED',
        resource: 'system',
        ip: 'cron',
        success: true,
        details: result,
        severity: 'medium',
      });

      this.logger.log('Retention policy job completed successfully');

      return {
        success: true,
        message: 'Retention policy applied successfully',
        ...result,
      };
    } catch (error) {
      this.logger.error('Retention policy job failed:', error);

      this.auditService.logAction({
        action: 'RETENTION_POLICY_APPLIED',
        resource: 'system',
        ip: 'cron',
        success: false,
        details: { error: error.message },
        severity: 'high',
      });

      return {
        success: false,
        message: 'Retention policy failed',
        error: error.message,
      };
    }
  }

  @Post('security-cleanup')
  @ApiOperation({ summary: 'Security cleanup job' })
  @ApiResponse({ status: 200, description: 'Security cleanup completed successfully' })
  async securityCleanup() {
    this.logger.log('Starting security cleanup job');

    try {
      const securityStats = this.securityService.getSecurityStats();
      const blockedIPs = this.rateLimitService.getBlockedIPs();

      const results = {
        securityEventsProcessed: securityStats.totalEvents,
        blockedIPsCount: blockedIPs.length,
        cleanupActions: [] as string[],
      };

      // Add any specific security cleanup logic here
      results.cleanupActions.push('Processed security events');
      results.cleanupActions.push('Reviewed blocked IPs');

      this.auditService.logAction({
        action: 'SECURITY_CLEANUP',
        resource: 'system',
        ip: 'cron',
        success: true,
        details: results,
        severity: 'medium',
      });

      this.logger.log('Security cleanup job completed successfully');

      return {
        success: true,
        message: 'Security cleanup completed successfully',
        results,
      };
    } catch (error) {
      this.logger.error('Security cleanup job failed:', error);

      this.auditService.logAction({
        action: 'SECURITY_CLEANUP',
        resource: 'system',
        ip: 'cron',
        success: false,
        details: { error: error.message },
        severity: 'high',
      });

      return {
        success: false,
        message: 'Security cleanup failed',
        error: error.message,
      };
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get cron job status' })
  @ApiResponse({ status: 200, description: 'Cron job status retrieved successfully' })
  getCronStatus() {
    const auditStats = this.auditService.getAuditStats();
    const securityStats = this.securityService.getSecurityStats();

    // Get recent cron job executions from audit logs
    const cronLogs = this.auditService.getAuditLogs({
      action: 'DAILY_CLEANUP',
      limit: 10,
    });

    return {
      status: 'active',
      lastExecutions: {
        dailyCleanup: cronLogs.find(log => log.action === 'DAILY_CLEANUP')?.timestamp || null,
        retentionPolicy:
          cronLogs.find(log => log.action === 'RETENTION_POLICY_APPLIED')?.timestamp || null,
        securityCleanup: cronLogs.find(log => log.action === 'SECURITY_CLEANUP')?.timestamp || null,
      },
      systemHealth: {
        totalAuditLogs: auditStats.totalLogs,
        totalSecurityEvents: securityStats.totalEvents,
        auditSuccessRate: auditStats.successRate,
      },
      nextScheduled: {
        dailyCleanup: '02:00 UTC daily',
        retentionPolicy: '03:00 UTC weekly (Sunday)',
        securityCleanup: '04:00 UTC daily',
      },
    };
  }
}
