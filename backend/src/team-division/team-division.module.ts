import { Module } from '@nestjs/common';
import { TeamDivisionController } from './team-division.controller';
import { TeamDivisionService } from './team-division.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamDivisionController],
  providers: [TeamDivisionService],
  exports: [TeamDivisionService],
})
export class TeamDivisionModule {}
