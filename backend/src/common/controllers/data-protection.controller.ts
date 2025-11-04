import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole as Role } from '../../shared-types';
import { DataProtectionService } from '../services/data-protection.service';
import { SecurityGuard } from '../guards/security.guard';

@ApiTags('Data Protection')
@Controller('data-protection')
@UseGuards(JwtAuthGuard, RolesGuard, SecurityGuard)
@ApiBearerAuth()
export class DataProtectionController {
  constructor(private dataProtectionService: DataProtectionService) {}

  @Post('gdpr/export/:userId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export user data for GDPR compliance' })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  async exportUserData(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string }; ip: string },
  ) {
    const exportData = await this.dataProtectionService.exportUserData(userId, req.user.id, req.ip);

    return {
      message: 'User data exported successfully',
      data: exportData,
    };
  }

  @Delete('gdpr/delete/:userId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user data for GDPR compliance' })
  @ApiResponse({ status: 200, description: 'User data deleted successfully' })
  async deleteUserData(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string }; ip: string },
  ) {
    const result = await this.dataProtectionService.deleteUserData(userId, req.user.id, req.ip);

    return {
      message: 'User data deletion completed',
      ...result,
    };
  }

  @Post('gdpr/anonymize/:userId')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anonymize user data' })
  @ApiResponse({ status: 200, description: 'User data anonymized successfully' })
  anonymizeUserData(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string }; ip: string },
  ) {
    const result = this.dataProtectionService.anonymizeUserData(userId, req.user.id, req.ip);

    return {
      message: 'User data anonymized successfully',
      ...result,
    };
  }

  @Post('retention/apply')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply data retention policy' })
  @ApiResponse({ status: 200, description: 'Data retention policy applied successfully' })
  applyRetentionPolicy() {
    const result = this.dataProtectionService.applyRetentionPolicy();

    return {
      message: 'Data retention policy applied',
      ...result,
    };
  }

  @Get('report')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get data processing report' })
  @ApiResponse({ status: 200, description: 'Data processing report generated successfully' })
  getDataProcessingReport() {
    const report = this.dataProtectionService.generateDataProcessingReport();

    return {
      message: 'Data processing report generated',
      report,
      generatedAt: new Date().toISOString(),
    };
  }

  @Post('encrypt')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Encrypt sensitive data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  encryptData(@Body() body: { data: string }) {
    const result = this.dataProtectionService.encryptSensitiveData(body.data);

    return {
      message: 'Data encrypted successfully',
      encryptedData: result,
    };
  }

  @Post('decrypt')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Decrypt sensitive data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  decryptData(@Body() body: { encryptedData: string; iv: string; tag: string }) {
    const decryptedData = this.dataProtectionService.decryptSensitiveData({
      encryptedData: body.encryptedData,
      iv: body.iv,
      tag: body.tag,
    });

    return {
      message: 'Data decrypted successfully',
      data: decryptedData,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Data protection health check' })
  @ApiResponse({ status: 200, description: 'Data protection system is healthy' })
  healthCheck() {
    const report = this.dataProtectionService.generateDataProcessingReport();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: report.totalUsers,
        encryptedFields: report.encryptedFields,
        gdprRequestsTotal:
          report.gdprRequests.exports +
          report.gdprRequests.deletions +
          report.gdprRequests.anonymizations,
        retentionCompliance: report.retentionCompliance.compliantRecords,
      },
    };
  }
}
