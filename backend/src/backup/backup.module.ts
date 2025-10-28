import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { SecurityModule } from '../common/security.module';
import { LoggingModule } from '../logging/logging.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    SecurityModule,
    LoggingModule,
    MonitoringModule,
  ],
  providers: [BackupService],
  controllers: [BackupController],
  exports: [BackupService],
})
export class BackupModule {}
