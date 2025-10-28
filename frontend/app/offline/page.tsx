'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Không có kết nối mạng</CardTitle>
          <CardDescription>
            Bạn đang ở chế độ offline. Một số tính năng có thể không khả dụng.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Những gì bạn có thể làm:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Xem dữ liệu đã lưu trước đó</li>
              <li>• Duyệt qua các trang đã truy cập</li>
              <li>• Chuẩn bị dữ liệu để đồng bộ khi có mạng</li>
            </ul>
          </div>

          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>

          <div className="text-xs text-muted-foreground">
            Ứng dụng sẽ tự động kết nối lại khi có mạng
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
