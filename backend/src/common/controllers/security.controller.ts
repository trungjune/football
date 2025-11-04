import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole as Role } from '../../shared-types';
import { SecurityService, SecurityEvent } from '../services/security.service';
import { RateLimitService } from '../services/rate-limit.service';
import { AuditService } from '../services/audit.service';
import { SecurityGuard } from '../guards/security.guard';

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard, SecurityGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(
    private securityService: SecurityService,
    private rateLimitService: RateLimitService,
    private auditService: AuditService,
    private securityGuard: SecurityGuard,
  ) {}

  @Get('events')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get security events' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  getSecurityEvents(
    @Query('type') type?: SecurityEvent['type'],
    @Query('severity') severity?: SecurityEvent['severity'],
    @Query('ip') ip?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (ip) filters.ip = ip;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    let events = this.securityService.getSecurityEvents(filters);

    if (limit) {
      events = events.slice(0, parseInt(limit));
    }

    return {
      events,
      total: events.length,
    };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get security statistics' })
  @ApiResponse({ status: 200, description: 'Security statistics retrieved successfully' })
  getSecurityStats() {
    return this.securityService.getSecurityStats();
  }

  @Get('blocked-ips')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get blocked IP addresses' })
  @ApiResponse({ status: 200, description: 'Blocked IPs retrieved successfully' })
  getBlockedIPs() {
    return {
      blockedIPs: this.rateLimitService.getBlockedIPs(),
    };
  }

  @Post('block-ip/:ip')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block an IP address' })
  @ApiResponse({ status: 200, description: 'IP blocked successfully' })
  blockIP(@Param('ip') ip: string, @Query('duration') duration?: string) {
    const durationMs = duration ? parseInt(duration) * 1000 : undefined;
    this.securityGuard.blockIP(ip, durationMs);

    return {
      message: `IP ${ip} has been blocked`,
      duration: durationMs ? `${duration} seconds` : 'permanently',
    };
  }

  @Delete('block-ip/:ip')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock an IP address' })
  @ApiResponse({ status: 200, description: 'IP unblocked successfully' })
  unblockIP(@Param('ip') ip: string) {
    this.securityGuard.unblockIP(ip);

    return {
      message: `IP ${ip} has been unblocked`,
    };
  }

  @Get('rate-limit-stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get rate limiting statistics' })
  @ApiResponse({ status: 200, description: 'Rate limit statistics retrieved successfully' })
  getRateLimitStats() {
    return {
      stats: this.rateLimitService.getRateLimitStats(),
    };
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('success') success?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (success !== undefined) filters.success = success === 'true';
    if (severity) filters.severity = severity;
    if (limit) filters.limit = parseInt(limit);

    const logs = this.auditService.getAuditLogs(filters);

    return {
      logs,
      total: logs.length,
    };
  }

  @Get('audit-stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  getAuditStats() {
    return this.auditService.getAuditStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Security health check' })
  @ApiResponse({ status: 200, description: 'Security system is healthy' })
  healthCheck() {
    const securityStats = this.securityService.getSecurityStats();
    const auditStats = this.auditService.getAuditStats();
    const blockedIPs = this.rateLimitService.getBlockedIPs();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalSecurityEvents: securityStats.totalEvents,
        totalAuditLogs: auditStats.totalLogs,
        blockedIPsCount: blockedIPs.length,
        criticalEvents: securityStats.eventsBySeverity.critical || 0,
        highSeverityEvents: securityStats.eventsBySeverity.high || 0,
        auditSuccessRate: auditStats.successRate,
      },
    };
  }
}
