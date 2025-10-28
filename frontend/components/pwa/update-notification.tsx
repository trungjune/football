'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { toast } from '@/hooks/useToast';

export function UpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page when new service worker takes control
        window.location.reload();
      });

      navigator.serviceWorker.ready.then(registration => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update();
        };

        // Check for updates every 30 minutes
        setInterval(checkForUpdates, 30 * 60 * 1000);

        // Listen for waiting service worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);

                // Show toast notification
                toast({
                  title: 'Cập nhật mới có sẵn',
                  description: 'Phiên bản mới của ứng dụng đã sẵn sàng',
                });
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Cập nhật mới</span>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">
            Phiên bản mới của FC Manager đã sẵn sàng với nhiều cải tiến
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleUpdate} className="flex-1">
              <RefreshCw className="mr-2 h-3 w-3" />
              Cập nhật
            </Button>
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Để sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
