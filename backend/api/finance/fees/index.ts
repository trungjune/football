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
      // Mock fees data
      const fees = [
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

      res.status(200).json({ data: fees });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Finance fees API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
