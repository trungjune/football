import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SecurityService } from '../common/services/security.service';
import { AuditService } from '../common/services/audit.service';
import { RateLimitService } from '../common/services/rate-limit.service';

export interface SystemMetrics {
  timestamp: Date;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  uptime: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: {
    database: 'connected' | 'disconnected' | 'slow';
    cache: 'connected' | 'disconnected' | 'disabled';
    security: 'active' | 'inactive';
    audit: 'active' | 'inactive';
  };
  metrics: SystemMetrics;
  alerts: string[];
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private metrics: SystemMetrics[] = [];
  private readonly maxMetrics = 1440; // Keep 24 hours of minute-by-minute data
  private alerts: string[] = [];

  constructor(
    private configService: ConfigService,
    private securityService: SecurityService,
    private auditService: AuditService,
    private rateLimitService: RateLimitService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  collectMetrics() {
    const memoryUsage = process.memoryUsage();
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      },
      cpu: {
        usage: this.getCpuUsage(),
      },
      uptime: process.uptime(),
      activeConnections: this.getActiveConnections(),
      requestsPerMinute: this.getRequestsPerMinute(),
      errorRate: this.getErrorRate(),
    };

    this.metrics.push(metrics);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Check for alerts
    this.checkAlerts(metrics);

    this.logger.debug('Metrics collected', {
      memory: `${metrics.memory.used}MB (${metrics.memory.percentage}%)`,
      cpu: `${metrics.cpu.usage}%`,
      uptime: `${Math.round(metrics.uptime)}s`,
    });
  }

  private getCpuUsage(): number {
    // Simple CPU usage calculation
    // In a real implementation, you might use a more sophisticated method
    const usage = process.cpuUsage();
    return Math.round((usage.user + usage.system) / 1000000); // Convert to percentage approximation
  }

  private getActiveConnections(): number {
    // This would typically track active HTTP connections
    // For now, returning a mock value
    return Math.floor(Math.random() * 100);
  }

  private getRequestsPerMinute(): number {
    // Calculate requests per minute from rate limit service
    const rateLimitStats = this.rateLimitService.getRateLimitStats();
    return rateLimitStats.length; // Simplified calculation
  }

  private getErrorRate(): number {
    // Calculate error rate from audit logs
    const auditStats = this.auditService.getAuditStats();
    return Math.round((100 - auditStats.successRate) * 100) / 100;
  }

  private checkAlerts(metrics: SystemMetrics) {
    const newAlerts: string[] = [];

    // Memory usage alert
    if (metrics.memory.percentage > 85) {
      newAlerts.push(`High memory usage: ${metrics.memory.percentage}%`);
    }

    // CPU usage alert
    if (metrics.cpu.usage > 80) {
      newAlerts.push(`High CPU usage: ${metrics.cpu.usage}%`);
    }

    // Error rate alert
    if (metrics.errorRate > 5) {
      newAlerts.push(`High error rate: ${metrics.errorRate}%`);
    }

    // Security alerts
    const securityStats = this.securityService.getSecurityStats();
    const criticalEvents = securityStats.eventsBySeverity.critical || 0;
    if (criticalEvents > 0) {
      newAlerts.push(`${criticalEvents} critical security events detected`);
    }

    // Update alerts
    this.alerts = newAlerts;

    // Log critical alerts
    if (newAlerts.length > 0) {
      this.logger.warn('System alerts detected:', newAlerts);
    }
  }

  getHealthStatus(): HealthStatus {
    const latestMetrics = this.metrics[this.metrics.length - 1] || this.getDefaultMetrics();
    const securityStats = this.securityService.getSecurityStats();
    const auditStats = this.auditService.getAuditStats();

    // Determine overall health status
    let status: HealthStatus['status'] = 'healthy';
    if (this.alerts.length > 0) {
      status = this.alerts.some(
        alert =>
          alert.includes('critical') || alert.includes('High CPU') || alert.includes('High memory'),
      )
        ? 'unhealthy'
        : 'degraded';
    }

    return {
      status,
      timestamp: new Date(),
      services: {
        database: this.checkDatabaseHealth(),
        cache: this.checkCacheHealth(),
        security: securityStats.totalEvents >= 0 ? 'active' : 'inactive',
        audit: auditStats.totalLogs >= 0 ? 'active' : 'inactive',
      },
      metrics: latestMetrics,
      alerts: this.alerts,
    };
  }

  private checkDatabaseHealth(): 'connected' | 'disconnected' | 'slow' {
    // This would check actual database connection
    // For now, assuming it's connected
    return 'connected';
  }

  private checkCacheHealth(): 'connected' | 'disconnected' | 'disabled' {
    return process.env.REDIS_URL ? 'connected' : 'disabled';
  }

  private getDefaultMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    return {
      timestamp: new Date(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      },
      cpu: { usage: 0 },
      uptime: process.uptime(),
      activeConnections: 0,
      requestsPerMinute: 0,
      errorRate: 0,
    };
  }

  getMetrics(hours: number = 1): SystemMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp >= cutoff);
  }

  getSystemStats() {
    const metrics = this.getMetrics(24); // Last 24 hours

    if (metrics.length === 0) {
      return {
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        averageCpuUsage: 0,
        peakCpuUsage: 0,
        totalRequests: 0,
        averageErrorRate: 0,
        uptime: process.uptime(),
      };
    }

    return {
      averageMemoryUsage: Math.round(
        metrics.reduce((sum, m) => sum + m.memory.percentage, 0) / metrics.length,
      ),
      peakMemoryUsage: Math.max(...metrics.map(m => m.memory.percentage)),
      averageCpuUsage: Math.round(
        metrics.reduce((sum, m) => sum + m.cpu.usage, 0) / metrics.length,
      ),
      peakCpuUsage: Math.max(...metrics.map(m => m.cpu.usage)),
      totalRequests: metrics.reduce((sum, m) => sum + m.requestsPerMinute, 0),
      averageErrorRate:
        Math.round((metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length) * 100) / 100,
      uptime: process.uptime(),
    };
  }

  // Backup system state
  @Cron(CronExpression.EVERY_HOUR)
  backupSystemState() {
    const healthStatus = this.getHealthStatus();
    const systemStats = this.getSystemStats();

    this.auditService.logAction({
      action: 'SYSTEM_BACKUP',
      resource: 'monitoring',
      ip: 'system',
      success: true,
      details: {
        healthStatus: healthStatus.status,
        systemStats,
        alertsCount: this.alerts.length,
      },
      severity: 'low',
    });

    this.logger.log('System state backed up', {
      status: healthStatus.status,
      alerts: this.alerts.length,
    });
  }

  // Generate monitoring report
  generateReport(hours: number = 24) {
    const metrics = this.getMetrics(hours);
    const systemStats = this.getSystemStats();
    const healthStatus = this.getHealthStatus();
    const securityStats = this.securityService.getSecurityStats();
    const auditStats = this.auditService.getAuditStats();

    return {
      reportGenerated: new Date().toISOString(),
      period: `${hours} hours`,
      summary: {
        overallHealth: healthStatus.status,
        totalAlerts: this.alerts.length,
        dataPoints: metrics.length,
      },
      performance: systemStats,
      security: {
        totalEvents: securityStats.totalEvents,
        criticalEvents: securityStats.eventsBySeverity.critical || 0,
        highSeverityEvents: securityStats.eventsBySeverity.high || 0,
        blockedIPs: this.rateLimitService.getBlockedIPs().length,
      },
      audit: {
        totalLogs: auditStats.totalLogs,
        successRate: auditStats.successRate,
        topActions: Object.entries(auditStats.logsByAction)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count })),
      },
      alerts: this.alerts,
      recommendations: this.generateRecommendations(systemStats, healthStatus),
    };
  }

  private generateRecommendations(stats: any, health: HealthStatus): string[] {
    const recommendations: string[] = [];

    if (stats.averageMemoryUsage > 70) {
      recommendations.push('Consider increasing memory allocation or optimizing memory usage');
    }

    if (stats.averageCpuUsage > 60) {
      recommendations.push('Monitor CPU-intensive operations and consider optimization');
    }

    if (stats.averageErrorRate > 2) {
      recommendations.push('Investigate and address sources of errors');
    }

    if (health.alerts.length > 0) {
      recommendations.push('Address current system alerts to improve stability');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well, continue monitoring');
    }

    return recommendations;
  }
}
