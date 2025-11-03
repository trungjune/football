import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../common/services/security.service';
import { AuditService } from '../common/services/audit.service';
import { RateLimitService } from '../common/services/rate-limit.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSecurityService = {
    getSecurityStats: jest.fn().mockReturnValue({
      totalEvents: 0,
      eventsBySeverity: { critical: 0 },
    }),
  };

  const mockAuditService = {
    getAuditStats: jest.fn().mockReturnValue({
      totalLogs: 0,
      successRate: 100,
    }),
  };

  const mockRateLimitService = {
    getBlockedIPs: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: RateLimitService, useValue: mockRateLimitService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.services.database.status).toBe('connected');
      expect(result.environment).toBe('production');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
    });

    it('should return unhealthy status when database is disconnected', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.getHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('disconnected');
      expect(result.services.database.error).toBe('Connection failed');
    });

    it('should include security and audit stats', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockConfigService.get.mockReturnValue('production');

      const result = await controller.getHealth();

      expect(result.services.security).toEqual({
        status: 'active',
        totalEvents: 0,
        blockedIPs: 0,
        criticalEvents: 0,
      });

      expect(result.services.audit).toEqual({
        status: 'active',
        totalLogs: 0,
        successRate: 100,
      });
    });
  });

  describe('getReadiness', () => {
    it('should return ready status when all checks pass', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.getReadiness();

      expect(result.status).toBe('ready');
      expect(result.checks.database).toBe(true);
      expect(result.checks.security).toBe(true);
      expect(result.checks.audit).toBe(true);
    });

    it('should return not_ready status when database check fails', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await controller.getReadiness();

      expect(result.status).toBe('not_ready');
      expect(result.checks.database).toBe(false);
      expect(result.checks.security).toBe(true);
      expect(result.checks.audit).toBe(true);
    });
  });

  describe('getLiveness', () => {
    it('should return alive status', () => {
      const result = controller.getLiveness();

      expect(result.status).toBe('alive');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('pid');
      expect(result).toHaveProperty('uptime');
    });
  });
});
