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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface Fee {
  id?: string;
  title: string;
  description?: string;
  amount: number;
  type: string;
  dueDate?: string;
}

interface FeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fee?: Fee | null;
}

const initialFormData = {
  title: '',
  description: '',
  amount: '',
  type: 'MONTHLY',
  dueDate: '',
};

export function FeeForm({ isOpen, onClose, onSuccess, fee }: FeeFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fee) {
      const dueDate = fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '';

      setFormData({
        title: fee.title,
        description: fee.description || '',
        amount: fee.amount.toString(),
        type: fee.type,
        dueDate,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [fee, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        type: formData.type,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };

      if (fee?.id) {
        await api.put(`/finance/fees/${fee.id}`, payload);
      } else {
        await api.post('/finance/fees', payload);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{fee ? 'Chỉnh sửa khoản phí' : 'Tạo khoản phí mới'}</DialogTitle>
          <DialogDescription>
            {fee ? 'Cập nhật thông tin khoản phí' : 'Tạo khoản phí mới cho đội bóng'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên khoản phí *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Phí tháng 12/2024"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về khoản phí..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange('description', e.target.value)
                }
                disabled={isLoading}
                rows={3}
              />
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
                <Label htmlFor="type">Loại phí *</Label>
                <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Phí hàng tháng</SelectItem>
                    <SelectItem value="PER_SESSION">Phí theo buổi</SelectItem>
                    <SelectItem value="SPECIAL">Phí đặc biệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Hạn cuối thanh toán</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={e => handleChange('dueDate', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {fee ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
