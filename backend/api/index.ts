// Vercel serverless function entry point
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Security middleware
    app.use(helmet());
    app.use(compression());
    
    // CORS configuration
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.vercel.app'] 
        : ['http://localhost:3000'],
      credentials: true,
    });
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Football Team Management API')
        .setDescription('API for managing football teams')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }
    
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}