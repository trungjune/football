// Shared mock data for development
export const mockMembers = [
  {
    id: '1',
    fullName: 'Nguyễn Văn A',
    nickname: 'A',
    position: 'MIDFIELDER',
    memberType: 'OFFICIAL',
    status: 'ACTIVE',
    phone: '0123456789',
    dateOfBirth: '1995-01-01',
    user: { email: 'a@football.com' }
  },
  {
    id: '2',
    fullName: 'Trần Thị B',
    nickname: 'B',
    position: 'FORWARD',
    memberType: 'OFFICIAL',
    status: 'ACTIVE',
    phone: '0987654321',
    dateOfBirth: '1996-05-15',
    user: { email: 'b@football.com' }
  }
];

export const mockSessions = [
  {
    id: '1',
    title: 'Buổi tập kỹ thuật',
    datetime: '2024-01-15T16:00:00Z',
    location: 'Sân ABC',
    maxParticipants: 20,
    currentParticipants: 15,
    status: 'SCHEDULED'
  },
  {
    id: '2',
    title: 'Trận giao hữu',
    datetime: '2024-01-20T09:00:00Z',
    location: 'Sân XYZ',
    maxParticipants: 22,
    currentParticipants: 18,
    status: 'SCHEDULED'
  }
];

export const mockFees = [
  {
    id: '1',
    name: 'Phí tháng 1/2024',
    amount: 200000,
    dueDate: '2024-01-31T00:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Phí tháng 2/2024',
    amount: 200000,
    dueDate: '2024-02-29T00:00:00Z',
    status: 'ACTIVE'
  }
];

export const mockStats = {
  totalMembers: 15,
  upcomingSessions: 3,
  totalRevenue: 2500000,
  attendanceRate: 85,
};
