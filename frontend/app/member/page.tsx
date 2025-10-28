import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, User, Clock } from 'lucide-react';

export default async function MemberPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Mock data - in real app, fetch from API
  const memberData = {
    profile: {
      fullName: 'Nguyễn Văn A',
      position: 'Tiền vệ',
      memberType: 'Chính thức',
      joinDate: '2024-01-15',
    },
    upcomingSessions: [
      {
        id: '1',
        title: 'Buổi tập kỹ thuật',
        datetime: '2024-12-21T15:00:00Z',
        location: 'Sân ABC',
        registered: true,
      },
      {
        id: '2',
        title: 'Trận giao hữu',
        datetime: '2024-12-22T09:00:00Z',
        location: 'Sân XYZ',
        registered: false,
      },
    ],
    payments: {
      totalPaid: 600000,
      totalOwed: 200000,
      recentPayments: [
        {
          id: '1',
          title: 'Phí tháng 11',
          amount: 200000,
          paidAt: '2024-11-15',
        },
      ],
    },
    attendance: {
      thisMonth: 8,
      total: 45,
      rate: 85,
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trang cá nhân</h1>
          <p className="text-muted-foreground">
            Xem thông tin cá nhân và hoạt động của bạn
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buổi tập tháng này</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberData.attendance.thisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ tham gia: {memberData.attendance.rate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng buổi tập</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberData.attendance.total}</div>
              <p className="text-xs text-muted-foreground">
                Từ khi tham gia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(memberData.payments.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng cộng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Còn nợ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(memberData.payments.totalOwed)}
              </div>
              <p className="text-xs text-muted-foreground">
                Cần thanh toán
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Thông tin thành viên của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{memberData.profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 flex items-center justify-center">
                  ⚽
                </div>
                <div>
                  <p className="font-medium">{memberData.profile.position}</p>
                  <p className="text-sm text-muted-foreground">Vị trí thi đấu</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <p className="font-medium">{memberData.profile.memberType}</p>
                  <p className="text-sm text-muted-foreground">Loại thành viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buổi tập sắp tới</CardTitle>
              <CardDescription>
                Đăng ký tham gia buổi tập
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberData.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.datetime).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                    <Button
                      variant={session.registered ? 'secondary' : 'default'}
                      size="sm"
                    >
                      {session.registered ? 'Đã đăng ký' : 'Đăng ký'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thanh toán</CardTitle>
            <CardDescription>
              Các khoản phí đã thanh toán gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberData.payments.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Thanh toán ngày {new Date(payment.paidAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Đã thanh toán</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}