import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import websocketService from '@/lib/websocket';

export function useWebSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!session?.accessToken) {
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
  }, [session?.accessToken]);

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

export function useWebSocketEvent(event: string, callback: Function) {
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
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!sessionId || !ws) return;

    // Join session room
    ws.joinSession(sessionId);

    const handleRegistrationUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        if (data.type === 'registration') {
          setRegistrations(prev => [...prev, data.member]);
        } else if (data.type === 'cancellation') {
          setRegistrations(prev => prev.filter(r => r.id !== data.memberId));
        }
      }
    };

    const handleAttendanceUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        setAttendances(prev => {
          const existing = prev.find(a => a.member.id === data.member.id);
          if (existing) {
            return prev.map(a =>
              a.member.id === data.member.id
                ? { ...a, status: data.status, reason: data.reason }
                : a
            );
          } else {
            return [...prev, { member: data.member, status: data.status, reason: data.reason }];
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handleNotification = (data: any) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50 notifications
    };

    const handleBroadcastNotification = (data: any) => {
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
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const { websocketService: ws } = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handleConnectedUsers = (data: any) => {
      setConnectedUsers(data);
    };

    const handleAdminConnected = (data: any) => {
      setConnectedUsers(prev => [...prev, data]);
    };

    const handleAdminDisconnected = (data: any) => {
      setConnectedUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleAdminBroadcast = (data: any) => {
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
