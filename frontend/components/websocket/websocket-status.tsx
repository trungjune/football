'use client';

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function WebSocketStatus() {
  const { isConnected, connectionError } = useWebSocket();

  if (connectionError) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <WifiOff className="h-3 w-3" />
        <span>Offline</span>
      </Badge>
    );
  }

  return (
    <Badge variant={isConnected ? 'default' : 'secondary'} className="flex items-center space-x-1">
      <Wifi className="h-3 w-3" />
      <span>{isConnected ? 'Online' : 'Connecting...'}</span>
    </Badge>
  );
}
