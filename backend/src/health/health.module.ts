import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { SecurityModule } from '../common/security.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, SecurityModule, PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
