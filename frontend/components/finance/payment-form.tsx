'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface Payment {
  id?: string;
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

interface Member {
  id: string;
  fullName: string;
}

interface Fee {
  id: string;
  title: string;
  amount: number;
}

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment?: Payment | null;
}

const initialFormData = {
  memberId: '',
  feeId: '',
  amount: '',
  method: 'CASH',
  status: 'COMPLETED',
  paidAt: '',
};

export function PaymentForm({ isOpen, onClose, onSuccess, payment }: PaymentFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [members, setMembers] = useState<Member[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (payment) {
      const paidDate = payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : '';

      setFormData({
        memberId: payment.member.id,
        feeId: payment.fee.id,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        paidAt: paidDate,
      });
    } else {
      setFormData({
        ...initialFormData,
        paidAt: new Date().toISOString().split('T')[0], // Default to today
      });
    }
    setError('');
  }, [payment, isOpen]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [membersResponse, feesResponse] = await Promise.all([
        api.get('/members'),
        api.get('/finance/fees'),
      ]);
      setMembers(membersResponse.data.data || []);
      setFees(feesResponse.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeeChange = (feeId: string) => {
    const selectedFee = fees.find(f => f.id === feeId);
    setFormData(prev => ({
      ...prev,
      feeId,
      amount: selectedFee ? selectedFee.amount.toString() : prev.amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        memberId: formData.memberId,
        feeId: formData.feeId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : undefined,
      };

      if (payment?.id) {
        await api.put(`/finance/payments/${payment.id}`, payload);
      } else {
        await api.post('/finance/payments', payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{payment ? 'Chỉnh sửa thanh toán' : 'Ghi nhận thanh toán'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Cập nhật thông tin thanh toán' : 'Ghi nhận thanh toán mới từ thành viên'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberId">Thành viên *</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={value => handleChange('memberId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feeId">Khoản phí *</Label>
                <Select value={formData.feeId} onValueChange={handleFeeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoản phí" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map(fee => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.title} -{' '}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(fee.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền (VND) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="200000"
                    min="0"
                    step="1000"
                    value={formData.amount}
                    onChange={e => handleChange('amount', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Phương thức *</Label>
                  <Select
                    value={formData.method}
                    onValueChange={value => handleChange('method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tiền mặt</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                      <SelectItem value="FAILED">Thất bại</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAt">Ngày thanh toán</Label>
                  <Input
                    id="paidAt"
                    type="date"
                    value={formData.paidAt}
                    onChange={e => handleChange('paidAt', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {payment ? 'Cập nhật' : 'Ghi nhận'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
