import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import websocketService from '@/lib/websocket';

interface Registration {
  id: string;
  memberId: string;
  sessionId: string;
  status: string;
  createdAt: string;
}

interface Attendance {
  id: string;
  memberId: string;
  sessionId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  createdAt: string;
  member?: { id: string };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  content?: string;
  type: string;
  createdAt: string;
  timestamp?: string;
  read: boolean;
  isBroadcast?: boolean;
}

export function useWebSocket() {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!token) {
      return;
    }

    const connect = async () => {
      try {
        const socket = await websocketService.connect();
        if (socket) {
          setIsConnected(true);
          setConnectionError(null);
        } else {
          setConnectionError('Failed to connect to server');
        }
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setConnectionError('Connection failed');

        // Retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    // Cleanup on unmount or session change
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionError,
    websocketService,
  };
}

export function useWebSocketEvent<T = unknown>(event: string, callback: (data: T) => void) {
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    ws.on(event, callback);

    return () => {
      ws.off(event, callback);
    };
  }, [ws, event, callback]);
}

// Specific hooks for different events
export function useSessionUpdates(sessionId?: string) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!sessionId || !ws) return;

    // Join session room
    ws.joinSession(sessionId);

    const handleRegistrationUpdate = (data: {
      sessionId: string;
      type: string;
      registration: Registration;
      memberId?: string;
    }) => {
      if (data.sessionId === sessionId) {
        if (data.type === 'registration') {
          setRegistrations(prev => [...prev, data.registration]);
        } else if (data.type === 'cancellation') {
          setRegistrations(prev => prev.filter(r => r.id !== data.memberId));
        }
      }
    };

    const handleAttendanceUpdate = (data: { sessionId: string; attendance: Attendance }) => {
      if (data.sessionId === sessionId) {
        setAttendances(prev => {
          const existing = prev.find(a => a.id === data.attendance.id);
          if (existing) {
            return prev.map(a => (a.id === data.attendance.id ? data.attendance : a));
          } else {
            return [...prev, data.attendance];
          }
        });
      }
    };

    ws.on('sessionRegistrationUpdate', handleRegistrationUpdate);
    ws.on('sessionCancellationUpdate', handleRegistrationUpdate);
    ws.on('attendanceUpdate', handleAttendanceUpdate);

    return () => {
      ws.off('sessionRegistrationUpdate', handleRegistrationUpdate);
      ws.off('sessionCancellationUpdate', handleRegistrationUpdate);
      ws.off('attendanceUpdate', handleAttendanceUpdate);
      ws.leaveSession(sessionId);
    };
  }, [sessionId, ws]);

  return { registrations, attendances };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handleNotification = (data: Notification) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications
    };

    const handleBroadcastNotification = (data: Notification) => {
      setNotifications(prev => [{ ...data, isBroadcast: true }, ...prev].slice(0, 50));
    };

    ws.on('notification', handleNotification);
    ws.on('broadcastNotification', handleBroadcastNotification);

    return () => {
      ws.off('notification', handleNotification);
      ws.off('broadcastNotification', handleBroadcastNotification);
    };
  }, [ws]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    clearNotifications,
    markAsRead,
  };
}

export function useAdminUpdates() {
  const [connectedUsers, setConnectedUsers] = useState<
    { userId: string; role: string; connectedAt: string }[]
  >([]);
  const [adminMessages, setAdminMessages] = useState<
    { id: string; message: string; timestamp: string; from: string }[]
  >([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handleConnectedUsers = (
      data: { userId: string; role: string; connectedAt: string }[]
    ) => {
      setConnectedUsers(data);
    };

    const handleAdminConnected = (data: { userId: string; role: string; connectedAt: string }) => {
      setConnectedUsers(prev => [...prev, data]);
    };

    const handleAdminDisconnected = (data: { userId: string }) => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleAdminBroadcast = (data: {
      id: string;
      message: string;
      timestamp: string;
      from: string;
    }) => {
      setAdminMessages(prev => [data, ...prev].slice(0, 100));
    };

    ws.on('connectedUsers', handleConnectedUsers);
    ws.on('adminConnected', handleAdminConnected);
    ws.on('adminDisconnected', handleAdminDisconnected);
    ws.on('adminBroadcast', handleAdminBroadcast);

    // Request initial connected users
    ws.getConnectedUsers();

    return () => {
      ws.off('connectedUsers', handleConnectedUsers);
      ws.off('adminConnected', handleAdminConnected);
      ws.off('adminDisconnected', handleAdminDisconnected);
      ws.off('adminBroadcast', handleAdminBroadcast);
    };
  }, [ws]);

  const sendAdminMessage = (message: string) => {
    if (ws) {
      ws.sendAdminMessage({ message });
    }
  };

  return {
    connectedUsers,
    adminMessages,
    sendAdminMessage,
  };
}
