import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PdfExportService } from './pdf-export.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [FinanceService, PdfExportService],
  exports: [FinanceService],
})
export class FinanceModule {}
