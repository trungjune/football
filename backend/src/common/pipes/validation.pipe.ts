import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SecurityService } from '../services/security.service';
import { SanitizerUtil } from '../utils/sanitizer.util';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  private readonly logger = new Logger(ValidationPipe.name);

  constructor(private securityService: SecurityService) {}

  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return this.sanitizeInput(value);
    }

    // Sanitize input before validation
    const sanitizedValue = this.sanitizeInput(value);

    const object = plainToInstance(metatype, sanitizedValue);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      });

      this.logger.warn(`Validation failed: ${errorMessages.join('; ')}`);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: (new (...args: unknown[]) => unknown)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeInput(value: unknown): unknown {
    if (typeof value === 'string') {
      // Use security service for comprehensive sanitization
      const sanitized = this.securityService.sanitizeInput(value);

      // Additional sanitization using our utility
      return SanitizerUtil.sanitizeInput(sanitized);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }

    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[this.sanitizeInput(key) as string] = this.sanitizeInput(val);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeSqlInjection(input: string): string {
    return SanitizerUtil.sanitizeSql(input);
  }
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);

  constructor(private securityService: SecurityService) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      return file;
    }

    // Use security service for comprehensive file validation
    const validation = this.securityService.validateFileUpload(file);

    if (!validation.isValid) {
      this.logger.warn(`File validation failed: ${validation.errors.join(', ')}`);
      throw new BadRequestException(`File validation failed: ${validation.errors.join(', ')}`);
    }

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    if (sanitizedFilename !== file.originalname) {
      this.logger.warn(`Filename sanitized: ${file.originalname} -> ${sanitizedFilename}`);
      file.originalname = sanitizedFilename;
    }

    return file;
  }

  private sanitizeFilename(filename: string): string {
    // Remove dangerous characters and patterns
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.{2,}/g, '.') // Remove multiple dots
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .substring(0, 255); // Limit length
  }
}
