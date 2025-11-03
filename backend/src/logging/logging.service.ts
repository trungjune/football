import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  trace?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CustomLoggingService implements LoggerService {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 10000; // Keep last 10k logs in memory
  private readonly logLevel: LogLevel;

  constructor(private configService: ConfigService) {
    this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', 'log');
  }

  log(message: string | object, context?: string) {
    this.writeLog('log', message, context);
  }

  error(message: string | object, trace?: string, context?: string) {
    this.writeLog('error', message, context, trace);
  }

  warn(message: string | object, context?: string) {
    this.writeLog('warn', message, context);
  }

  debug(message: string | object, context?: string) {
    this.writeLog('debug', message, context);
  }

  verbose(message: string | object, context?: string) {
    this.writeLog('verbose', message, context);
  }

  private writeLog(level: LogLevel, message: string | object, context?: string, trace?: string) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context,
      trace,
      metadata: typeof message === 'object' ? message : undefined,
    };

    // Add to memory store
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console in production format
    this.outputLog(logEntry);
  }

  private outputLog(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(7);
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;

    if (process.env.NODE_ENV === 'production') {
      // Structured JSON logging for production
      const logObject = {
        timestamp,
        level: entry.level,
        message,
        context: entry.context,
        trace: entry.trace,
        metadata: entry.metadata,
        pid: process.pid,
        hostname: process.env.VERCEL_REGION || 'unknown',
      };

      console.log(JSON.stringify(logObject));
    } else {
      // Human-readable logging for development
      const colorCode = this.getColorCode(entry.level);
      const resetCode = '\x1b[0m';

      console.log(`${colorCode}[${timestamp}] ${level}${resetCode} ${context} ${message}`);

      if (entry.trace) {
        console.log(`${colorCode}${entry.trace}${resetCode}`);
      }
    }
  }

  private getColorCode(level: LogLevel): string {
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      log: '\x1b[32m', // Green
      debug: '\x1b[36m', // Cyan
      verbose: '\x1b[35m', // Magenta
    };
    return colors[level] || '\x1b[0m';
  }

  // Get logs for monitoring
  getLogs(
    level?: LogLevel,
    context?: string,
    limit?: number,
    startDate?: Date,
    endDate?: Date,
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (context) {
      filteredLogs = filteredLogs.filter(log => log.context === context);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (limit) {
      filteredLogs = filteredLogs.slice(0, limit);
    }

    return filteredLogs;
  }

  // Get log statistics
  getLogStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByContext: Record<string, number>;
    errorRate: number;
    recentErrors: LogEntry[];
  } {
    const logsByLevel: Record<LogLevel, number> = {
      error: 0,
      warn: 0,
      log: 0,
      debug: 0,
      verbose: 0,
      fatal: 0,
    };

    const logsByContext: Record<string, number> = {};

    for (const log of this.logs) {
      logsByLevel[log.level]++;

      if (log.context) {
        logsByContext[log.context] = (logsByContext[log.context] || 0) + 1;
      }
    }

    const totalLogs = this.logs.length;
    const errorCount = logsByLevel.error + logsByLevel.warn;
    const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;

    const recentErrors = this.logs
      .filter(log => log.level === 'error' || log.level === 'warn')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalLogs,
      logsByLevel,
      logsByContext,
      errorRate: Math.round(errorRate * 100) / 100,
      recentErrors,
    };
  }

  // Clear old logs
  clearOldLogs(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialCount = this.logs.length;

    this.logs = this.logs.filter(log => log.timestamp >= cutoff);

    const clearedCount = initialCount - this.logs.length;

    if (clearedCount > 0) {
      this.log(`Cleared ${clearedCount} old log entries`, 'LoggingService');
    }

    return clearedCount;
  }

  // Export logs for backup
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,level,context,message,trace';
      const rows = this.logs.map(
        log =>
          `${log.timestamp.toISOString()},${log.level},${log.context || ''},${log.message.replace(/,/g, ';')},${log.trace || ''}`,
      );
      return [headers, ...rows].join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }
}
