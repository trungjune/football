import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { SecurityModule } from '../common/security.module';

@Module({
  imports: [SecurityModule],
  controllers: [CronController],
})
export class CronModule {}
