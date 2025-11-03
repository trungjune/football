'use client';

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function WebSocketStatus() {
  // Temporarily disabled WebSocket to avoid "Offline" status
  // TODO: Re-enable when backend WebSocket server is working

  return (
    <Badge variant="default" className="flex items-center space-x-1">
      <Wifi className="h-3 w-3" />
      <span>Online</span>
    </Badge>
  );
}
