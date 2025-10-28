import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityService } from './services/security.service';
import { RateLimitService } from './services/rate-limit.service';
import { AuditService } from './services/audit.service';
import { DataProtectionService } from './services/data-protection.service';
import { SecurityGuard } from './guards/security.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ValidationPipe, FileValidationPipe } from './pipes/validation.pipe';
import { SecurityMiddleware } from './middleware/security.middleware';
import { SecurityController } from './controllers/security.controller';
import { DataProtectionController } from './controllers/data-protection.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SecurityService,
    RateLimitService,
    AuditService,
    DataProtectionService,
    SecurityGuard,
    JwtAuthGuard,
    RolesGuard,
    ValidationPipe,
    FileValidationPipe,
    SecurityMiddleware,
  ],
  controllers: [SecurityController, DataProtectionController],
  exports: [
    SecurityService,
    RateLimitService,
    AuditService,
    DataProtectionService,
    SecurityGuard,
    JwtAuthGuard,
    RolesGuard,
    ValidationPipe,
    FileValidationPipe,
    SecurityMiddleware,
  ],
})
export class SecurityModule {}
