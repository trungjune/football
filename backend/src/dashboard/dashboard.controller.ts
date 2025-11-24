import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Get('stats')
  async getStats() {
    const teamId = 'fc-vui-ve';

    const [totalMembers, upcomingSessions, totalRevenue] = await Promise.all([
      this.prisma.member.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.trainingSession.count({
        where: {
          teamId,
          datetime: { gte: new Date() },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          fee: { teamId },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    // Tính attendance rate (giả định)
    const attendanceRate = 75;

    return {
      totalMembers,
      upcomingSessions,
      totalRevenue: totalRevenue._sum.amount || 0,
      attendanceRate,
    };
  }
}
