'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  // Initialize notification system
  useNotificationSystem();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1">
          <Header />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
