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
      // Mock members data
      const members = [
        {
          id: '1',
          fullName: 'Nguyễn Văn A',
          nickname: 'A',
          position: 'MIDFIELDER',
          memberType: 'OFFICIAL',
          status: 'ACTIVE',
          phone: '0123456789',
          dateOfBirth: '1995-01-01',
          user: {
            email: 'a@football.com'
          }
        },
        {
          id: '2',
          fullName: 'Trần Văn B',
          nickname: 'B',
          position: 'FORWARD',
          memberType: 'OFFICIAL',
          status: 'ACTIVE',
          phone: '0987654321',
          dateOfBirth: '1996-02-02',
          user: {
            email: 'b@football.com'
          }
        },
        {
          id: '3',
          fullName: 'Lê Văn C',
          nickname: 'C',
          position: 'DEFENDER',
          memberType: 'TRIAL',
          status: 'ACTIVE',
          phone: '0111222333',
          dateOfBirth: '1997-03-03',
          user: {
            email: 'c@football.com'
          }
        }
      ];

      res.status(200).json({ data: members });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Members API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
