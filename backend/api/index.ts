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

    const app = await createNestApp();
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance();

    // Handle path from Vercel routing
    const path = req.query.path as string;
    if (path) {
      req.url = `/${path}`;
    }

    return instance(req, res);
  } catch (error) {
    console.error('Handler error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  }
}
