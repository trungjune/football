import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from '../src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function createApp() {
  if (!app) {
    try {
      console.log('Creating NestJS app...');
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });

      // Security middleware
      app.use(
        helmet({
          contentSecurityPolicy: false, // Disable for API
        }),
      );
      app.use(compression());

      // CORS configuration
      app.enableCors({
        origin: [
          'http://localhost:3000',
          'https://football-team-manager-pi.vercel.app',
          'https://football-team-manager-lxgd8g0x4-trungs-projects-4a25ad7a.vercel.app',
          /\.vercel\.app$/,
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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

      // Don't set global prefix here since Vercel routing handles /api

      // Swagger setup (only in development)
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
      console.log('NestJS app initialized successfully');
    } catch (error) {
      console.error('Error creating NestJS app:', error);
      throw error;
    }
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Add request logging
    console.log(`${req.method} ${req.url}`);

    const app = await createApp();
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance();

    // Handle the request
    return instance(req, res);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    console.error('Stack trace:', error.stack);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString(),
    });
  }
}
