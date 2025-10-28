import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateFeeDto, CreatePaymentDto } from './dto/finance.dto';

describe('FinanceService', () => {
  let service: FinanceService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    fee: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    member: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFee', () => {
    const createFeeDto: CreateFeeDto = {
      title: 'Monthly Fee December',
      description: 'Monthly membership fee',
      amount: 200000,
      type: 'MONTHLY',
      dueDate: new Date('2024-12-31').toISOString(),
    };

    it('should create a fee successfully', async () => {
      const mockFee = {
        id: 'fee-1',
        ...createFeeDto,
        dueDate: new Date(createFeeDto.dueDate!),
        teamId: 'team-1',
        payments: [],
      };

      mockPrismaService.fee.create.mockResolvedValue(mockFee);

      const result = await service.createFee(createFeeDto, 'team-1');

      expect(result).toEqual(mockFee);
      expect(mockPrismaService.fee.create).toHaveBeenCalledWith({
        data: {
          title: createFeeDto.title,
          description: createFeeDto.description,
          amount: createFeeDto.amount,
          type: createFeeDto.type,
          dueDate: new Date(createFeeDto.dueDate!),
          teamId: 'team-1',
        },
        include: { payments: true },
      });
    });

    it('should create fee without due date', async () => {
      const feeWithoutDueDate = {
        ...createFeeDto,
        dueDate: undefined,
      };

      const mockFee = {
        id: 'fee-1',
        ...feeWithoutDueDate,
        dueDate: null,
        teamId: 'team-1',
        payments: [],
      };

      mockPrismaService.fee.create.mockResolvedValue(mockFee);

      const result = await service.createFee(feeWithoutDueDate, 'team-1');

      expect(result).toEqual(mockFee);
    });
  });

  describe('createPayment', () => {
    const createPaymentDto: CreatePaymentDto = {
      feeId: 'fee-1',
      memberId: 'member-1',
      amount: 200000,
      method: 'CASH',
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
    };

    it('should create a payment successfully', async () => {
      const mockPayment = {
        id: 'payment-1',
        ...createPaymentDto,
        paidAt: new Date(createPaymentDto.paidAt!),
        fee: {
          id: 'fee-1',
          title: 'Monthly Fee',
          amount: 200000,
        },
        member: {
          id: 'member-1',
          fullName: 'Test User',
          user: { email: 'test@example.com' },
        },
      };

      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createPayment(createPaymentDto);

      expect(result).toEqual(mockPayment);
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          feeId: createPaymentDto.feeId,
          memberId: createPaymentDto.memberId,
          amount: createPaymentDto.amount,
          method: createPaymentDto.method,
          status: createPaymentDto.status,
          paidAt: new Date(createPaymentDto.paidAt!),
        },
        include: expect.any(Object),
      });
    });
  });

  describe('getFees', () => {
    it('should return paginated fees list', async () => {
      const mockFees = [
        {
          id: 'fee-1',
          title: 'Monthly Fee December',
          amount: 200000,
          type: 'MONTHLY',
          payments: [],
        },
        {
          id: 'fee-2',
          title: 'Training Fee',
          amount: 50000,
          type: 'PER_SESSION',
          payments: [],
        },
      ];

      mockPrismaService.fee.findMany.mockResolvedValue(mockFees);
      mockPrismaService.fee.count.mockResolvedValue(2);

      const result = await service.getFees({}, 'team-1');

      expect(result).toEqual({
        data: mockFees,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should filter fees by type', async () => {
      const searchDto = {
        type: 'MONTHLY',
        page: 1,
        limit: 10,
      };

      mockPrismaService.fee.findMany.mockResolvedValue([]);
      mockPrismaService.fee.count.mockResolvedValue(0);

      await service.getFees(searchDto, 'team-1');

      expect(mockPrismaService.fee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'MONTHLY',
          }),
        }),
      );
    });
  });

  describe('getPayments', () => {
    it('should return paginated payments list', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          amount: 200000,
          method: 'CASH',
          status: 'COMPLETED',
          fee: { title: 'Monthly Fee' },
          member: { fullName: 'Test User' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);
      mockPrismaService.payment.count.mockResolvedValue(1);

      const result = await service.getPayments({}, 'team-1');

      expect(result).toEqual({
        data: mockPayments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('getFinancialReport', () => {
    it('should generate financial report', async () => {
      const mockFees = [
        { amount: 200000, payments: [{ amount: 200000, status: 'COMPLETED' }] },
        { amount: 150000, payments: [{ amount: 100000, status: 'COMPLETED' }] },
      ];

      const mockPayments = [
        { amount: 200000, status: 'COMPLETED', paidAt: new Date() },
        { amount: 100000, status: 'COMPLETED', paidAt: new Date() },
        { amount: 50000, status: 'PENDING', paidAt: null },
      ];

      mockPrismaService.fee.findMany.mockResolvedValue(mockFees);
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.getFinancialReport('team-1');

      expect(result).toEqual({
        totalExpectedRevenue: 350000,
        totalActualRevenue: 300000,
        totalPendingAmount: 50000,
        collectionRate: expect.closeTo(85.71, 2),
        totalPayments: 3,
        completedPayments: 2,
        pendingPayments: 1,
        paymentsByMethod: {
          CASH: expect.any(Number),
          BANK_TRANSFER: expect.any(Number),
        },
        monthlyRevenue: expect.any(Array),
      });
    });
  });

  describe('getMemberDebt', () => {
    it('should calculate member debt correctly', async () => {
      const mockFees = [
        {
          id: 'fee-1',
          title: 'Monthly Fee',
          amount: 200000,
          payments: [{ memberId: 'member-1', amount: 200000, status: 'COMPLETED' }],
        },
        {
          id: 'fee-2',
          title: 'Training Fee',
          amount: 50000,
          payments: [],
        },
      ];

      mockPrismaService.fee.findMany.mockResolvedValue(mockFees);

      const result = await service.getMemberDebt('member-1', 'team-1');

      expect(result).toEqual({
        totalOwed: 250000,
        totalPaid: 200000,
        remainingDebt: 50000,
        fees: expect.arrayContaining([
          expect.objectContaining({
            feeId: 'fee-1',
            title: 'Monthly Fee',
            amount: 200000,
            paidAmount: 200000,
            remainingAmount: 0,
            status: 'PAID',
          }),
          expect.objectContaining({
            feeId: 'fee-2',
            title: 'Training Fee',
            amount: 50000,
            paidAmount: 0,
            remainingAmount: 50000,
            status: 'UNPAID',
          }),
        ]),
      });
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const existingPayment = {
        id: 'payment-1',
        status: 'PENDING',
        member: { fullName: 'Test User' },
        fee: { title: 'Monthly Fee' },
      };

      const updatedPayment = {
        ...existingPayment,
        status: 'COMPLETED',
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrismaService.payment.update.mockResolvedValue(updatedPayment);

      const result = await service.updatePaymentStatus('payment-1', 'COMPLETED');

      expect(result).toEqual(updatedPayment);
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'COMPLETED' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.updatePaymentStatus('non-existent', 'COMPLETED')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
