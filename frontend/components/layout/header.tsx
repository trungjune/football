'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { WebSocketStatus } from '@/components/websocket/websocket-status';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { MobileNav } from './mobile-nav';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <MobileNav />
        <h2 className="text-lg font-semibold">Quản lý đội bóng</h2>
      </div>

      <div className="flex items-center space-x-4">
        <WebSocketStatus />

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <NotificationCenter />

        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
