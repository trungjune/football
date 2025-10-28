import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type:
    | 'suspicious_request'
    | 'rate_limit_exceeded'
    | 'auth_failure'
    | 'blocked_ip'
    | 'file_upload';
  ip: string;
  userAgent?: string;
  endpoint?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly securityEvents: SecurityEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events in memory

  constructor(private configService: ConfigService) {}

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event,
    };

    this.securityEvents.push(securityEvent);

    // Keep only the last maxEvents
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents.shift();
    }

    // Log based on severity
    const logMessage = `Security Event [${event.type}]: ${event.ip} - ${JSON.stringify(event.details)}`;

    switch (event.severity) {
      case 'critical':
        this.logger.error(logMessage);
        break;
      case 'high':
        this.logger.warn(logMessage);
        break;
      case 'medium':
        this.logger.log(logMessage);
        break;
      case 'low':
        this.logger.debug(logMessage);
        break;
    }
  }

  detectSuspiciousPatterns(input: string): { isSuspicious: boolean; patterns: string[] } {
    const suspiciousPatterns = [
      // SQL Injection
      {
        pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        name: 'SQL_INJECTION',
      },
      { pattern: /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i, name: 'SQL_TAUTOLOGY' },
      { pattern: /(--|\/\*|\*\/)/, name: 'SQL_COMMENT' },
      { pattern: /(\b(EXEC|EXECUTE)\s*\()/i, name: 'SQL_EXEC' },

      // XSS
      { pattern: /<script[^>]*>.*?<\/script>/gi, name: 'XSS_SCRIPT' },
      { pattern: /javascript:/i, name: 'XSS_JAVASCRIPT' },
      { pattern: /vbscript:/i, name: 'XSS_VBSCRIPT' },
      { pattern: /on\w+\s*=/i, name: 'XSS_EVENT_HANDLER' },

      // Path Traversal
      { pattern: /\.\.\//g, name: 'PATH_TRAVERSAL_UNIX' },
      { pattern: /\.\.\\/g, name: 'PATH_TRAVERSAL_WINDOWS' },

      // Command Injection
      { pattern: /;\s*(cat|ls|pwd|whoami|id|uname|rm|mv|cp)/i, name: 'COMMAND_INJECTION' },
      { pattern: /\|\s*(cat|ls|pwd|whoami|id|uname|rm|mv|cp)/i, name: 'PIPE_INJECTION' },
      { pattern: /`.*`/g, name: 'BACKTICK_INJECTION' },
      { pattern: /\$\(.*\)/g, name: 'SUBSHELL_INJECTION' },

      // LDAP Injection
      { pattern: /\(\s*\|\s*\(/i, name: 'LDAP_INJECTION' },

      // NoSQL Injection
      { pattern: /\$where/i, name: 'NOSQL_WHERE' },
      { pattern: /\$ne/i, name: 'NOSQL_NOT_EQUAL' },

      // File inclusion
      { pattern: /\b(file|http|https|ftp):\/\//i, name: 'FILE_INCLUSION' },
    ];

    const detectedPatterns: string[] = [];

    for (const { pattern, name } of suspiciousPatterns) {
      if (pattern.test(input)) {
        detectedPatterns.push(name);
      }
    }

    return {
      isSuspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns,
    };
  }

  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Encode dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove control characters except tab, newline, and carriage return
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  validateFileUpload(file: Express.Multer.File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check filename for suspicious patterns
    const { isSuspicious, patterns } = this.detectSuspiciousPatterns(file.originalname);
    if (isSuspicious) {
      errors.push(`Suspicious filename patterns detected: ${patterns.join(', ')}`);
    }

    // Check for double extensions
    const filename = file.originalname.toLowerCase();
    const doubleExtensions = ['.php.jpg', '.asp.png', '.jsp.gif', '.exe.pdf'];
    if (doubleExtensions.some(ext => filename.includes(ext))) {
      errors.push('Double file extensions are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashSensitiveData(data: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifySensitiveData(data: string, hashedData: string): boolean {
    const [salt, hash] = hashedData.split(':');
    const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  getSecurityEvents(filters?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    ip?: string;
    startDate?: Date;
    endDate?: Date;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filters) {
      if (filters.type) {
        events = events.filter(event => event.type === filters.type);
      }
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity);
      }
      if (filters.ip) {
        events = events.filter(event => event.ip === filters.ip);
      }
      if (filters.startDate) {
        events = events.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    for (const event of this.securityEvents) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
    }

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs,
    };
  }
}
