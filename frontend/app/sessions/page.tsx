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
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { SessionForm } from '@/components/sessions/session-form';

interface Session {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  location: string;
  type: string;
  maxParticipants?: number;
  registrationDeadline?: string;
  registrations: Array<{
    id: string;
    member: {
      id: string;
      fullName: string;
    };
  }>;
  attendances: Array<{
    id: string;
    status: string;
    member: {
      id: string;
      fullName: string;
    };
  }>;
}

const sessionTypeNames = {
  TRAINING: 'Buổi tập',
  FRIENDLY_MATCH: 'Giao hữu',
  TOURNAMENT: 'Giải đấu',
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = useCallback(() => {
    let filtered = sessions;

    if (searchTerm) {
      filtered = filtered.filter(
        session =>
          session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      const now = new Date();
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(session => new Date(session.datetime) > now);
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(session => new Date(session.datetime) <= now);
      }
    }

    // Sort by datetime (upcoming first)
    filtered.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    setFilteredSessions(filtered);
  }, [sessions, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [filterSessions]);

  const handleAddSession = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadSessions();
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa buổi tập này?')) {
      try {
        await api.delete(`/sessions/${sessionId}`);
        loadSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const sessionDate = new Date(session.datetime);
    const registrationDeadline = session.registrationDeadline
      ? new Date(session.registrationDeadline)
      : null;

    if (sessionDate < now) {
      return { label: 'Đã kết thúc', variant: 'secondary' as const };
    } else if (registrationDeadline && registrationDeadline < now) {
      return { label: 'Hết hạn đăng ký', variant: 'destructive' as const };
    } else {
      return { label: 'Đang mở đăng ký', variant: 'default' as const };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TRAINING':
        return 'text-blue-600';
      case 'FRIENDLY_MATCH':
        return 'text-green-600';
      case 'TOURNAMENT':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter(s => new Date(s.datetime) > new Date()).length,
    past: sessions.filter(s => new Date(s.datetime) <= new Date()).length,
    training: sessions.filter(s => s.type === 'TRAINING').length,
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
            <h1 className="text-3xl font-bold">Quản lý buổi tập</h1>
            <p className="text-muted-foreground">Quản lý lịch tập và trận đấu của đội</p>
          </div>
          <Button onClick={handleAddSession}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo buổi tập
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng buổi tập</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sắp tới</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã kết thúc</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buổi tập</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.training}</div>
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
                  placeholder="Tìm kiếm theo tên, địa điểm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {Object.entries(sessionTypeNames).map(([key, name]) => (
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
                  <SelectItem value="upcoming">Sắp tới</SelectItem>
                  <SelectItem value="past">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách buổi tập ({filteredSessions.length})</CardTitle>
            <CardDescription>Danh sách tất cả buổi tập và trận đấu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSessions.map(session => {
                const status = getSessionStatus(session);
                const registrationCount = session.registrations?.length || 0;
                const attendanceCount = session.attendances?.length || 0;

                return (
                  <Card key={session.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{session.title}</h3>
                            <Badge variant="outline" className={getTypeColor(session.type)}>
                              {sessionTypeNames[session.type as keyof typeof sessionTypeNames]}
                            </Badge>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>

                          {session.description && (
                            <p className="mb-2 text-muted-foreground">{session.description}</p>
                          )}

                          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDateTime(session.datetime)}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {registrationCount} đăng ký
                                {session.maxParticipants && ` / ${session.maxParticipants} tối đa`}
                                {attendanceCount > 0 && ` • ${attendanceCount} tham gia`}
                              </span>
                            </div>
                          </div>

                          {session.registrationDeadline && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Hạn đăng ký: {formatDateTime(session.registrationDeadline)}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
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

            {filteredSessions.length === 0 && (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Không tìm thấy buổi tập</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Thử thay đổi bộ lọc để xem thêm kết quả.'
                    : 'Bắt đầu bằng cách tạo buổi tập mới.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <SessionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          session={selectedSession}
        />
      </div>
    </AppLayout>
  );
}
