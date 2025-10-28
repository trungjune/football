import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
})
export class FootballWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FootballWebSocketGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      this.connectedUsers.set(client.userId, client);

      // Join user to their personal room
      client.join(`user:${client.userId}`);

      // Join admin users to admin room
      if (client.userRole === 'ADMIN') {
        client.join('admin');
      }

      this.logger.log(`User ${client.userId} connected with role ${client.userRole}`);

      // Notify other admins about new connection
      if (client.userRole === 'ADMIN') {
        client.to('admin').emit('admin_connected', {
          userId: client.userId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);

      // Notify other admins about disconnection
      if (client.userRole === 'ADMIN') {
        client.to('admin').emit('admin_disconnected', {
          userId: client.userId,
          timestamp: new Date().toISOString(),
        });
      }

      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  // Session registration events
  @SubscribeMessage('join_session')
  handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.join(`session:${data.sessionId}`);
    this.logger.log(`User ${client.userId} joined session ${data.sessionId}`);
  }

  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.leave(`session:${data.sessionId}`);
    this.logger.log(`User ${client.userId} left session ${data.sessionId}`);
  }

  // Real-time session updates
  emitSessionRegistration(sessionId: string, data: any) {
    this.server.to(`session:${sessionId}`).emit('session_registration_update', {
      sessionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitSessionCancellation(sessionId: string, data: any) {
    this.server.to(`session:${sessionId}`).emit('session_cancellation_update', {
      sessionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitAttendanceUpdate(sessionId: string, data: any) {
    this.server.to(`session:${sessionId}`).emit('attendance_update', {
      sessionId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Payment notifications
  emitPaymentUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('payment_update', {
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Also notify admins
    this.server.to('admin').emit('payment_notification', {
      userId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Member updates
  emitMemberUpdate(data: any) {
    this.server.to('admin').emit('member_update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Team division updates
  emitTeamDivisionUpdate(data: any) {
    this.server.emit('team_division_update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // General notifications
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  emitBroadcastNotification(notification: any) {
    this.server.emit('broadcast_notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Admin-only events
  @SubscribeMessage('admin_message')
  handleAdminMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: any) {
    if (client.userRole !== 'ADMIN') {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.server.to('admin').emit('admin_broadcast', {
      from: client.userId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected users (admin only)
  @SubscribeMessage('get_connected_users')
  handleGetConnectedUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userRole !== 'ADMIN') {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    const connectedUsersList = Array.from(this.connectedUsers.entries()).map(
      ([userId, socket]) => ({
        userId,
        role: socket.userRole,
        connectedAt: socket.handshake.time,
      }),
    );

    client.emit('connected_users', connectedUsersList);
  }

  // Utility method to check if user is connected
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
}
