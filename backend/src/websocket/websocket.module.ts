import { Module } from '@nestjs/common';
import { FootballWebSocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    FootballWebSocketGateway,
    {
      provide: 'WebSocketGateway',
      useExisting: FootballWebSocketGateway,
    },
  ],
  exports: [FootballWebSocketGateway, 'WebSocketGateway'],
})
export class WebSocketModule {}
