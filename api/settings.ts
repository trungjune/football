import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Mock settings data
    const settings = {
      teamName: 'FC Vui Vẻ',
      teamLogo: '/icons/icon-192x192.png',
      defaultSessionDuration: 90, // minutes
      registrationDeadlineHours: 24,
      maxParticipants: 22,
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
      },
      fees: {
        monthlyFee: 200000,
        sessionFee: 50000,
        lateFee: 20000,
      },
    };

    return res.status(200).json(settings);
  }

  if (req.method === 'PUT') {
    // Mock update settings
    const updatedSettings = req.body;

    return res.status(200).json({
      message: 'Cài đặt đã được cập nhật thành công',
      settings: updatedSettings,
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
