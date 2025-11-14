import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  USER_ROLES, 
  USER_IDS, 
  DEFAULT_CREDENTIALS, 
  TOKEN_CONFIG, 
  HTTP_STATUS, 
  HTTP_METHODS,
  MEMBER_NAMES
} from '../../../shared/src/constants/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === HTTP_METHODS.OPTIONS) {
      res.status(HTTP_STATUS.OK).end();
      return;
    }

    if (req.method !== HTTP_METHODS.POST) {
      res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ error: 'Method not allowed' });
      return;
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email and password are required' });
      return;
    }

    // Route to NestJS auth service for proper JWT authentication
    try {
      const nestApp = await import('../index').then(m => m.createNestApp ? m.createNestApp() : null);
      if (nestApp) {
        const expressReq = {
          ...req,
          url: '/auth/login',
          path: '/auth/login',
          originalUrl: '/auth/login',
          body: { email, password }
        };
        return nestApp.getHttpAdapter().getInstance()(expressReq, res);
      }
    } catch (error) {
      console.error('Failed to route to NestJS auth:', error);
    }

    // Fallback mock authentication if NestJS fails
    const validCredentials = [
      { 
        email: DEFAULT_CREDENTIALS.ADMIN.EMAIL, 
        password: DEFAULT_CREDENTIALS.ADMIN.PASSWORD, 
        role: DEFAULT_CREDENTIALS.ADMIN.ROLE,
        id: DEFAULT_CREDENTIALS.ADMIN.ID
      },
      { 
        email: DEFAULT_CREDENTIALS.MEMBER.EMAIL, 
        password: DEFAULT_CREDENTIALS.MEMBER.PASSWORD, 
        role: DEFAULT_CREDENTIALS.MEMBER.ROLE,
        id: DEFAULT_CREDENTIALS.MEMBER.ID
      },
    ];

    const user = validCredentials.find(u => u.email === email && u.password === password);

    if (user) {
      // Create a more JWT-like token structure
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = currentTime + (TOKEN_CONFIG.EXPIRY_DAYS * TOKEN_CONFIG.SECONDS_PER_DAY);
      
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: currentTime,
        exp: expiryTime
      };
      
      // Simple JWT-like token (base64 encoded payload)
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');

      res.status(HTTP_STATUS.OK).json({
        user: {
          id: payload.sub,
          email: user.email,
          role: user.role,
          member: user.role === USER_ROLES.MEMBER ? { id: USER_IDS.DEFAULT_MEMBER, fullName: MEMBER_NAMES.DEFAULT_MEMBER_FULL_NAME } : null,
        },
        access_token: token,
      });
      return;
    }

    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
