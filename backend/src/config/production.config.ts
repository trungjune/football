export default () => ({
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    logging: false,
    synchronize: false, // Never use synchronize in production
    migrationsRun: true,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Security configuration
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    cors: {
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.FROM_EMAIL,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: ['console'],
  },

  // Monitoring configuration
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    },
  },

  // Application configuration
  app: {
    port: parseInt(process.env.PORT || '3001'),
    globalPrefix: 'api',
    version: process.env.npm_package_version || '1.0.0',
  },

  // Feature flags
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableAuditLogging: process.env.AUDIT_LOGGING_ENABLED === 'true',
  },
});
