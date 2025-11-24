import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole as Role } from '../shared-types';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  @ApiOperation({ summary: 'Get application settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @Get()
  async getSettings() {
    // Trả về settings mặc định
    return {
      teamName: 'FC Vui Vẻ',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi',
      notifications: {
        email: true,
        push: true,
      },
      finance: {
        defaultMonthlyFee: 200000,
        defaultStudentFee: 100000,
      },
    };
  }

  @ApiOperation({ summary: 'Update application settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put()
  async updateSettings(@Body() settings: Record<string, unknown>) {
    // Tạm thời chỉ return lại settings
    // Trong tương lai có thể lưu vào database
    return {
      message: 'Settings updated successfully',
      settings,
    };
  }
}
