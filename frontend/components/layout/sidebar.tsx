'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  DollarSign,
  Shuffle,
  BarChart3,
  Settings,
  Home,
} from 'lucide-react';

const navigation = [
  { name: 'Trang chủ', href: '/dashboard', icon: Home },
  { name: 'Thành viên', href: '/members', icon: Users },
  { name: 'Buổi tập', href: '/sessions', icon: Calendar },
  { name: 'Tài chính', href: '/finance', icon: DollarSign },
  { name: 'Chia đội', href: '/team-division', icon: Shuffle },
  { name: 'Thống kê', href: '/statistics', icon: BarChart3 },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold">⚽ FC Manager</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {session?.user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {session?.user?.role === 'ADMIN' ? 'Quản lý' : 'Thành viên'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}