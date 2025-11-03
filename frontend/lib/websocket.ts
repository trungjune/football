import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      // Lấy token từ localStorage thay vì NextAuth
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Không có token xác thực cho WebSocket connection');
        return null;
      }

      const serverUrl = process.env.NODE_ENV === 'production' ? '/ws' : 'http://localhost:3001/ws';

      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();

      return this.socket;
    } catch (error) {
      console.error('Lỗi kết nối WebSocket:', error);
      return null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('Disconnected from WebSocket server:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', error => {
      console.error('WebSocket error:', error);
    });

    // Session events
    this.socket.on('session_registration_update', data => {
      this.emit('sessionRegistrationUpdate', data);
    });

    this.socket.on('session_cancellation_update', data => {
      this.emit('sessionCancellationUpdate', data);
    });

    this.socket.on('attendance_update', data => {
      this.emit('attendanceUpdate', data);
    });

    // Payment events
    this.socket.on('payment_update', data => {
      this.emit('paymentUpdate', data);
    });

    this.socket.on('payment_notification', data => {
      this.emit('paymentNotification', data);
    });

    // Member events
    this.socket.on('member_update', data => {
      this.emit('memberUpdate', data);
    });

    // Team division events
    this.socket.on('team_division_update', data => {
      this.emit('teamDivisionUpdate', data);
    });

    // Notification events
    this.socket.on('notification', data => {
      this.emit('notification', data);
    });

    this.socket.on('broadcast_notification', data => {
      this.emit('broadcastNotification', data);
    });

    // Admin events
    this.socket.on('admin_connected', data => {
      this.emit('adminConnected', data);
    });

    this.socket.on('admin_disconnected', data => {
      this.emit('adminDisconnected', data);
    });

    this.socket.on('admin_broadcast', data => {
      this.emit('adminBroadcast', data);
    });

    this.socket.on('connected_users', data => {
      this.emit('connectedUsers', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event emitter functionality
  private eventListeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.eventListeners[event]) return;

    const index = this.eventListeners[event].indexOf(callback);
    if (index > -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  private emit(event: string, data: unknown) {
    if (!this.eventListeners[event]) return;

    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Session-specific methods
  joinSession(sessionId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_session', { sessionId });
    }
  }

  leaveSession(sessionId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_session', { sessionId });
    }
  }

  // Admin methods
  sendAdminMessage(message: unknown) {
    if (this.socket?.connected) {
      this.socket.emit('admin_message', message);
    }
  }

  getConnectedUsers() {
    if (this.socket?.connected) {
      this.socket.emit('get_connected_users');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners = {};
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
