import { useWebSocketEvent } from '@/hooks/useWebSocket';
import { toast } from '@/hooks/useToast';

export function useNotificationSystem() {
  // Session notifications
  useWebSocketEvent('sessionRegistrationUpdate', (data: any) => {
    if (data.type === 'registration') {
      toast({
        title: 'Đăng ký mới',
        description: `${data.member.fullName} đã đăng ký tham gia buổi tập`,
      });
    }
  });

  useWebSocketEvent('sessionCancellationUpdate', () => {
    toast({
      title: 'Hủy đăng ký',
      description: 'Có thành viên đã hủy đăng ký buổi tập',
    });
  });

  useWebSocketEvent('attendanceUpdate', (data: any) => {
    const statusText =
      data.status === 'PRESENT' ? 'có mặt' : data.status === 'ABSENT' ? 'vắng mặt' : 'đến muộn';

    toast({
      title: 'Cập nhật điểm danh',
      description: `${data.member.fullName} được đánh dấu ${statusText}`,
    });
  });

  // Payment notifications
  useWebSocketEvent('paymentUpdate', (data: any) => {
    toast({
      title: 'Cập nhật thanh toán',
      description: data.message || 'Có cập nhật về thanh toán của bạn',
    });
  });

  useWebSocketEvent('paymentNotification', () => {
    toast({
      title: 'Thanh toán mới',
      description: `Có thanh toán mới từ thành viên`,
    });
  });

  // Member notifications
  useWebSocketEvent('memberUpdate', () => {
    toast({
      title: 'Cập nhật thành viên',
      description: 'Có cập nhật về thành viên',
    });
  });

  // Team division notifications
  useWebSocketEvent('teamDivisionUpdate', () => {
    toast({
      title: 'Chia đội mới',
      description: 'Đã có kết quả chia đội mới',
    });
  });

  // General notifications
  useWebSocketEvent('notification', (data: any) => {
    toast({
      title: data.title || 'Thông báo',
      description: data.message || data.content,
    });
  });

  useWebSocketEvent('broadcastNotification', (data: unknown) => {
    toast({
      title: data.title || 'Thông báo chung',
      description: data.message || data.content,
    });
  });

  // Admin notifications
  useWebSocketEvent('adminConnected', () => {
    toast({
      title: 'Admin kết nối',
      description: 'Có admin mới kết nối vào hệ thống',
    });
  });

  useWebSocketEvent('adminDisconnected', () => {
    toast({
      title: 'Admin ngắt kết nối',
      description: 'Có admin đã ngắt kết nối khỏi hệ thống',
    });
  });
}
