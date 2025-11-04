import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto, SessionSearchDto } from './dto/session.dto';
import { FootballWebSocketGateway } from '../websocket/websocket.gateway';
// AttendanceStatus enum replaced with string literal

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    @Optional() @Inject('WebSocketGateway') private websocketGateway?: FootballWebSocketGateway,
  ) {}

  async create(createSessionDto: CreateSessionDto, teamId: string) {
    const { registrationDeadline, datetime, ...sessionData } = createSessionDto;

    // Validate dates
    const sessionDate = new Date(datetime);
    const deadline = registrationDeadline ? new Date(registrationDeadline) : null;

    if (sessionDate <= new Date()) {
      throw new BadRequestException('Thời gian buổi tập phải trong tương lai');
    }

    if (deadline && deadline >= sessionDate) {
      throw new BadRequestException('Hạn đăng ký phải trước thời gian buổi tập');
    }

    return this.prisma.trainingSession.create({
      data: {
        title: sessionData.title,
        description: sessionData.description,
        location: sessionData.location,
        type: sessionData.type as any,
        maxParticipants: sessionData.maxParticipants,
        datetime: sessionDate,
        registrationDeadline: deadline,
        team: {
          connect: { id: teamId },
        },
      },
      include: {
        team: true,
        registrations: {
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
        attendances: {
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
            registrations: true,
            attendances: true,
          },
        },
      },
    });
  }

  async findAll(searchDto: SessionSearchDto, teamId?: string) {
    const {
      search,
      type,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'datetime',
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
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      where.datetime = {};
      if (dateFrom) {
        where.datetime.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.datetime.lte = new Date(dateTo);
      }
    }

    const [sessions, total] = await Promise.all([
      this.prisma.trainingSession.findMany({
        where,
        include: {
          team: true,
          registrations: {
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
          attendances: {
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
              registrations: true,
              attendances: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trainingSession.count({ where }),
    ]);

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        team: true,
        registrations: {
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
        attendances: {
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
            registrations: true,
            attendances: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi tập');
    }

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.findOne(id);

    const { registrationDeadline, datetime, ...sessionData } = updateSessionDto;

    const updateData: any = { ...sessionData };

    if (datetime) {
      const sessionDate = new Date(datetime);
      if (sessionDate <= new Date()) {
        throw new BadRequestException('Thời gian buổi tập phải trong tương lai');
      }
      updateData.datetime = sessionDate;
    }

    if (registrationDeadline) {
      const deadline = new Date(registrationDeadline);
      const sessionDate = datetime ? new Date(datetime) : session.datetime;
      if (deadline >= sessionDate) {
        throw new BadRequestException('Hạn đăng ký phải trước thời gian buổi tập');
      }
      updateData.registrationDeadline = deadline;
    }

    return this.prisma.trainingSession.update({
      where: { id },
      data: updateData,
      include: {
        team: true,
        registrations: {
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
        attendances: {
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
            registrations: true,
            attendances: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.trainingSession.delete({
      where: { id },
    });
  }

  async register(sessionId: string, memberId: string) {
    const session = await this.findOne(sessionId);

    // Check if registration deadline has passed
    if (session.registrationDeadline && new Date() > session.registrationDeadline) {
      throw new BadRequestException('Đã hết hạn đăng ký');
    }

    // Check if session is full
    if (session.maxParticipants && session._count.registrations >= session.maxParticipants) {
      throw new BadRequestException('Buổi tập đã đầy');
    }

    // Check if already registered
    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException('Đã đăng ký buổi tập này');
    }

    const registration = await this.prisma.registration.create({
      data: {
        sessionId,
        memberId,
      },
      include: {
        session: true,
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

    // Emit real-time event
    if (this.websocketGateway) {
      this.websocketGateway.emitSessionRegistration(sessionId, {
        type: 'registration',
        member: registration.member,
        registrationCount: session._count.registrations + 1,
      });
    }

    return registration;
  }

  async unregister(sessionId: string, memberId: string) {
    const session = await this.findOne(sessionId);

    // Check if registration deadline has passed
    if (session.registrationDeadline && new Date() > session.registrationDeadline) {
      throw new BadRequestException('Đã hết hạn hủy đăng ký');
    }

    const registration = await this.prisma.registration.findUnique({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Chưa đăng ký buổi tập này');
    }

    const deletedRegistration = await this.prisma.registration.delete({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
    });

    // Emit real-time event
    if (this.websocketGateway) {
      this.websocketGateway.emitSessionCancellation(sessionId, {
        type: 'cancellation',
        memberId,
        registrationCount: session._count.registrations - 1,
      });
    }

    return deletedRegistration;
  }

  async markAttendance(
    sessionId: string,
    memberId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE',
    reason?: string,
  ) {
    await this.findOne(sessionId);

    // Check if member is registered
    const registration = await this.prisma.registration.findUnique({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
    });

    if (!registration) {
      throw new BadRequestException('Thành viên chưa đăng ký buổi tập này');
    }

    const attendance = await this.prisma.attendance.upsert({
      where: {
        sessionId_memberId: {
          sessionId,
          memberId,
        },
      },
      update: {
        status,
        reason,
      },
      create: {
        sessionId,
        memberId,
        status,
        reason,
      },
      include: {
        session: true,
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

    // Emit real-time event
    if (this.websocketGateway) {
      this.websocketGateway.emitAttendanceUpdate(sessionId, {
        type: 'attendance',
        member: attendance.member,
        status,
        reason,
      });
    }

    return attendance;
  }

  async getAttendanceStats(memberId?: string, teamId?: string, dateFrom?: string, dateTo?: string) {
    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (teamId) {
      where.session = {
        teamId,
      };
    }

    if (dateFrom || dateTo) {
      where.session = {
        ...where.session,
        datetime: {},
      };
      if (dateFrom) {
        where.session.datetime.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.session.datetime.lte = new Date(dateTo);
      }
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        session: true,
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

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      late: attendances.filter(a => a.status === 'LATE').length,
    };

    return {
      stats,
      attendances,
    };
  }
}
