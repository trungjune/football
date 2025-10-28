# Deployment Guide - Football Team Management System

This guide covers the deployment process for the Football Team Management System to Vercel.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [Vercel CLI](https://vercel.com/cli) installed globally
- [Git](https://git-scm.com/) for version control
- Database setup (Neon PostgreSQL recommended)

## Quick Start

1. **Clone and setup the project:**

   ```bash
   git clone <your-repo-url>
   cd football-team-management
   npm install
   ```

2. **Setup environment variables:**

   ```bash
   ./scripts/setup-env.sh
   ```

3. **Deploy to Vercel:**
   ```bash
   ./scripts/deploy.sh production
   ```

## Environment Variables

### Required Variables

| Variable         | Description                         | Example                               |
| ---------------- | ----------------------------------- | ------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string        | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`     | Secret key for JWT tokens           | `your-super-secret-key`               |
| `ENCRYPTION_KEY` | 32-byte hex key for data encryption | `generated-by-setup-script`           |

### Optional Variables

| Variable                | Description               | Default |
| ----------------------- | ------------------------- | ------- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | -       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | -       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | -       |
| `REDIS_URL`             | Redis connection string   | -       |
| `SENTRY_DSN`            | Sentry error tracking DSN | -       |
| `SMTP_HOST`             | Email SMTP server         | -       |
| `SMTP_PORT`             | Email SMTP port           | `587`   |
| `SMTP_USER`             | Email username            | -       |
| `SMTP_PASS`             | Email password            | -       |
| `FROM_EMAIL`            | From email address        | -       |

### Security Variables

| Variable                | Description             | Default   |
| ----------------------- | ----------------------- | --------- |
| `RATE_LIMIT_WINDOW_MS`  | Rate limit window in ms | `60000`   |
| `RATE_LIMIT_MAX`        | Max requests per window | `100`     |
| `MAX_FILE_SIZE`         | Max file upload size    | `5242880` |
| `PASSWORD_MIN_LENGTH`   | Minimum password length | `8`       |
| `AUDIT_LOGGING_ENABLED` | Enable audit logging    | `true`    |

## Database Setup

### Using Neon (Recommended)

1. Create a [Neon](https://neon.tech/) account
2. Create a new project
3. Copy the connection string
4. Set it as `DATABASE_URL` environment variable

### Database Migration

The application will automatically run migrations on deployment. For manual migration:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Setup environment variables:**

   ```bash
   ./scripts/setup-env.sh
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh production
   ```

### Method 2: Manual Deployment

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Method 3: GitHub Integration

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch for automatic deployment

## CI/CD Pipeline

The project includes GitHub Actions workflow for:

- **Testing:** Run unit tests and linting
- **Security:** Vulnerability scanning
- **Preview:** Deploy preview for pull requests
- **Production:** Deploy to production on main branch

### Required GitHub Secrets

| Secret              | Description                 |
| ------------------- | --------------------------- |
| `VERCEL_TOKEN`      | Vercel authentication token |
| `VERCEL_ORG_ID`     | Vercel organization ID      |
| `VERCEL_PROJECT_ID` | Vercel project ID           |

## Post-Deployment

### Health Checks

After deployment, verify the application is working:

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": { "status": "connected" },
    "security": { "status": "active" },
    "audit": { "status": "active" }
  }
}
```

### Monitoring

- **Health Check:** `/api/health`
- **Readiness Check:** `/api/health/ready`
- **Liveness Check:** `/api/health/live`
- **Security Dashboard:** `/api/security/health`

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection:**
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from Vercel
   - Ensure SSL is enabled for production

3. **Environment Variables:**
   - Use `vercel env ls` to check variables
   - Ensure secrets are properly set
   - Check variable names match exactly

4. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure MIME types are allowed

### Logs and Debugging

1. **View deployment logs:**

   ```bash
   vercel logs
   ```

2. **Check function logs:**

   ```bash
   vercel logs --follow
   ```

3. **Debug locally:**
   ```bash
   vercel dev
   ```

## Security Considerations

### Production Security

- All sensitive data is encrypted
- Rate limiting is enabled
- Security headers are configured
- Audit logging is active
- CORS is properly configured

### Regular Maintenance

- Monitor security events: `/api/security/events`
- Review audit logs: `/api/security/audit-logs`
- Check blocked IPs: `/api/security/blocked-ips`
- Apply data retention: `/api/data-protection/retention/apply`

## Performance Optimization

### Caching Strategy

- Static assets cached by Vercel CDN
- API responses cached with appropriate headers
- Database queries optimized with Prisma
- Redis caching for frequently accessed data

### Monitoring

- Vercel Analytics for performance metrics
- Sentry for error tracking
- Custom health checks for system status
- Audit logs for security monitoring

## Backup and Recovery

### Database Backup

Neon provides automatic backups. For manual backup:

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Environment Backup

Export environment variables:

```bash
vercel env pull .env.production
```

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Vercel logs
3. Check GitHub Actions workflow
4. Verify environment variables
5. Test health endpoints

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Production](https://docs.nestjs.com/techniques/performance)
