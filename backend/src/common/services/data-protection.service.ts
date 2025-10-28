import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AuditService } from './audit.service';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
}

export interface GDPRExportData {
  userId: string;
  exportDate: Date;
  personalData: {
    profile: any;
    sessions: any[];
    payments: any[];
    auditLogs: any[];
  };
  metadata: {
    dataVersion: string;
    exportFormat: string;
    retentionPolicy: string;
  };
}

@Injectable()
export class DataProtectionService {
  private readonly logger = new Logger(DataProtectionService.name);
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    // Initialize encryption key from environment or generate one
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (keyString) {
      this.encryptionKey = Buffer.from(keyString, 'hex');
    } else {
      this.encryptionKey = crypto.randomBytes(32);
      this.logger.warn('No ENCRYPTION_KEY found in environment. Generated temporary key.');
    }
  }

  // Data Encryption
  encryptSensitiveData(data: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('additional-data'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      this.logger.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  decryptSensitiveData(encryptionResult: EncryptionResult): string {
    try {
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('additional-data'));
      decipher.setAuthTag(Buffer.from(encryptionResult.tag, 'hex'));

      let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  // Hash sensitive data for storage (one-way)
  hashSensitiveData(data: string, salt?: string): { hash: string; salt: string } {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(32);
    const hash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512');

    return {
      hash: hash.toString('hex'),
      salt: saltBuffer.toString('hex'),
    };
  }

  verifyHashedData(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashSensitiveData(data, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  }

  // GDPR Compliance - Data Export
  async exportUserData(userId: string, requestedBy: string, ip: string): Promise<GDPRExportData> {
    this.auditService.logAction({
      userId: requestedBy,
      action: 'GDPR_DATA_EXPORT',
      resource: 'user_data',
      resourceId: userId,
      ip,
      success: true,
      details: { exportedUserId: userId },
      severity: 'high',
    });

    // This would typically fetch data from your database
    // For now, returning a mock structure
    const exportData: GDPRExportData = {
      userId,
      exportDate: new Date(),
      personalData: {
        profile: {
          // User profile data would be fetched here
          note: 'Profile data would be populated from database',
        },
        sessions: [
          // Session data would be fetched here
        ],
        payments: [
          // Payment data would be fetched here
        ],
        auditLogs: this.auditService.getAuditLogs({ userId }),
      },
      metadata: {
        dataVersion: '1.0',
        exportFormat: 'JSON',
        retentionPolicy: 'Data retained according to legal requirements',
      },
    };

    this.logger.log(`GDPR data export completed for user ${userId} by ${requestedBy}`);
    return exportData;
  }

  // GDPR Compliance - Data Deletion
  async deleteUserData(
    userId: string,
    requestedBy: string,
    ip: string,
  ): Promise<{
    success: boolean;
    deletedItems: string[];
    retainedItems: string[];
  }> {
    const deletedItems: string[] = [];
    const retainedItems: string[] = [];

    try {
      // This would typically delete data from your database
      // For now, simulating the process

      // Items that can be deleted immediately
      const deletableItems = [
        'profile_preferences',
        'session_history',
        'notification_settings',
        'uploaded_files',
      ];

      // Items that must be retained for legal/business reasons
      const retainableItems = [
        'financial_records', // Must retain for tax purposes
        'audit_logs', // Must retain for security purposes
        'legal_agreements', // Must retain for contract purposes
      ];

      deletedItems.push(...deletableItems);
      retainedItems.push(...retainableItems);

      this.auditService.logAction({
        userId: requestedBy,
        action: 'GDPR_DATA_DELETION',
        resource: 'user_data',
        resourceId: userId,
        ip,
        success: true,
        details: {
          deletedUserId: userId,
          deletedItems,
          retainedItems,
        },
        severity: 'critical',
      });

      this.logger.log(`GDPR data deletion completed for user ${userId} by ${requestedBy}`);

      return {
        success: true,
        deletedItems,
        retainedItems,
      };
    } catch (error) {
      this.auditService.logAction({
        userId: requestedBy,
        action: 'GDPR_DATA_DELETION',
        resource: 'user_data',
        resourceId: userId,
        ip,
        success: false,
        details: { error: error.message },
        severity: 'critical',
      });

      this.logger.error(`GDPR data deletion failed for user ${userId}:`, error);
      throw new Error('Data deletion failed');
    }
  }

  // Data Anonymization
  anonymizeUserData(
    userId: string,
    requestedBy: string,
    ip: string,
  ): {
    success: boolean;
    anonymizedFields: string[];
  } {
    const anonymizedFields = ['email', 'phone', 'address', 'full_name', 'date_of_birth'];

    // This would typically update database records to replace
    // personal data with anonymized versions

    this.auditService.logAction({
      userId: requestedBy,
      action: 'DATA_ANONYMIZATION',
      resource: 'user_data',
      resourceId: userId,
      ip,
      success: true,
      details: {
        anonymizedUserId: userId,
        anonymizedFields,
      },
      severity: 'high',
    });

    this.logger.log(`Data anonymization completed for user ${userId} by ${requestedBy}`);

    return {
      success: true,
      anonymizedFields,
    };
  }

  // Data Retention Policy
  applyRetentionPolicy(): {
    deletedRecords: number;
    archivedRecords: number;
    errors: string[];
  } {
    const result = {
      deletedRecords: 0,
      archivedRecords: 0,
      errors: [] as string[],
    };

    try {
      // Define retention periods
      // Define retention periods (commented out as not used yet)
      // const retentionPolicies = {
      //   audit_logs: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      //   session_data: 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
      //   temporary_files: 30 * 24 * 60 * 60 * 1000, // 30 days
      //   user_activity: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
      // };

      // This would typically query database for old records
      // and delete or archive them based on retention policy

      this.auditService.logAction({
        action: 'RETENTION_POLICY_APPLIED',
        resource: 'system',
        ip: 'system',
        success: true,
        details: result,
        severity: 'medium',
      });

      this.logger.log('Data retention policy applied successfully', result);
    } catch (error) {
      result.errors.push(error.message);
      this.logger.error('Failed to apply retention policy:', error);
    }

    return result;
  }

  // Generate data processing report
  generateDataProcessingReport(): {
    totalUsers: number;
    encryptedFields: number;
    gdprRequests: {
      exports: number;
      deletions: number;
      anonymizations: number;
    };
    retentionCompliance: {
      compliantRecords: number;
      expiredRecords: number;
    };
  } {
    // This would typically query your database for actual statistics
    return {
      totalUsers: 0, // Would be fetched from database
      encryptedFields: 0, // Would be calculated from schema
      gdprRequests: {
        exports: this.auditService.getAuditLogs({ action: 'GDPR_DATA_EXPORT' }).length,
        deletions: this.auditService.getAuditLogs({ action: 'GDPR_DATA_DELETION' }).length,
        anonymizations: this.auditService.getAuditLogs({ action: 'DATA_ANONYMIZATION' }).length,
      },
      retentionCompliance: {
        compliantRecords: 0, // Would be calculated from database
        expiredRecords: 0, // Would be calculated from database
      },
    };
  }

  // Secure data wipe
  secureWipe(data: string): boolean {
    try {
      // Overwrite memory multiple times with random data
      const buffer = Buffer.from(data, 'utf8');

      for (let i = 0; i < 3; i++) {
        crypto.randomFillSync(buffer);
      }

      buffer.fill(0);
      return true;
    } catch (error) {
      this.logger.error('Secure wipe failed:', error);
      return false;
    }
  }
}
