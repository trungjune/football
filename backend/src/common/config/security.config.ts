export const securityConfig = {
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // File upload security
  fileUpload: {
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
    maxFiles: parseInt(process.env.MAX_FILES_PER_REQUEST || '10'),
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Password policy
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
    maxAttempts: parseInt(process.env.PASSWORD_MAX_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.PASSWORD_LOCKOUT_DURATION || '900000'), // 15 minutes
  },

  // Session configuration
  session: {
    maxSessions: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
  },

  // Security headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },

  // IP blocking configuration
  ipBlocking: {
    maxViolations: parseInt(process.env.MAX_SECURITY_VIOLATIONS || '3'),
    blockDuration: parseInt(process.env.IP_BLOCK_DURATION || '3600000'), // 1 hour
    permanentBlockThreshold: parseInt(process.env.PERMANENT_BLOCK_THRESHOLD || '10'),
  },

  // Audit logging
  audit: {
    enabled: process.env.AUDIT_LOGGING_ENABLED === 'true',
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
    maxLogSize: parseInt(process.env.MAX_AUDIT_LOG_SIZE || '10485760'), // 10MB
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90'),
  },

  // Encryption
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '32'),
    ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH || '16'),
  },
};
