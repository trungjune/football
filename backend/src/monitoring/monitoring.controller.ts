import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole as Role } from '../shared-types';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status retrieved successfully' })
  getHealthStatus() {
    return this.monitoringService.getHealthStatus();
  }

  @Get('metrics')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  getMetrics(@Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours) : 1;
    const metrics = this.monitoringService.getMetrics(hoursNum);

    return {
      period: `${hoursNum} hours`,
      dataPoints: metrics.length,
      metrics,
    };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  getSystemStats() {
    return this.monitoringService.getSystemStats();
  }

  @Get('report')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Generate monitoring report' })
  @ApiResponse({ status: 200, description: 'Monitoring report generated successfully' })
  generateReport(@Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours) : 24;
    return this.monitoringService.generateReport(hoursNum);
  }

  @Get('dashboard')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get monitoring dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getDashboardData() {
    const healthStatus = this.monitoringService.getHealthStatus();
    const systemStats = this.monitoringService.getSystemStats();
    const recentMetrics = this.monitoringService.getMetrics(1); // Last hour

    return {
      timestamp: new Date().toISOString(),
      health: healthStatus,
      stats: systemStats,
      recentMetrics: recentMetrics.slice(-10), // Last 10 data points
      charts: {
        memoryUsage: recentMetrics.map(m => ({
          timestamp: m.timestamp,
          value: m.memory.percentage,
        })),
        cpuUsage: recentMetrics.map(m => ({
          timestamp: m.timestamp,
          value: m.cpu.usage,
        })),
        requestsPerMinute: recentMetrics.map(m => ({
          timestamp: m.timestamp,
          value: m.requestsPerMinute,
        })),
        errorRate: recentMetrics.map(m => ({
          timestamp: m.timestamp,
          value: m.errorRate,
        })),
      },
    };
  }
}
