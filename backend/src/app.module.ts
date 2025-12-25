import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import productionConfig from './config/production.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { SessionsModule } from './sessions/sessions.module';
import { TeamDivisionModule } from './team-division/team-division.module';
import { FinanceModule } from './finance/finance.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { OcrModule } from './ocr/ocr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [productionConfig],
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    MembersModule,
    SessionsModule,
    TeamDivisionModule,
    FinanceModule,
    WebSocketModule,
    CacheModule,
    HealthModule,
    DashboardModule,
    SettingsModule,
    OcrModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
