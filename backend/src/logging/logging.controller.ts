import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CustomLoggingService } from './logging.service';

@ApiTags('Logging')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LoggingController {
  constructor(private loggingService: CustomLoggingService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get application logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  getLogs(
    @Query('level') level?: string,
    @Query('context') context?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const logs = this.loggingService.getLogs(
      level as any,
      context,
      limit ? parseInt(limit) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      logs,
      total: logs.length,
      filters: {
        level,
        context,
        limit: limit ? parseInt(limit) : undefined,
        startDate,
        endDate,
      },
    };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get logging statistics' })
  @ApiResponse({ status: 200, description: 'Logging statistics retrieved successfully' })
  getLogStats() {
    return this.loggingService.getLogStats();
  }

  @Get('export')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export logs' })
  @ApiResponse({ status: 200, description: 'Logs exported successfully' })
  exportLogs(@Query('format') format: 'json' | 'csv' = 'json', @Res() res: Response) {
    const exportData = this.loggingService.exportLogs(format);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `logs-${timestamp}.${format}`;

    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  }

  @Get('health')
  @ApiOperation({ summary: 'Logging system health check' })
  @ApiResponse({ status: 200, description: 'Logging system is healthy' })
  getLoggingHealth() {
    const stats = this.loggingService.getLogStats();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalLogs: stats.totalLogs,
        errorRate: stats.errorRate,
        recentErrorsCount: stats.recentErrors.length,
        logLevels: stats.logsByLevel,
      },
    };
  }
}
