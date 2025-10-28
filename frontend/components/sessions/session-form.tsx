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

interface Session {
  id?: string;
  title: string;
  description?: string;
  datetime: string;
  location: string;
  type: string;
  maxParticipants?: number;
  registrationDeadline?: string;
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session?: Session | null;
}

const initialFormData = {
  title: '',
  description: '',
  datetime: '',
  location: '',
  type: 'TRAINING',
  maxParticipants: '',
  registrationDeadline: '',
};

export function SessionForm({ isOpen, onClose, onSuccess, session }: SessionFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      const sessionDate = new Date(session.datetime);
      const registrationDate = session.registrationDeadline
        ? new Date(session.registrationDeadline)
        : null;

      setFormData({
        title: session.title,
        description: session.description || '',
        datetime: sessionDate.toISOString().slice(0, 16), // Format for datetime-local input
        location: session.location,
        type: session.type,
        maxParticipants: session.maxParticipants?.toString() || '',
        registrationDeadline: registrationDate ? registrationDate.toISOString().slice(0, 16) : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [session, isOpen]);

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
        datetime: new Date(formData.datetime).toISOString(),
        location: formData.location,
        type: formData.type,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : undefined,
      };

      if (session?.id) {
        await api.put(`/sessions/${session.id}`, payload);
      } else {
        await api.post('/sessions', payload);
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
          <DialogTitle>{session ? 'Chỉnh sửa buổi tập' : 'Tạo buổi tập mới'}</DialogTitle>
          <DialogDescription>
            {session
              ? 'Cập nhật thông tin buổi tập hoặc trận đấu'
              : 'Tạo buổi tập hoặc trận đấu mới cho đội bóng'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Buổi tập kỹ thuật"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về buổi tập..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange('description', e.target.value)
                }
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại hoạt động *</Label>
              <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRAINING">Buổi tập</SelectItem>
                  <SelectItem value="FRIENDLY_MATCH">Giao hữu</SelectItem>
                  <SelectItem value="TOURNAMENT">Giải đấu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime">Ngày giờ *</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={formData.datetime}
                onChange={e => handleChange('datetime', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Địa điểm *</Label>
              <Input
                id="location"
                type="text"
                placeholder="Sân bóng ABC, 123 Đường XYZ"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Số người tối đa</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="14"
                min="1"
                value={formData.maxParticipants}
                onChange={e => handleChange('maxParticipants', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Hạn đăng ký</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={e => handleChange('registrationDeadline', e.target.value)}
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
              {session ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
