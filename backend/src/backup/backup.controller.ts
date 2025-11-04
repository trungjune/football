import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole as Role } from '@shared/enums';
import { BackupService } from './backup.service';

@ApiTags('Backup')
@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Get('history')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get backup history' })
  @ApiResponse({ status: 200, description: 'Backup history retrieved successfully' })
  getBackupHistory(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : undefined;
    const history = this.backupService.getBackupHistory(limitNum);

    return {
      history,
      total: history.length,
    };
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get backup statistics' })
  @ApiResponse({ status: 200, description: 'Backup statistics retrieved successfully' })
  getBackupStats() {
    return this.backupService.getBackupStats();
  }

  @Post('create')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create manual backup' })
  @ApiResponse({ status: 200, description: 'Backup created successfully' })
  async createManualBackup(@Body() body: { type: 'full' | 'logs' | 'config' | 'monitoring' }) {
    const result = await this.backupService.createManualBackup(body.type);

    return {
      message: 'Backup created successfully',
      result,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Backup system health check' })
  @ApiResponse({ status: 200, description: 'Backup system is healthy' })
  getBackupHealth() {
    const stats = this.backupService.getBackupStats();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalBackups: stats.totalBackups,
        successRate: stats.successRate,
        lastBackupSuccess: stats.lastBackup?.success || false,
        lastBackupTime: stats.lastBackup?.timestamp || null,
        totalSize: stats.totalSize,
      },
    };
  }
}
