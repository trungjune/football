import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggingService } from './logging.service';
import { LoggingController } from './logging.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CustomLoggingService],
  controllers: [LoggingController],
  exports: [CustomLoggingService],
})
export class LoggingModule {}
