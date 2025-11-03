'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, User, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

function useMemberData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['member-data', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/members/profile/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch member data');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function MemberPage() {
  const { user } = useAuth();
  const { data: memberData, isLoading } = useMemberData();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="mb-2 h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const defaultData = {
    profile: {
      fullName: user?.email || 'Thành viên',
      position: 'MIDFIELDER',
      memberType: 'OFFICIAL',
      joinDate: new Date().toISOString(),
    },
    upcomingSessions: [],
    payments: {
      totalPaid: 0,
      totalOwed: 0,
      recentPayments: [],
    },
    attendance: {
      thisMonth: 0,
      total: 0,
      rate: 0,
    },
  };

  const data = memberData || defaultData;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trang cá nhân</h1>
          <p className="text-muted-foreground">Xem thông tin cá nhân và hoạt động của bạn</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buổi tập tháng này</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.attendance.thisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ tham gia: {data.attendance.rate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng buổi tập</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.attendance.total}</div>
              <p className="text-xs text-muted-foreground">Từ khi tham gia</p>
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
                }).format(data.payments.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">Tổng cộng</p>
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
                }).format(data.payments.totalOwed)}
              </div>
              <p className="text-xs text-muted-foreground">Cần thanh toán</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin thành viên của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-5 w-5 items-center justify-center">⚽</div>
                <div>
                  <p className="font-medium">
                    {data.profile.position === 'GOALKEEPER' && 'Thủ môn'}
                    {data.profile.position === 'DEFENDER' && 'Hậu vệ'}
                    {data.profile.position === 'MIDFIELDER' && 'Tiền vệ'}
                    {data.profile.position === 'FORWARD' && 'Tiền đạo'}
                  </p>
                  <p className="text-sm text-muted-foreground">Vị trí thi đấu</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-5 w-5 items-center justify-center">🏆</div>
                <div>
                  <p className="font-medium">
                    {data.profile.memberType === 'OFFICIAL' && 'Chính thức'}
                    {data.profile.memberType === 'TRIAL' && 'Thử việc'}
                    {data.profile.memberType === 'GUEST' && 'Khách mời'}
                  </p>
                  <p className="text-sm text-muted-foreground">Loại thành viên</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buổi tập sắp tới</CardTitle>
              <CardDescription>Đăng ký tham gia buổi tập</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.upcomingSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có buổi tập nào sắp tới</p>
                ) : (
                  data.upcomingSessions.map(
                    (session: {
                      id: string;
                      title: string;
                      datetime: string;
                      location: string;
                      registered: boolean;
                    }) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
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
                        <Button variant={session.registered ? 'secondary' : 'default'} size="sm">
                          {session.registered ? 'Đã đăng ký' : 'Đăng ký'}
                        </Button>
                      </div>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thanh toán</CardTitle>
            <CardDescription>Các khoản phí đã thanh toán gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.payments.recentPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch sử thanh toán</p>
              ) : (
                data.payments.recentPayments.map(
                  (payment: {
                    id: string;
                    fee: { title: string };
                    amount: number;
                    paidAt: string;
                    status: string;
                  }) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{payment.fee.title}</p>
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
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
