import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET') {
      // Mock sessions data
      const sessions = [
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

      res.status(200).json({ data: sessions });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sessions API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
