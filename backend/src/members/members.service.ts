import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, MemberSearchDto } from './dto/member.dto';
import { Member, Prisma } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMemberDto: CreateMemberDto): Promise<Member> {
    // Check if user already has a member profile
    const existingMember = await this.prisma.member.findUnique({
      where: { userId },
    });

    if (existingMember) {
      throw new ConflictException('User already has a member profile');
    }

    const member = await this.prisma.member.create({
      data: {
        userId,
        ...createMemberDto,
        dateOfBirth: createMemberDto.dateOfBirth ? new Date(createMemberDto.dateOfBirth) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return member;
  }

  async findAll(searchDto: MemberSearchDto) {
    const {
      search,
      position,
      status,
      memberType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MemberWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (position) {
      where.position = position;
    }

    if (status) {
      where.status = status;
    }

    if (memberType) {
      where.memberType = memberType;
    }

    // Build orderBy clause
    const orderBy: Prisma.MemberOrderByWithRelationInput = {};
    if (sortBy === 'email') {
      orderBy.user = { email: sortOrder };
    } else {
      orderBy[sortBy as keyof Prisma.MemberOrderByWithRelationInput] = sortOrder;
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          _count: {
            select: {
              attendances: true,
              payments: true,
            },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        attendances: {
          include: {
            session: {
              select: {
                id: true,
                title: true,
                datetime: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        payments: {
          include: {
            fee: {
              select: {
                id: true,
                title: true,
                amount: true,
                type: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            attendances: true,
            payments: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async findByUserId(userId: string): Promise<Member | null> {
    return this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException('Member not found');
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: {
        ...updateMemberDto,
        dateOfBirth: updateMemberDto.dateOfBirth
          ? new Date(updateMemberDto.dateOfBirth)
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return member;
  }

  async remove(id: string): Promise<void> {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.member.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalMembers, activeMembers, inactiveMembers, positionStats, memberTypeStats] =
      await Promise.all([
        this.prisma.member.count(),
        this.prisma.member.count({ where: { status: 'ACTIVE' } }),
        this.prisma.member.count({ where: { status: 'INACTIVE' } }),
        this.prisma.member.groupBy({
          by: ['position'],
          _count: {
            position: true,
          },
        }),
        this.prisma.member.groupBy({
          by: ['memberType'],
          _count: {
            memberType: true,
          },
        }),
      ]);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      positionStats: positionStats.map(stat => ({
        position: stat.position,
        count: stat._count.position,
      })),
      memberTypeStats: memberTypeStats.map(stat => ({
        memberType: stat.memberType,
        count: stat._count.memberType,
      })),
    };
  }

  async assignToTeam(teamId: string, memberIds: string[]): Promise<void> {
    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if all members exist
    const members = await this.prisma.member.findMany({
      where: {
        id: { in: memberIds },
      },
      include: {
        user: true,
      },
    });

    if (members.length !== memberIds.length) {
      throw new NotFoundException('Some members not found');
    }

    // Create team member relationships
    const teamMemberData = members.map(member => ({
      teamId,
      userId: member.userId,
      memberId: member.id,
    }));

    await this.prisma.teamMember.createMany({
      data: teamMemberData,
      skipDuplicates: true,
    });
  }

  async removeFromTeam(teamId: string, memberIds: string[]): Promise<void> {
    await this.prisma.teamMember.deleteMany({
      where: {
        teamId,
        memberId: { in: memberIds },
      },
    });
  }

  async getMemberProfile(userId: string) {
    // Get member profile
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    // Get upcoming sessions (next 7 days)
    const upcomingSessions = await this.prisma.trainingSession.findMany({
      where: {
        datetime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        registrations: {
          where: { memberId: member.id },
          select: { id: true },
        },
      },
      orderBy: { datetime: 'asc' },
      take: 5,
    });

    // Get payment statistics
    const payments = await this.prisma.payment.findMany({
      where: { memberId: member.id },
      include: {
        fee: {
          select: {
            title: true,
            amount: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalPaid = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    // Get unpaid fees
    const unpaidFees = await this.prisma.fee.findMany({
      where: {
        payments: {
          none: {
            memberId: member.id,
            status: 'COMPLETED',
          },
        },
        dueDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const totalOwed = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Get attendance statistics
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const attendanceThisMonth = await this.prisma.attendance.count({
      where: {
        memberId: member.id,
        status: 'PRESENT',
        session: {
          datetime: {
            gte: thisMonth,
          },
        },
      },
    });

    const totalAttendance = await this.prisma.attendance.count({
      where: {
        memberId: member.id,
        status: 'PRESENT',
      },
    });

    const totalSessions = await this.prisma.registration.count({
      where: {
        memberId: member.id,
      },
    });

    const attendanceRate =
      totalSessions > 0 ? Math.round((totalAttendance / totalSessions) * 100) : 0;

    return {
      profile: {
        fullName: member.fullName,
        position: member.position,
        memberType: member.memberType,
        joinDate: member.createdAt,
      },
      upcomingSessions: upcomingSessions.map(session => ({
        id: session.id,
        title: session.title,
        datetime: session.datetime,
        location: session.location,
        registered: session.registrations.length > 0,
      })),
      payments: {
        totalPaid,
        totalOwed,
        recentPayments: payments
          .filter(p => p.status === 'COMPLETED')
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            title: p.fee.title,
            amount: p.amount,
            paidAt: p.paidAt,
          })),
      },
      attendance: {
        thisMonth: attendanceThisMonth,
        total: totalAttendance,
        rate: attendanceRate,
      },
    };
  }
}
