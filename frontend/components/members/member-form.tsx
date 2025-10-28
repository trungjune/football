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

interface Member {
  id?: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  dateOfBirth?: string;
  position: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  memberType: string;
  status: string;
  user: {
    email: string;
  };
}

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: Member | null;
}

const initialFormData = {
  email: '',
  fullName: '',
  nickname: '',
  phone: '',
  dateOfBirth: '',
  position: '',
  height: '',
  weight: '',
  preferredFoot: '',
  memberType: 'OFFICIAL',
  status: 'ACTIVE',
};

export function MemberForm({ isOpen, onClose, onSuccess, member }: MemberFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        email: member.user.email,
        fullName: member.fullName,
        nickname: member.nickname || '',
        phone: member.phone || '',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
        position: member.position,
        height: member.height?.toString() || '',
        weight: member.weight?.toString() || '',
        preferredFoot: member.preferredFoot || '',
        memberType: member.memberType,
        status: member.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [member, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        email: formData.email,
        fullName: formData.fullName,
        nickname: formData.nickname || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        position: formData.position,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        preferredFoot: formData.preferredFoot || undefined,
        memberType: formData.memberType,
        status: formData.status,
      };

      if (member?.id) {
        await api.put(`/members/${member.id}`, payload);
      } else {
        await api.post('/members', payload);
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</DialogTitle>
          <DialogDescription>
            {member
              ? 'Cập nhật thông tin thành viên trong đội bóng'
              : 'Thêm thành viên mới vào đội bóng'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@email.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                disabled={isLoading || !!member}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Biệt danh</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Tên gọi trong đội"
                value={formData.nickname}
                onChange={e => handleChange('nickname', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0123456789"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={e => handleChange('dateOfBirth', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Vị trí thi đấu *</Label>
              <Select
                value={formData.position}
                onValueChange={value => handleChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOALKEEPER">Thủ môn</SelectItem>
                  <SelectItem value="DEFENDER">Hậu vệ</SelectItem>
                  <SelectItem value="MIDFIELDER">Tiền vệ</SelectItem>
                  <SelectItem value="FORWARD">Tiền đạo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={e => handleChange('height', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="65"
                value={formData.weight}
                onChange={e => handleChange('weight', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredFoot">Chân thuận</Label>
              <Select
                value={formData.preferredFoot}
                onValueChange={value => handleChange('preferredFoot', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chân thuận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEFT">Chân trái</SelectItem>
                  <SelectItem value="RIGHT">Chân phải</SelectItem>
                  <SelectItem value="BOTH">Cả hai chân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberType">Loại thành viên</Label>
              <Select
                value={formData.memberType}
                onValueChange={value => handleChange('memberType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại thành viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICIAL">Chính thức</SelectItem>
                  <SelectItem value="TRIAL">Thử việc</SelectItem>
                  <SelectItem value="GUEST">Khách mời</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Tạm nghỉ</SelectItem>
                  <SelectItem value="LEFT">Đã rời đội</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {member ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
