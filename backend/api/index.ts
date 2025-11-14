import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function createNestApp() {
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
    // Add CORS headers manually for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Route to specific handlers for auth endpoints
    const path = (req.query.path as string) || req.url || '/';
    
    console.log('API Handler - Path:', path, 'Method:', req.method, 'URL:', req.url);

    // Handle auth/login specifically - check multiple path formats
    if ((path === 'auth/login' || path === '/auth/login' || req.url?.includes('/auth/login')) && req.method === 'POST') {
      console.log('Routing to login handler');
      const loginHandler = await import('./auth/login');
      return loginHandler.default(req, res);
    }

    // Handle dashboard/stats specifically
    if ((path === 'dashboard/stats' || path === '/dashboard/stats' || req.url?.includes('/dashboard/stats')) && req.method === 'GET') {
      console.log('Routing to dashboard stats handler');
      const statsHandler = await import('./dashboard/stats');
      return statsHandler.default(req, res);
    }

    // Handle members API
    if ((path === 'members' || path === '/members' || req.url?.includes('/members')) && (req.method === 'GET' || req.method === 'POST')) {
      console.log('Routing to members handler');
      const membersHandler = await import('./members');
      return membersHandler.default(req, res);
    }

    // Handle sessions API
    if ((path === 'sessions' || path === '/sessions' || req.url?.includes('/sessions')) && (req.method === 'GET' || req.method === 'POST')) {
      console.log('Routing to sessions handler');
      const sessionsHandler = await import('./sessions');
      return sessionsHandler.default(req, res);
    }

    // Handle finance/fees API
    if ((path === 'finance/fees' || path === '/finance/fees' || req.url?.includes('/finance/fees')) && (req.method === 'GET' || req.method === 'POST')) {
      console.log('Routing to finance fees handler');
      const feesHandler = await import('./finance/fees');
      return feesHandler.default(req, res);
    }

    // For other endpoints, create and use NestJS app
    const nestApp = await createNestApp();

    // Transform Vercel request to Express-like request
    const expressReq = {
      ...req,
      url: `/${path}`,
      path: `/${path}`,
      originalUrl: `/${path}`,
    };

    console.log('Routing to NestJS app with path:', `/${path}`);
    return nestApp.getHttpAdapter().getInstance()(expressReq, res);
  } catch (error) {
    console.error('Handler error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  }
}
