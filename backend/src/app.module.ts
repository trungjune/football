import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { SessionsModule } from './sessions/sessions.module';
import { TeamDivisionModule } from './team-division/team-division.module';
import { FinanceModule } from './finance/finance.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
