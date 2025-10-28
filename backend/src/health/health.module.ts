import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { SecurityModule } from '../common/security.module';

@Module({
  imports: [ConfigModule, SecurityModule],
  controllers: [HealthController],
})
export class HealthModule {}
