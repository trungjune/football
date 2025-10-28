import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreateSessionDto } from './dto/session.dto';
import { AttendanceStatus } from '@prisma/client';

describe('SessionsService', () => {
  let service: SessionsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    trainingSession: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    registration: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    attendance: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockWebSocketGateway = {
    emitSessionRegistration: jest.fn(),
    emitSessionCancellation: jest.fn(),
    emitAttendanceUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'WebSocketGateway',
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createSessionDto: CreateSessionDto = {
      title: 'Test Training Session',
      description: 'Test description',
      datetime: new Date('2024-12-25T15:00:00Z').toISOString(),
      location: 'Test Stadium',
      type: 'TRAINING',
      maxParticipants: 14,
    };

    it('should create a session successfully', async () => {
      const mockSession = {
        id: 'session-1',
        ...createSessionDto,
        datetime: new Date(createSessionDto.datetime),
        teamId: 'team-1',
        registrations: [],
        attendances: [],
        _count: { registrations: 0, attendances: 0 },
      };

      mockPrismaService.trainingSession.create.mockResolvedValue(mockSession);

      const result = await service.create(createSessionDto, 'team-1');

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.trainingSession.create).toHaveBeenCalledWith({
        data: {
          title: createSessionDto.title,
          description: createSessionDto.description,
          datetime: new Date(createSessionDto.datetime),
          location: createSessionDto.location,
          type: createSessionDto.type,
          maxParticipants: createSessionDto.maxParticipants,
          registrationDeadline: null,
          teamId: 'team-1',
        },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException for past datetime', async () => {
      const pastSessionDto = {
        ...createSessionDto,
        datetime: new Date('2020-01-01T15:00:00Z').toISOString(),
      };

      await expect(service.create(pastSessionDto, 'team-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if registration deadline is after session time', async () => {
      const invalidSessionDto = {
        ...createSessionDto,
        registrationDeadline: new Date('2024-12-26T15:00:00Z').toISOString(),
      };

      await expect(service.create(invalidSessionDto, 'team-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sessions list', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          title: 'Training Session 1',
          datetime: new Date(),
          location: 'Stadium A',
        },
        {
          id: 'session-2',
          title: 'Training Session 2',
          datetime: new Date(),
          location: 'Stadium B',
        },
      ];

      mockPrismaService.trainingSession.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.trainingSession.count.mockResolvedValue(2);

      const result = await service.findAll({}, 'team-1');

      expect(result).toEqual({
        data: mockSessions,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should filter sessions by search term', async () => {
      const searchDto = {
        search: 'Training',
        page: 1,
        limit: 10,
      };

      mockPrismaService.trainingSession.findMany.mockResolvedValue([]);
      mockPrismaService.trainingSession.count.mockResolvedValue(0);

      await service.findAll(searchDto, 'team-1');

      expect(mockPrismaService.trainingSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'Training', mode: 'insensitive' } },
              { description: { contains: 'Training', mode: 'insensitive' } },
              { location: { contains: 'Training', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('register', () => {
    const mockSession = {
      id: 'session-1',
      title: 'Test Session',
      maxParticipants: 14,
      registrationDeadline: new Date('2024-12-24T15:00:00Z'),
      _count: { registrations: 5 },
    };

    beforeEach(() => {
      mockPrismaService.trainingSession.findUnique.mockResolvedValue(mockSession);
    });

    it('should register member successfully', async () => {
      const mockRegistration = {
        id: 'reg-1',
        sessionId: 'session-1',
        memberId: 'member-1',
        member: {
          id: 'member-1',
          fullName: 'Test User',
          user: { email: 'test@example.com' },
        },
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(null);
      mockPrismaService.registration.create.mockResolvedValue(mockRegistration);

      const result = await service.register('session-1', 'member-1');

      expect(result).toEqual(mockRegistration);
      expect(mockWebSocketGateway.emitSessionRegistration).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({
          type: 'registration',
          member: mockRegistration.member,
        }),
      );
    });

    it('should throw BadRequestException if already registered', async () => {
      const existingRegistration = {
        id: 'reg-1',
        sessionId: 'session-1',
        memberId: 'member-1',
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(existingRegistration);

      await expect(service.register('session-1', 'member-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if session is full', async () => {
      const fullSession = {
        ...mockSession,
        _count: { registrations: 14 },
      };

      mockPrismaService.trainingSession.findUnique.mockResolvedValue(fullSession);
      mockPrismaService.registration.findUnique.mockResolvedValue(null);

      await expect(service.register('session-1', 'member-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if registration deadline passed', async () => {
      const expiredSession = {
        ...mockSession,
        registrationDeadline: new Date('2020-01-01T15:00:00Z'),
      };

      mockPrismaService.trainingSession.findUnique.mockResolvedValue(expiredSession);
      mockPrismaService.registration.findUnique.mockResolvedValue(null);

      await expect(service.register('session-1', 'member-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAttendance', () => {
    const mockSession = {
      id: 'session-1',
      title: 'Test Session',
    };

    const mockRegistration = {
      id: 'reg-1',
      sessionId: 'session-1',
      memberId: 'member-1',
    };

    beforeEach(() => {
      mockPrismaService.trainingSession.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);
    });

    it('should mark attendance successfully', async () => {
      const mockAttendance = {
        id: 'att-1',
        sessionId: 'session-1',
        memberId: 'member-1',
        status: AttendanceStatus.PRESENT,
        member: {
          id: 'member-1',
          fullName: 'Test User',
          user: { email: 'test@example.com' },
        },
      };

      mockPrismaService.attendance.upsert.mockResolvedValue(mockAttendance);

      const result = await service.markAttendance(
        'session-1',
        'member-1',
        AttendanceStatus.PRESENT,
      );

      expect(result).toEqual(mockAttendance);
      expect(mockWebSocketGateway.emitAttendanceUpdate).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({
          type: 'attendance',
          member: mockAttendance.member,
          status: AttendanceStatus.PRESENT,
        }),
      );
    });

    it('should throw BadRequestException if member not registered', async () => {
      mockPrismaService.registration.findUnique.mockResolvedValue(null);

      await expect(
        service.markAttendance('session-1', 'member-1', AttendanceStatus.PRESENT),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAttendanceStats', () => {
    it('should return attendance statistics', async () => {
      const mockAttendances = [
        { status: AttendanceStatus.PRESENT },
        { status: AttendanceStatus.PRESENT },
        { status: AttendanceStatus.ABSENT },
        { status: AttendanceStatus.LATE },
      ];

      mockPrismaService.attendance.findMany.mockResolvedValue(mockAttendances);

      const result = await service.getAttendanceStats('member-1');

      expect(result).toEqual({
        stats: {
          total: 4,
          present: 2,
          absent: 1,
          late: 1,
        },
        attendances: mockAttendances,
      });
    });
  });
});
