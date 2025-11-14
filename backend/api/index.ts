import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HTTP_STATUS, HTTP_METHODS, API_PATHS, DEFAULT_CREDENTIALS, TOKEN_CONFIG } from '../../shared/src/constants/auth';

let app: any;

export async function createNestApp() {
  if (!app) {
    try {
      app = await NestFactory.create(AppModule, {
        logger:
          process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'log'],
      });

      // Security middleware
      app.use(
        helmet({
          contentSecurityPolicy: false,
          crossOriginEmbedderPolicy: false,
        }),
      );
      app.use(compression());

      // CORS configuration - Allow all origins for now
      app.enableCors({
        origin: true, // Allow all origins including null (file://)
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        optionsSuccessStatus: 200, // For legacy browser support
      });

      // Global validation pipe
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
      );

      // Don't set global prefix in serverless - handle routing manually

      // Swagger documentation (development only)
      if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
          .setTitle('Football Team Management API')
          .setDescription('API for managing football teams, members, sessions, and finances')
          .setVersion('1.0')
          .addBearerAuth()
          .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document);
      }

      await app.init();
    } catch (error) {
      console.error('Failed to create NestJS app:', error);
      throw error;
    }
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === HTTP_METHODS.OPTIONS) {
      res.status(HTTP_STATUS.OK).end();
      return;
    }

    const path = (req.query.path as string) || req.url || '/';
    const cleanPath = path.replace(/^\/+|\/+$/g, '');

    // Temporary fallback for auth/login if NestJS fails
    if (cleanPath === API_PATHS.AUTH_LOGIN && req.method === HTTP_METHODS.POST) {
      try {
        const nestApp = await createNestApp();
        const expressReq = { ...req, url: `/${cleanPath}`, path: `/${cleanPath}`, originalUrl: `/${cleanPath}` };
        return nestApp.getHttpAdapter().getInstance()(expressReq, res);
      } catch (nestError) {
        console.error('NestJS failed, using fallback login:', nestError);
        
        const { email, password } = req.body || {};
        if (!email || !password) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email and password are required' });
        }

        // Fallback credentials
        if (email === DEFAULT_CREDENTIALS.ADMIN.EMAIL && password === DEFAULT_CREDENTIALS.ADMIN.PASSWORD) {
          // Create proper JWT-like structure
          const user = {
            id: DEFAULT_CREDENTIALS.ADMIN.ID,
            email: DEFAULT_CREDENTIALS.ADMIN.EMAIL,
            role: DEFAULT_CREDENTIALS.ADMIN.ROLE,
            createdAt: new Date(),
            updatedAt: new Date(),
            phone: '0123456789',
            image: null,
            member: null
          };

          const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (TOKEN_CONFIG.EXPIRY_DAYS * TOKEN_CONFIG.SECONDS_PER_DAY)
          };

          const token = Buffer.from(JSON.stringify(payload)).toString('base64');

          return res.status(HTTP_STATUS.OK).json({
            user,
            access_token: token,
          });
        }

        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials' });
      }
    }

    // Temporary mock data for other endpoints if NestJS fails
    try {
      const nestApp = await createNestApp();
      const expressReq = { ...req, url: `/${cleanPath}`, path: `/${cleanPath}`, originalUrl: `/${cleanPath}` };
      return nestApp.getHttpAdapter().getInstance()(expressReq, res);
    } catch (nestError) {
      console.error('NestJS failed for path:', cleanPath, nestError);
      
      // Fallback mock responses
      if (cleanPath === 'members' && req.method === HTTP_METHODS.GET) {
        const { mockMembers } = await import('../../shared/src/mock-data');
        return res.status(HTTP_STATUS.OK).json({ data: mockMembers });
      }
      
      if (cleanPath === 'dashboard/stats' && req.method === HTTP_METHODS.GET) {
        const { mockStats } = await import('../../shared/src/mock-data');
        return res.status(HTTP_STATUS.OK).json(mockStats);
      }
      
      if (cleanPath === 'sessions' && req.method === HTTP_METHODS.GET) {
        const { mockSessions } = await import('../../shared/src/mock-data');
        return res.status(HTTP_STATUS.OK).json({ data: mockSessions });
      }
      
      if (cleanPath === 'finance/fees' && req.method === HTTP_METHODS.GET) {
        const { mockFees } = await import('../../shared/src/mock-data');
        return res.status(HTTP_STATUS.OK).json({ data: mockFees });
      }
      
      // Default 404 for unknown endpoints
      return res.status(404).json({ error: 'Endpoint not found', path: cleanPath });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  }
}
