'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[ProtectedRoute] State:', { user: !!user, loading, userId: user?.id });
    
    if (!loading && !user) {
      console.log('[ProtectedRoute] No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  console.log('[ProtectedRoute] Render:', { user: !!user, loading });

  if (loading) {
    console.log('[ProtectedRoute] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, returning null');
    return null;
  }

  console.log('[ProtectedRoute] User authenticated, rendering children');
  return <>{children}</>;
}
