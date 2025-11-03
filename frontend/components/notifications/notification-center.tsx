'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useWebSocket';

export function NotificationCenter() {
  const { notifications, unreadCount, clearNotifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'session':
        return '📅';
      case 'payment':
        return '💰';
      case 'member':
        return '👤';
      case 'team':
        return '⚽';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type?: string, read?: boolean) => {
    if (read) return 'border-muted';

    switch (type) {
      case 'session':
        return 'border-blue-200 bg-blue-50';
      case 'payment':
        return 'border-green-200 bg-green-50';
      case 'member':
        return 'border-purple-200 bg-purple-50';
      case 'team':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[80vh] max-w-md flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Thông báo</span>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Xóa tất cả
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-colors ${getNotificationColor(notification.type, notification.read)}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{getNotificationIcon(notification.type)}</div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}
                        >
                          {notification.title || 'Thông báo'}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p
                        className={`mt-1 text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}
                      >
                        {notification.message || notification.content}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </p>

                        {notification.isBroadcast && (
                          <Badge variant="outline" className="text-xs">
                            Thông báo chung
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {unreadCount > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                notifications.forEach(n => {
                  if (!n.read) markAsRead(n.id);
                });
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
