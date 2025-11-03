'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt, onNetworkStatusChange } from '@/lib/pwa';
import { toast } from '@/hooks/useToast';

export function PWAInit() {
  useEffect(() => {
    // Register service worker (temporarily disabled due to deployment issues)
    // registerServiceWorker();

    // Setup install prompt
    setupInstallPrompt();

    // Listen for network status changes
    const cleanup = onNetworkStatusChange(online => {
      if (online) {
        toast({
          title: 'Kết nối mạng đã được khôi phục',
          description: 'Ứng dụng sẽ đồng bộ dữ liệu mới nhất',
        });
      } else {
        toast({
          title: 'Mất kết nối mạng',
          description: 'Ứng dụng sẽ hoạt động ở chế độ offline',
          variant: 'destructive',
        });
      }
    });

    // Cleanup
    return cleanup;
  }, []);

  return null;
}
