'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';
import api from '@/lib/axios';
import { FeeForm } from '@/components/finance/fee-form';
import { PaymentForm } from '@/components/finance/payment-form';

interface Fee {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: string;
  dueDate?: string;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidAt?: string;
  member: {
    id: string;
    fullName: string;
  };
  fee: {
    id: string;
    title: string;
  };
}

const feeTypeNames = {
  MONTHLY: 'Phí hàng tháng',
  PER_SESSION: 'Phí theo buổi',
  SPECIAL: 'Phí đặc biệt',
};

const paymentMethodNames = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

const paymentStatusNames = {
  PENDING: 'Chờ xác nhận',
  COMPLETED: 'Đã hoàn thành',
  FAILED: 'Thất bại',
};

export default function FinancePage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [isFeeFormOpen, setIsFeeFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [feesResponse, paymentsResponse] = await Promise.all([
        api.get('/finance/fees'),
        api.get('/finance/payments'),
      ]);
      setFees(feesResponse.data.data || []);
      setPayments(paymentsResponse.data.data || []);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFees = useCallback(() => {
    let filtered = fees;

    if (searchTerm) {
      filtered = filtered.filter(
        fee =>
          fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (feeTypeFilter !== 'all') {
      filtered = filtered.filter(fee => fee.type === feeTypeFilter);
    }

    setFilteredFees(filtered);
  }, [fees, searchTerm, feeTypeFilter]);

  const filterPayments = useCallback(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        payment =>
          payment.member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.fee.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === paymentStatusFilter);
    }

    // Sort by payment date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      return dateB - dateA;
    });

    setFilteredPayments(filtered);
  }, [payments, searchTerm, paymentStatusFilter]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFees();
  }, [filterFees]);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  const handleAddFee = () => {
    setSelectedFee(null);
    setIsFeeFormOpen(true);
  };

  const handleEditFee = (fee: Fee) => {
    setSelectedFee(fee);
    setIsFeeFormOpen(true);
  };

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsPaymentFormOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadData();
  };

  const handleDeleteFee = async (feeId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khoản phí này?')) {
      try {
        await api.delete(`/finance/fees/${feeId}`);
        loadData();
      } catch (error) {
        console.error('Error deleting fee:', error);
      }
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) {
      try {
        await api.delete(`/finance/payments/${paymentId}`);
        loadData();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'MONTHLY':
        return 'text-blue-600';
      case 'PER_SESSION':
        return 'text-green-600';
      case 'SPECIAL':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Calculate statistics
  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý tài chính</h1>
            <p className="text-muted-foreground">Quản lý phí và thanh toán của đội bóng</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleAddPayment}>
              <Plus className="mr-2 h-4 w-4" />
              Ghi nhận thanh toán
            </Button>
            <Button onClick={handleAddFee}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo khoản phí
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {completedPayments} thanh toán hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
              <TrendingDown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(pendingAmount)}
              </div>
              <p className="text-xs text-muted-foreground">Cần xác nhận</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng khoản phí</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
              <p className="text-xs text-muted-foreground">{fees.length} khoản phí</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ thu</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalFees > 0 ? Math.round((totalRevenue / totalFees) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Hiệu quả thu phí</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fees">Khoản phí</TabsTrigger>
            <TabsTrigger value="payments">Thanh toán</TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="space-y-4">
            {/* Fee Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Tìm kiếm khoản phí</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mô tả..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả loại phí" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại phí</SelectItem>
                      {Object.entries(feeTypeNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFeeTypeFilter('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fees List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách khoản phí ({filteredFees.length})</CardTitle>
                <CardDescription>Quản lý các khoản phí của đội bóng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFees.map(fee => {
                    const totalPaid = fee.payments
                      .filter(p => p.status === 'COMPLETED')
                      .reduce((sum, p) => sum + p.amount, 0);
                    const paymentCount = fee.payments.filter(p => p.status === 'COMPLETED').length;

                    return (
                      <Card key={fee.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{fee.title}</h3>
                                <Badge variant="outline" className={getFeeTypeColor(fee.type)}>
                                  {feeTypeNames[fee.type as keyof typeof feeTypeNames]}
                                </Badge>
                              </div>

                              {fee.description && (
                                <p className="mb-2 text-muted-foreground">{fee.description}</p>
                              )}

                              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                <div>
                                  <span className="font-medium">Số tiền: </span>
                                  <span className="text-lg font-bold text-primary">
                                    {formatCurrency(fee.amount)}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium">Đã thu: </span>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(totalPaid)} ({paymentCount} lượt)
                                  </span>
                                </div>

                                {fee.dueDate && (
                                  <div>
                                    <span className="font-medium">Hạn cuối: </span>
                                    <span>{formatDate(fee.dueDate)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-4 flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditFee(fee)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFee(fee.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredFees.length === 0 && (
                  <div className="py-8 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">Không tìm thấy khoản phí</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm || feeTypeFilter !== 'all'
                        ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                        : 'Bắt đầu bằng cách tạo khoản phí mới.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {/* Payment Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Tìm kiếm thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, khoản phí..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {Object.entries(paymentStatusNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setPaymentStatusFilter('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payments List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách thanh toán ({filteredPayments.length})</CardTitle>
                <CardDescription>Lịch sử thanh toán của các thành viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayments.map(payment => (
                    <Card key={payment.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              <h3 className="font-semibold">{payment.member.fullName}</h3>
                              <Badge variant={getPaymentStatusVariant(payment.status)}>
                                {
                                  paymentStatusNames[
                                    payment.status as keyof typeof paymentStatusNames
                                  ]
                                }
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <span className="font-medium">Khoản phí: </span>
                                <span>{payment.fee.title}</span>
                              </div>

                              <div>
                                <span className="font-medium">Số tiền: </span>
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(payment.amount)}
                                </span>
                              </div>

                              <div>
                                <span className="font-medium">Phương thức: </span>
                                <span>
                                  {
                                    paymentMethodNames[
                                      payment.method as keyof typeof paymentMethodNames
                                    ]
                                  }
                                </span>
                              </div>

                              <div>
                                <span className="font-medium">Ngày thanh toán: </span>
                                <span>{formatDate(payment.paidAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPayment(payment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPayments.length === 0 && (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">Không tìm thấy thanh toán</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm || paymentStatusFilter !== 'all'
                        ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                        : 'Chưa có thanh toán nào được ghi nhận.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <FeeForm
          isOpen={isFeeFormOpen}
          onClose={() => setIsFeeFormOpen(false)}
          onSuccess={handleFormSuccess}
          fee={selectedFee}
        />

        <PaymentForm
          isOpen={isPaymentFormOpen}
          onClose={() => setIsPaymentFormOpen(false)}
          onSuccess={handleFormSuccess}
          payment={selectedPayment}
        />
      </div>
    </AppLayout>
  );
}
