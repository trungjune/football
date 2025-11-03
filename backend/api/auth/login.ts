import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface VercelRequest {
  method?: string;
  body?: {
    email?: string;
    password?: string;
  };
  query?: { [key: string]: string | string[] };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: Record<string, unknown>) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

// Initialize Prisma client lazily
let prisma: unknown = null;

async function getPrismaClient() {
  if (!prisma) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      throw new Error('Database connection failed');
    }
  }
  return prisma;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Temporary mock authentication for deployment testing
    if (email === 'admin@test.com' && password === 'admin') {
      // Generate JWT
      const token = jwt.sign(
        {
          sub: '1',
          email: 'admin@test.com',
          role: 'ADMIN',
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' },
      );

      res.status(200).json({
        user: {
          id: '1',
          email: 'admin@test.com',
          role: 'ADMIN',
          member: null,
        },
        access_token: token,
      });
      return;
    }

    // For now, return invalid credentials for other attempts
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      message: errorMessage,
    });
  }
}
