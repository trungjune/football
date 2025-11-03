import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get total members
    const totalMembers = await this.prisma.member.count({
      where: { status: 'ACTIVE' },
    });

    // Get upcoming sessions (next 7 days)
    const upcomingSessions = await this.prisma.trainingSession.count({
      where: {
        datetime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get total revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalRevenue = await this.prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate attendance rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalRegistrations = await this.prisma.registration.count({
      where: {
        session: {
          datetime: {
            gte: thirtyDaysAgo,
          },
        },
      },
    });

    const presentAttendances = await this.prisma.attendance.count({
      where: {
        status: 'PRESENT',
        session: {
          datetime: {
            gte: thirtyDaysAgo,
          },
        },
      },
    });

    const attendanceRate =
      totalRegistrations > 0 ? Math.round((presentAttendances / totalRegistrations) * 100) : 0;

    return {
      totalMembers,
      upcomingSessions,
      totalRevenue: totalRevenue._sum.amount || 0,
      attendanceRate,
    };
  }
}
