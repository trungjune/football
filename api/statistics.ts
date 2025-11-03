import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Mock statistics data
  const stats = {
    totalMembers: 15,
    activeSessions: 3,
    upcomingMatches: 2,
    attendanceRate: 85,
    monthlyStats: {
      newMembers: 3,
      completedSessions: 12,
      totalRevenue: 2500000,
      expenses: 1800000,
    },
    recentActivity: [
      { type: 'member_joined', message: 'Nguyễn Văn A đã tham gia đội', time: '2 giờ trước' },
      {
        type: 'session_completed',
        message: 'Buổi tập kỹ thuật đã hoàn thành',
        time: '1 ngày trước',
      },
      {
        type: 'payment_received',
        message: 'Thanh toán phí tháng 11 từ 5 thành viên',
        time: '2 ngày trước',
      },
    ],
  };

  return res.status(200).json(stats);
}
