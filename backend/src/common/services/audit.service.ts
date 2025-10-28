import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly auditLogs: AuditLog[] = [];
  private readonly maxLogs = 50000; // Keep last 50k logs in memory

  constructor(private configService: ConfigService) {}

  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...log,
    };

    this.auditLogs.push(auditLog);

    // Keep only the last maxLogs entries
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs.shift();
    }

    // Log to console based on severity
    const logMessage = `AUDIT [${log.action}]: User ${log.userId || 'anonymous'} ${log.success ? 'successfully' : 'failed to'} ${log.action} ${log.resource}${log.resourceId ? ` (${log.resourceId})` : ''} from ${log.ip}`;

    switch (log.severity) {
      case 'critical':
        this.logger.error(logMessage, log.details);
        break;
      case 'high':
        this.logger.warn(logMessage, log.details);
        break;
      case 'medium':
        this.logger.log(logMessage);
        break;
      case 'low':
        this.logger.debug(logMessage);
        break;
    }
  }

  // Authentication events
  logLogin(userId: string, ip: string, userAgent: string, success: boolean, details?: any) {
    this.logAction({
      userId,
      action: 'LOGIN',
      resource: 'auth',
      ip,
      userAgent,
      success,
      details,
      severity: success ? 'low' : 'medium',
    });
  }

  logLogout(userId: string, ip: string, userAgent: string) {
    this.logAction({
      userId,
      action: 'LOGOUT',
      resource: 'auth',
      ip,
      userAgent,
      success: true,
      severity: 'low',
    });
  }

  logPasswordChange(userId: string, ip: string, userAgent: string, success: boolean) {
    this.logAction({
      userId,
      action: 'PASSWORD_CHANGE',
      resource: 'auth',
      ip,
      userAgent,
      success,
      severity: 'medium',
    });
  }

  // Data access events
  logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    ip: string,
    success: boolean,
  ) {
    this.logAction({
      userId,
      action: `${action.toUpperCase()}_${resource.toUpperCase()}`,
      resource,
      resourceId,
      ip,
      success,
      severity: 'low',
    });
  }

  // Administrative events
  logAdminAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    ip: string,
    success: boolean,
    details?: any,
  ) {
    this.logAction({
      userId,
      action: action.toUpperCase(),
      resource,
      resourceId,
      ip,
      success,
      details,
      severity: 'high',
    });
  }

  // Security events
  logSecurityEvent(action: string, ip: string, userAgent: string, details: any) {
    this.logAction({
      action: action.toUpperCase(),
      resource: 'security',
      ip,
      userAgent,
      success: false,
      details,
      severity: 'high',
    });
  }

  // File operations
  logFileOperation(
    userId: string,
    action: string,
    filename: string,
    ip: string,
    success: boolean,
    details?: any,
  ) {
    this.logAction({
      userId,
      action: `FILE_${action.toUpperCase()}`,
      resource: 'file',
      resourceId: filename,
      ip,
      success,
      details,
      severity: 'medium',
    });
  }

  // Query audit logs
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    severity?: AuditLog['severity'];
    limit?: number;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action.includes(filters.action!.toUpperCase()));
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
      }
      if (filters.severity) {
        logs = logs.filter(log => log.severity === filters.severity);
      }
      if (filters.limit) {
        logs = logs.slice(0, filters.limit);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get audit statistics
  getAuditStats(): {
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByResource: Record<string, number>;
    logsBySeverity: Record<string, number>;
    successRate: number;
    topUsers: Array<{ userId: string; count: number }>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const logsByAction: Record<string, number> = {};
    const logsByResource: Record<string, number> = {};
    const logsBySeverity: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};
    let successCount = 0;

    for (const log of this.auditLogs) {
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
      logsByResource[log.resource] = (logsByResource[log.resource] || 0) + 1;
      logsBySeverity[log.severity] = (logsBySeverity[log.severity] || 0) + 1;

      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }

      ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;

      if (log.success) {
        successCount++;
      }
    }

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: this.auditLogs.length,
      logsByAction,
      logsByResource,
      logsBySeverity,
      successRate: this.auditLogs.length > 0 ? (successCount / this.auditLogs.length) * 100 : 0,
      topUsers,
      topIPs,
    };
  }
}
