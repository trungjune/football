import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeDto, UpdateFeeDto, CreatePaymentDto, FinanceSearchDto } from './dto/finance.dto';
// Finance enums replaced with string literals
import { PdfExportService } from './pdf-export.service';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private pdfExportService: PdfExportService,
  ) {}

  // Fee Management
  async createFee(createFeeDto: CreateFeeDto, teamId: string) {
    const { dueDate, ...feeData } = createFeeDto;

    return this.prisma.fee.create({
      data: {
        ...feeData,
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId,
      },
      include: {
        team: true,
        payments: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });
  }

  async findAllFees(searchDto: FinanceSearchDto, teamId?: string) {
    const {
      search,
      type,
      status: _status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const where: any = {};

    if (teamId) {
      where.teamId = teamId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [fees, total] = await Promise.all([
      this.prisma.fee.findMany({
        where,
        include: {
          team: true,
          payments: {
            include: {
              member: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fee.count({ where }),
    ]);

    // Calculate payment statistics for each fee
    const feesWithStats = fees.map(fee => {
      const totalPayments = fee.payments.length;
      const completedPayments = fee.payments.filter(p => p.status === 'COMPLETED').length;
      const totalAmount = fee.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        ...fee,
        stats: {
          totalPayments,
          completedPayments,
          pendingPayments: totalPayments - completedPayments,
          totalAmount,
          completionRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
        },
      };
    });

    return {
      data: feesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findOneFee(id: string) {
    const fee = await this.prisma.fee.findUnique({
      where: { id },
      include: {
        team: true,
        payments: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!fee) {
      throw new NotFoundException('Không tìm thấy khoản phí');
    }

    return fee;
  }

  async updateFee(id: string, updateFeeDto: UpdateFeeDto) {
    await this.findOneFee(id);

    const { dueDate, ...feeData } = updateFeeDto;

    const updateData: any = { ...feeData };

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    return this.prisma.fee.update({
      where: { id },
      data: updateData,
      include: {
        team: true,
        payments: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });
  }

  async removeFee(id: string) {
    await this.findOneFee(id);
    return this.prisma.fee.delete({
      where: { id },
    });
  }

  // Payment Management
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { feeId, memberId, amount, method } = createPaymentDto;

    // Verify fee exists
    const _fee = await this.findOneFee(feeId);

    // Verify member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        feeId,
        memberId,
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Thành viên đã thanh toán khoản phí này');
    }

    return this.prisma.payment.create({
      data: {
        feeId,
        memberId,
        amount,
        method,
        status: 'COMPLETED',
        paidAt: new Date(),
      },
      include: {
        fee: true,
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllPayments(searchDto: FinanceSearchDto, teamId?: string) {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const where: any = {};

    if (teamId) {
      where.fee = {
        teamId,
      };
    }

    if (search) {
      where.OR = [
        { member: { fullName: { contains: search, mode: 'insensitive' } } },
        { fee: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          fee: true,
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePaymentStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'FAILED') {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        fee: true,
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Financial Reports
  async getFinancialSummary(teamId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};

    if (teamId) {
      where.teamId = teamId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [fees, payments] = await Promise.all([
      this.prisma.fee.findMany({
        where,
        include: {
          payments: {
            where: {
              status: 'COMPLETED',
            },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          fee: where,
        },
      }),
    ]);

    const totalExpectedRevenue = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalActualRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalExpectedRevenue - totalActualRevenue;
    const feeTypeBreakdown = fees.reduce(
      (acc, fee) => {
        if (!acc[fee.type]) {
          acc[fee.type] = {
            count: 0,
            expectedAmount: 0,
            actualAmount: 0,
          };
        }
        acc[fee.type].count++;
        acc[fee.type].expectedAmount += fee.amount;
        acc[fee.type].actualAmount += fee.payments.reduce((sum, p) => sum + p.amount, 0);
        return acc;
      },
      {} as Record<'MONTHLY' | 'SPECIAL', any>,
    );

    const paymentMethodBreakdown = payments.reduce(
      (acc, payment) => {
        if (!acc[payment.method]) {
          acc[payment.method] = {
            count: 0,
            amount: 0,
          };
        }
        acc[payment.method].count++;
        acc[payment.method].amount += payment.amount;
        return acc;
      },
      {} as Record<'CASH' | 'BANK_TRANSFER', any>,
    );

    return {
      summary: {
        totalExpectedRevenue,
        totalActualRevenue,
        totalOutstanding,
        collectionRate:
          totalExpectedRevenue > 0 ? (totalActualRevenue / totalExpectedRevenue) * 100 : 0,
      },
      feeTypeBreakdown,
      paymentMethodBreakdown,
      totalFees: fees.length,
      totalPayments: payments.length,
    };
  }

  async getDebtList(teamId?: string) {
    const where: any = {};

    if (teamId) {
      where.teamId = teamId;
    }

    const fees = await this.prisma.fee.findMany({
      where,
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get all team members
    const teamMembers = await this.prisma.member.findMany({
      where: {
        teamMembers: {
          some: {
            team: {
              id: teamId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const debtList = [];

    for (const member of teamMembers) {
      let totalDebt = 0;
      const unpaidFees = [];

      for (const fee of fees) {
        const hasPayment = fee.payments.some(p => p.member.id === member.id);
        if (!hasPayment) {
          totalDebt += fee.amount;
          unpaidFees.push({
            id: fee.id,
            title: fee.title,
            amount: fee.amount,
            dueDate: fee.dueDate,
            type: fee.type,
          });
        }
      }

      if (totalDebt > 0) {
        debtList.push({
          member: {
            id: member.id,
            fullName: member.fullName,
            email: member.user.email,
          },
          totalDebt,
          unpaidFees,
        });
      }
    }

    return debtList.sort((a, b) => b.totalDebt - a.totalDebt);
  }

  // Export functionality
  async exportFinancialReportPdf(
    teamId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Buffer> {
    const financialSummary = await this.getFinancialSummary(teamId, dateFrom, dateTo);
    return this.pdfExportService.generateFinancialReportPdf(financialSummary);
  }

  async exportFinancialReportExcel(
    teamId?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Buffer> {
    const financialSummary = await this.getFinancialSummary(teamId, dateFrom, dateTo);
    return this.pdfExportService.generateFinancialReportExcel(financialSummary);
  }

  async exportDebtReportPdf(teamId?: string): Promise<Buffer> {
    const debtList = await this.getDebtList(teamId);
    return this.pdfExportService.generateDebtReportPdf(debtList);
  }
}
