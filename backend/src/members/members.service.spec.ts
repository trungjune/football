import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

describe('MembersService', () => {
  let service: MembersService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    member: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMemberDto: CreateMemberDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      position: 'MIDFIELDER',
      memberType: 'OFFICIAL',
      status: 'ACTIVE',
    };

    it('should create a new member successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'MEMBER',
      };

      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        fullName: 'Test User',
        position: 'MIDFIELDER',
        memberType: 'OFFICIAL',
        status: 'ACTIVE',
        user: mockUser,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockResolvedValue(mockMember);

      const result = await service.create(createMemberDto, 'team-1');

      expect(result).toEqual(mockMember);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createMemberDto.email },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.create(createMemberDto, 'team-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated members list', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          fullName: 'Test User 1',
          position: 'MIDFIELDER',
          user: { email: 'test1@example.com' },
        },
        {
          id: 'member-2',
          fullName: 'Test User 2',
          position: 'FORWARD',
          user: { email: 'test2@example.com' },
        },
      ];

      mockPrismaService.member.findMany.mockResolvedValue(mockMembers);
      mockPrismaService.member.count.mockResolvedValue(2);

      const result = await service.findAll({}, 'team-1');

      expect(result).toEqual({
        data: mockMembers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should filter members by search term', async () => {
      const searchDto = {
        search: 'Test User',
        page: 1,
        limit: 10,
      };

      mockPrismaService.member.findMany.mockResolvedValue([]);
      mockPrismaService.member.count.mockResolvedValue(0);

      await service.findAll(searchDto, 'team-1');

      expect(mockPrismaService.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { fullName: { contains: 'Test User', mode: 'insensitive' } },
              { nickname: { contains: 'Test User', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const mockMember = {
        id: 'member-1',
        fullName: 'Test User',
        user: { email: 'test@example.com' },
      };

      mockPrismaService.member.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne('member-1');

      expect(result).toEqual(mockMember);
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateMemberDto: UpdateMemberDto = {
      fullName: 'Updated User',
      position: 'FORWARD',
    };

    it('should update a member successfully', async () => {
      const existingMember = {
        id: 'member-1',
        fullName: 'Test User',
        user: { email: 'test@example.com' },
      };

      const updatedMember = {
        ...existingMember,
        fullName: 'Updated User',
        position: 'FORWARD',
      };

      mockPrismaService.member.findUnique.mockResolvedValue(existingMember);
      mockPrismaService.member.update.mockResolvedValue(updatedMember);

      const result = await service.update('member-1', updateMemberDto);

      expect(result).toEqual(updatedMember);
      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: updateMemberDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateMemberDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a member successfully', async () => {
      const existingMember = {
        id: 'member-1',
        userId: 'user-1',
        fullName: 'Test User',
      };

      mockPrismaService.member.findUnique.mockResolvedValue(existingMember);
      mockPrismaService.$transaction.mockResolvedValue(existingMember);

      const result = await service.remove('member-1');

      expect(result).toEqual(existingMember);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return member statistics', async () => {
      const mockStats = [
        { status: 'ACTIVE', _count: { status: 15 } },
        { status: 'INACTIVE', _count: { status: 3 } },
        { position: 'MIDFIELDER', _count: { position: 8 } },
        { position: 'FORWARD', _count: { position: 6 } },
      ];

      mockPrismaService.member.groupBy = jest
        .fn()
        .mockResolvedValueOnce(mockStats.slice(0, 2))
        .mockResolvedValueOnce(mockStats.slice(2));

      const result = await service.getStatistics('team-1');

      expect(result).toEqual({
        byStatus: { ACTIVE: 15, INACTIVE: 3 },
        byPosition: { MIDFIELDER: 8, FORWARD: 6 },
      });
    });
  });
});
