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

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Simple mock authentication
    const validCredentials = [
      { email: 'admin@football.com', password: 'admin123', role: 'ADMIN' },
      { email: 'nguyen.huu.phuc.fcvuive@gmail.com', password: 'admin123', role: 'MEMBER' },
    ];

    const user = validCredentials.find(u => u.email === email && u.password === password);

    if (user) {
      // Simple token (in production, use proper JWT)
      const token = Buffer.from(`${user.email}:${user.role}:${Date.now()}`).toString('base64');

      res.status(200).json({
        user: {
          id: user.email === 'admin@football.com' ? '1' : '2',
          email: user.email,
          role: user.role,
          member: user.role === 'MEMBER' ? { id: '1', fullName: 'Nguyễn Hữu Phúc' } : null,
        },
        access_token: token,
      });
      return;
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
