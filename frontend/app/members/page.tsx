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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/axios';
import { MemberForm } from '@/components/members/member-form';

interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  position: string;
  memberType: string;
  status: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  user: {
    email: string;
  };
}

const positionNames = {
  GOALKEEPER: 'Thủ môn',
  DEFENDER: 'Hậu vệ',
  MIDFIELDER: 'Tiền vệ',
  FORWARD: 'Tiền đạo',
};

const memberTypeNames = {
  OFFICIAL: 'Chính thức',
  TRIAL: 'Thử việc',
  GUEST: 'Khách mời',
};

const statusNames = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm nghỉ',
  LEFT: 'Đã rời đội',
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/members');
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = useCallback(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(
        member =>
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone?.includes(searchTerm)
      );
    }

    if (positionFilter !== 'all') {
      filtered = filtered.filter(member => member.position === positionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, positionFilter, statusFilter]);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [filterMembers]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'LEFT':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case 'OFFICIAL':
        return 'text-green-600';
      case 'TRIAL':
        return 'text-yellow-600';
      case 'GUEST':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadMembers();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await api.delete(`/members/${memberId}`);
        loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    inactive: members.filter(m => m.status === 'INACTIVE').length,
    left: members.filter(m => m.status === 'LEFT').length,
  };

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
            <h1 className="text-3xl font-bold">Quản lý thành viên</h1>
            <p className="text-muted-foreground">Quản lý thông tin thành viên đội bóng</p>
          </div>
          <Button onClick={handleAddMember}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thành viên
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thành viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tạm nghỉ</CardTitle>
              <UserX className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã rời đội</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.left}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, SĐT..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả vị trí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vị trí</SelectItem>
                  {Object.entries(positionNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {Object.entries(statusNames).map(([key, name]) => (
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
                  setPositionFilter('all');
                  setStatusFilter('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thành viên ({filteredMembers.length})</CardTitle>
            <CardDescription>Danh sách tất cả thành viên trong đội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map(member => (
                <Card key={member.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.fullName} />
                        <AvatarFallback>
                          {member.fullName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate font-semibold">{member.fullName}</h3>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {member.nickname && (
                          <p className="text-sm text-muted-foreground">"{member.nickname}"</p>
                        )}

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Vị trí:</span>
                            <Badge variant="outline">
                              {positionNames[member.position as keyof typeof positionNames]}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Loại:</span>
                            <span
                              className={`text-sm font-medium ${getMemberTypeColor(member.memberType)}`}
                            >
                              {memberTypeNames[member.memberType as keyof typeof memberTypeNames]}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Trạng thái:</span>
                            <Badge variant={getStatusBadgeVariant(member.status)}>
                              {statusNames[member.status as keyof typeof statusNames]}
                            </Badge>
                          </div>

                          {member.dateOfBirth && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tuổi:</span>
                              <span className="text-sm">
                                {calculateAge(member.dateOfBirth)} tuổi
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="max-w-32 truncate text-sm" title={member.user.email}>
                              {member.user.email}
                            </span>
                          </div>

                          {member.phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">SĐT:</span>
                              <span className="text-sm">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="py-8 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Không tìm thấy thành viên</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || positionFilter !== 'all' || statusFilter !== 'all'
                    ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                    : 'Bắt đầu bằng cách thêm thành viên mới.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <MemberForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          member={selectedMember}
        />
      </div>
    </AppLayout>
  );
}
