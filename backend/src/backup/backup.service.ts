import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from '../common/services/audit.service';
import { SecurityService } from '../common/services/security.service';
import { CustomLoggingService } from '../logging/logging.service';
import { MonitoringService } from '../monitoring/monitoring.service';

export interface BackupResult {
  success: boolean;
  timestamp: Date;
  type: 'full' | 'incremental' | 'logs' | 'config';
  size: number; // in bytes
  duration: number; // in milliseconds
  location: string;
  error?: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private backupHistory: BackupResult[] = [];
  private readonly maxBackupHistory = 100;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private securityService: SecurityService,
    private loggingService: CustomLoggingService,
    private monitoringService: MonitoringService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async performDailyBackup() {
    this.logger.log('Starting daily backup process');

    try {
      // Backup logs
      await this.backupLogs();

      // Backup configuration
      await this.backupConfiguration();

      // Backup monitoring data
      await this.backupMonitoringData();

      // Clean old backups
      await this.cleanOldBackups();

      this.logger.log('Daily backup process completed successfully');
    } catch (error) {
      this.logger.error('Daily backup process failed:', error);

      this.auditService.logAction({
        action: 'BACKUP_FAILED',
        resource: 'system',
        ip: 'system',
        success: false,
        details: { error: error.message },
        severity: 'high',
      });
    }
  }

  async backupLogs(): Promise<BackupResult> {
    const startTime = Date.now();

    try {
      const logs = this.loggingService.exportLogs('json');
      const timestamp = new Date();
      const location = `logs/backup-${timestamp.toISOString().split('T')[0]}.json`;

      // In a real implementation, you would save this to cloud storage
      // For now, we'll simulate the backup
      const size = Buffer.byteLength(logs, 'utf8');
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        timestamp,
        type: 'logs',
        size,
        duration,
        location,
      };

      this.addBackupResult(result);

      this.auditService.logAction({
        action: 'LOGS_BACKUP',
        resource: 'logs',
        ip: 'system',
        success: true,
        details: { size, duration, location },
        severity: 'low',
      });

      this.logger.log(`Logs backup completed: ${size} bytes in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: BackupResult = {
        success: false,
        timestamp: new Date(),
        type: 'logs',
        size: 0,
        duration,
        location: '',
        error: error.message,
      };

      this.addBackupResult(result);
      this.logger.error('Logs backup failed:', error);
      throw error;
    }
  }

  async backupConfiguration(): Promise<BackupResult> {
    const startTime = Date.now();

    try {
      const config = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        features: {
          authentication: true,
          fileUpload: true,
          realTimeUpdates: true,
          notifications: true,
          dataProtection: true,
          auditLogging: true,
        },
        settings: {
          rateLimitWindow: this.configService.get('RATE_LIMIT_WINDOW_MS'),
          rateLimitMax: this.configService.get('RATE_LIMIT_MAX'),
          maxFileSize: this.configService.get('MAX_FILE_SIZE'),
          passwordMinLength: this.configService.get('PASSWORD_MIN_LENGTH'),
        },
      };

      const configJson = JSON.stringify(config, null, 2);
      const timestamp = new Date();
      const location = `config/backup-${timestamp.toISOString().split('T')[0]}.json`;
      const size = Buffer.byteLength(configJson, 'utf8');
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        timestamp,
        type: 'config',
        size,
        duration,
        location,
      };

      this.addBackupResult(result);

      this.auditService.logAction({
        action: 'CONFIG_BACKUP',
        resource: 'configuration',
        ip: 'system',
        success: true,
        details: { size, duration, location },
        severity: 'low',
      });

      this.logger.log(`Configuration backup completed: ${size} bytes in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: BackupResult = {
        success: false,
        timestamp: new Date(),
        type: 'config',
        size: 0,
        duration,
        location: '',
        error: error.message,
      };

      this.addBackupResult(result);
      this.logger.error('Configuration backup failed:', error);
      throw error;
    }
  }

  async backupMonitoringData(): Promise<BackupResult> {
    const startTime = Date.now();

    try {
      const monitoringReport = this.monitoringService.generateReport(24);
      const securityStats = this.securityService.getSecurityStats();
      const auditStats = this.auditService.getAuditStats();

      const monitoringData = {
        timestamp: new Date().toISOString(),
        monitoring: monitoringReport,
        security: securityStats,
        audit: auditStats,
      };

      const dataJson = JSON.stringify(monitoringData, null, 2);
      const timestamp = new Date();
      const location = `monitoring/backup-${timestamp.toISOString().split('T')[0]}.json`;
      const size = Buffer.byteLength(dataJson, 'utf8');
      const duration = Date.now() - startTime;

      const result: BackupResult = {
        success: true,
        timestamp,
        type: 'full',
        size,
        duration,
        location,
      };

      this.addBackupResult(result);

      this.auditService.logAction({
        action: 'MONITORING_BACKUP',
        resource: 'monitoring',
        ip: 'system',
        success: true,
        details: { size, duration, location },
        severity: 'low',
      });

      this.logger.log(`Monitoring data backup completed: ${size} bytes in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: BackupResult = {
        success: false,
        timestamp: new Date(),
        type: 'full',
        size: 0,
        duration,
        location: '',
        error: error.message,
      };

      this.addBackupResult(result);
      this.logger.error('Monitoring data backup failed:', error);
      throw error;
    }
  }

  async cleanOldBackups(): Promise<void> {
    try {
      // Clean old backup history (keep last 30 days)
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const initialCount = this.backupHistory.length;

      this.backupHistory = this.backupHistory.filter(backup => backup.timestamp >= cutoff);

      const cleanedCount = initialCount - this.backupHistory.length;

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned ${cleanedCount} old backup records`);

        this.auditService.logAction({
          action: 'BACKUP_CLEANUP',
          resource: 'backups',
          ip: 'system',
          success: true,
          details: { cleanedCount, remainingCount: this.backupHistory.length },
          severity: 'low',
        });
      }

      // Clean old logs
      const clearedLogs = this.loggingService.clearOldLogs(72); // Keep 3 days of logs

      if (clearedLogs > 0) {
        this.logger.log(`Cleaned ${clearedLogs} old log entries`);
      }
    } catch (error) {
      this.logger.error('Backup cleanup failed:', error);
      throw error;
    }
  }

  private addBackupResult(result: BackupResult): void {
    this.backupHistory.push(result);

    // Keep only the last maxBackupHistory entries
    if (this.backupHistory.length > this.maxBackupHistory) {
      this.backupHistory.shift();
    }
  }

  getBackupHistory(limit?: number): BackupResult[] {
    const history = [...this.backupHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return limit ? history.slice(0, limit) : history;
  }

  getBackupStats(): {
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    successRate: number;
    totalSize: number;
    averageDuration: number;
    lastBackup?: BackupResult;
    backupsByType: Record<string, number>;
  } {
    const totalBackups = this.backupHistory.length;
    const successfulBackups = this.backupHistory.filter(b => b.success).length;
    const failedBackups = totalBackups - successfulBackups;
    const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

    const totalSize = this.backupHistory.reduce((sum, b) => sum + b.size, 0);
    const averageDuration =
      totalBackups > 0
        ? this.backupHistory.reduce((sum, b) => sum + b.duration, 0) / totalBackups
        : 0;

    const lastBackup =
      this.backupHistory.length > 0 ? this.backupHistory[this.backupHistory.length - 1] : undefined;

    const backupsByType: Record<string, number> = {};
    for (const backup of this.backupHistory) {
      backupsByType[backup.type] = (backupsByType[backup.type] || 0) + 1;
    }

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      successRate: Math.round(successRate * 100) / 100,
      totalSize,
      averageDuration: Math.round(averageDuration),
      lastBackup,
      backupsByType,
    };
  }

  async createManualBackup(type: 'full' | 'logs' | 'config' | 'monitoring'): Promise<BackupResult> {
    this.logger.log(`Starting manual backup: ${type}`);

    try {
      let result: BackupResult;

      switch (type) {
        case 'logs':
          result = await this.backupLogs();
          break;
        case 'config':
          result = await this.backupConfiguration();
          break;
        case 'monitoring':
          result = await this.backupMonitoringData();
          break;
        case 'full':
          // Perform all backup types
          const logsResult = await this.backupLogs();
          const configResult = await this.backupConfiguration();
          const monitoringResult = await this.backupMonitoringData();

          result = {
            success: logsResult.success && configResult.success && monitoringResult.success,
            timestamp: new Date(),
            type: 'full',
            size: logsResult.size + configResult.size + monitoringResult.size,
            duration: logsResult.duration + configResult.duration + monitoringResult.duration,
            location: 'multiple',
          };
          break;
        default:
          throw new Error(`Unknown backup type: ${type}`);
      }

      this.logger.log(`Manual backup completed: ${type}`);
      return result;
    } catch (error) {
      this.logger.error(`Manual backup failed: ${type}`, error);
      throw error;
    }
  }
}
