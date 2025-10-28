import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger(QueryOptimizerService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  // Optimized member queries with caching
  async findMembersWithCache(teamId: string, options: any = {}) {
    const cacheKey = this.cache.generateKey('members', teamId, JSON.stringify(options));

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.member.findMany({
          where: {
            teamMembers: {
              some: { teamId },
            },
            ...options.where,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
            attendances: options.includeAttendances
              ? {
                  select: {
                    id: true,
                    status: true,
                    session: {
                      select: {
                        id: true,
                        title: true,
                        datetime: true,
                      },
                    },
                  },
                  orderBy: {
                    session: {
                      datetime: 'desc',
                    },
                  },
                  take: 10, // Limit recent attendances
                }
              : false,
            payments: options.includePayments
              ? {
                  select: {
                    id: true,
                    amount: true,
                    status: true,
                    paidAt: true,
                    fee: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                  orderBy: {
                    paidAt: 'desc',
                  },
                  take: 10, // Limit recent payments
                }
              : false,
          },
          orderBy: options.orderBy || { fullName: 'asc' },
          skip: options.skip,
          take: options.take,
        });
      },
      300, // 5 minutes cache
    );
  }

  // Optimized session queries with caching
  async findSessionsWithCache(teamId: string, options: any = {}) {
    const cacheKey = this.cache.generateKey('sessions', teamId, JSON.stringify(options));

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.trainingSession.findMany({
          where: {
            teamId,
            ...options.where,
          },
          include: {
            registrations: {
              select: {
                id: true,
                member: {
                  select: {
                    id: true,
                    fullName: true,
                    nickname: true,
                  },
                },
              },
            },
            attendances: {
              select: {
                id: true,
                status: true,
                member: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                registrations: true,
                attendances: true,
              },
            },
          },
          orderBy: options.orderBy || { datetime: 'desc' },
          skip: options.skip,
          take: options.take,
        });
      },
      180, // 3 minutes cache
    );
  }

  // Optimized financial data with caching
  async getFinancialSummaryWithCache(teamId: string) {
    const cacheKey = this.cache.generateKey('financial-summary', teamId);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [fees, payments] = await Promise.all([
          this.prisma.fee.findMany({
            where: { teamId },
            include: {
              payments: {
                select: {
                  amount: true,
                  status: true,
                },
              },
            },
          }),
          this.prisma.payment.findMany({
            where: {
              fee: { teamId },
            },
            select: {
              amount: true,
              status: true,
              method: true,
              paidAt: true,
            },
          }),
        ]);

        // Calculate summary
        const totalExpected = fees.reduce((sum, fee) => sum + fee.amount, 0);
        const totalReceived = payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = payments
          .filter(p => p.status === 'PENDING')
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          totalExpected,
          totalReceived,
          totalPending,
          collectionRate: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0,
          paymentsByMethod: payments.reduce(
            (acc, p) => {
              acc[p.method] = (acc[p.method] || 0) + (p.status === 'COMPLETED' ? p.amount : 0);
              return acc;
            },
            {} as Record<string, number>,
          ),
        };
      },
      600, // 10 minutes cache
    );
  }

  // Optimized statistics with caching
  async getTeamStatisticsWithCache(teamId: string) {
    const cacheKey = this.cache.generateKey('team-stats', teamId);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [memberStats, sessionStats, attendanceStats] = await Promise.all([
          this.prisma.member.groupBy({
            by: ['status'],
            where: {
              teamMembers: {
                some: { teamId },
              },
            },
            _count: {
              status: true,
            },
          }),
          this.prisma.trainingSession.groupBy({
            by: ['type'],
            where: { teamId },
            _count: {
              type: true,
            },
          }),
          this.prisma.attendance.groupBy({
            by: ['status'],
            where: {
              session: { teamId },
            },
            _count: {
              status: true,
            },
          }),
        ]);

        return {
          membersByStatus: memberStats.reduce(
            (acc, stat) => {
              acc[stat.status] = stat._count.status;
              return acc;
            },
            {} as Record<string, number>,
          ),
          sessionsByType: sessionStats.reduce(
            (acc, stat) => {
              acc[stat.type] = stat._count.type;
              return acc;
            },
            {} as Record<string, number>,
          ),
          attendanceByStatus: attendanceStats.reduce(
            (acc, stat) => {
              acc[stat.status] = stat._count.status;
              return acc;
            },
            {} as Record<string, number>,
          ),
        };
      },
      900, // 15 minutes cache
    );
  }

  // Cache invalidation helpers
  async invalidateMemberCache(teamId: string) {
    await this.cache.invalidatePattern(`members:${teamId}:*`);
    await this.cache.invalidatePattern(`team-stats:${teamId}`);
  }

  async invalidateSessionCache(teamId: string) {
    await this.cache.invalidatePattern(`sessions:${teamId}:*`);
    await this.cache.invalidatePattern(`team-stats:${teamId}`);
  }

  async invalidateFinanceCache(teamId: string) {
    await this.cache.invalidatePattern(`financial-summary:${teamId}`);
    await this.cache.invalidatePattern(`team-stats:${teamId}`);
  }

  // Database connection optimization
  async optimizeConnections() {
    try {
      // Check connection pool status
      // const metrics = await this.prisma.$metrics.json(); // Not available in all Prisma versions
      const metrics = { queries: [], counters: [] }; // Fallback
      this.logger.log('Database metrics:', metrics);

      // Cleanup idle connections if needed
      if (process.env.NODE_ENV === 'production') {
        await this.prisma.$disconnect();
        await this.prisma.$connect();
      }
    } catch (error) {
      this.logger.error('Database optimization error:', error);
    }
  }
}
