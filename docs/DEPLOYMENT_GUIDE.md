# Deployment Guide - Football Team Management System

## Overview

This guide provides step-by-step instructions for deploying the Football Team Management System to production on Vercel.

## Prerequisites

Before starting the deployment process, ensure you have:

- [Node.js](https://nodejs.org/) 18 or higher
- [Git](https://git-scm.com/) for version control
- [Vercel CLI](https://vercel.com/cli) installed globally
- Access to the following services:
  - [Neon](https://neon.tech/) for PostgreSQL database
  - [Cloudinary](https://cloudinary.com/) for file storage
  - [Upstash](https://upstash.com/) for Redis (optional)
  - [Sentry](https://sentry.io/) for error tracking (optional)

## Quick Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd football-team-management

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Environment Setup

Run the automated environment setup script:

```bash
./scripts/setup-env.sh
```

This script will guide you through setting up all required environment variables.

### 3. Deploy

```bash
# Deploy to production
./scripts/deploy.sh production

# Or deploy to preview
./scripts/deploy.sh preview
```

## Manual Deployment

### Step 1: Database Setup

#### Using Neon PostgreSQL

1. Create a [Neon](https://neon.tech/) account
2. Create a new project
3. Create a database
4. Copy the connection string
5. Set as `DATABASE_URL` environment variable

#### Database Schema

The application uses Prisma for database management. The schema will be automatically applied during deployment.

### Step 2: Environment Variables

Set up the following environment variables in Vercel:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=32-byte-hex-encryption-key

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Optional Variables

```bash
# Caching (Redis)
REDIS_URL=redis://user:password@host:port

# Error Tracking (Sentry)
SENTRY_DSN=your-sentry-dsn

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourteam.com

# Security Configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=5242880
PASSWORD_MIN_LENGTH=8
AUDIT_LOGGING_ENABLED=true
```

### Step 3: Vercel Configuration

The project includes a `vercel.json` configuration file with optimized settings for production deployment.

#### Key Configuration Features

- **Monorepo Support**: Handles both frontend and backend
- **Environment Variables**: Secure handling of secrets
- **Cron Jobs**: Automated cleanup and maintenance
- **Security Headers**: Enhanced security configuration
- **Function Optimization**: Memory and timeout settings

### Step 4: Deploy to Vercel

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Using GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to main branch for automatic deployment

### Step 5: Post-Deployment Setup

#### Verify Deployment

1. Check deployment status in Vercel dashboard
2. Test health endpoint: `https://your-app.vercel.app/api/health`
3. Verify database connection
4. Test authentication flow

#### Initial Data Setup

1. Create admin user account
2. Configure team settings
3. Set up initial member data
4. Test all major features

## CI/CD Pipeline

The project includes GitHub Actions workflow for automated deployment:

### Workflow Features

- **Automated Testing**: Runs tests before deployment
- **Security Scanning**: Vulnerability checks
- **Preview Deployments**: Automatic preview for pull requests
- **Production Deployment**: Automatic deployment on main branch

### Required GitHub Secrets

Set up these secrets in your GitHub repository:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

## Production Configuration

### Security Settings

The production deployment includes:

- **Rate Limiting**: Prevents API abuse
- **Security Headers**: HSTS, CSP, XSS protection
- **Input Validation**: Comprehensive data sanitization
- **Audit Logging**: Complete activity tracking
- **IP Blocking**: Automatic threat protection

### Performance Optimization

- **CDN**: Vercel Edge Network for global distribution
- **Caching**: Redis for session and data caching
- **Database**: Connection pooling and query optimization
- **Images**: Cloudinary for optimized image delivery

### Monitoring

Production monitoring includes:

- **Health Checks**: Automated system health monitoring
- **Error Tracking**: Sentry integration for error reporting
- **Performance Metrics**: Response time and resource usage
- **Security Events**: Real-time security monitoring

## Maintenance

### Automated Tasks

The system includes automated cron jobs for:

- **Daily Cleanup**: Remove expired data and logs
- **Weekly Retention**: Apply data retention policies
- **Security Cleanup**: Process security events

### Manual Maintenance

#### Database Maintenance

```bash
# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (if needed)
npx prisma db seed
```

#### Backup Management

- Automated daily backups
- Manual backup creation via admin panel
- Backup verification and testing

### Updates and Upgrades

#### Application Updates

1. Test changes in development
2. Deploy to preview environment
3. Run automated tests
4. Deploy to production
5. Monitor for issues

#### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Build fails during deployment
**Solutions**:

- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors
- Ensure environment variables are set

#### Database Connection Issues

**Issue**: Cannot connect to database
**Solutions**:

- Verify DATABASE_URL is correct
- Check database server status
- Ensure SSL is properly configured
- Test connection from local environment

#### Environment Variable Issues

**Issue**: Missing or incorrect environment variables
**Solutions**:

- Use `vercel env ls` to check variables
- Verify variable names match exactly
- Check for typos in variable values
- Ensure secrets are properly encoded

#### Performance Issues

**Issue**: Slow response times
**Solutions**:

- Check Vercel function logs
- Monitor database query performance
- Verify Redis cache is working
- Review CDN cache settings

### Debugging

#### View Logs

```bash
# View deployment logs
vercel logs

# Follow real-time logs
vercel logs --follow

# View function logs
vercel logs --function=api
```

#### Local Development

```bash
# Run development server
vercel dev

# Test with production environment
vercel dev --prod
```

## Scaling

### Horizontal Scaling

Vercel automatically handles:

- Function scaling based on demand
- CDN distribution globally
- Database connection pooling

### Performance Optimization

- **Caching Strategy**: Implement Redis caching
- **Database Optimization**: Index optimization and query tuning
- **Image Optimization**: Use Cloudinary transformations
- **Code Splitting**: Optimize frontend bundle size

## Security

### Production Security Checklist

- [ ] All environment variables are secure
- [ ] Database uses SSL connections
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] Audit logging is active
- [ ] Regular security scans are performed
- [ ] Backup and recovery procedures are tested

### Security Monitoring

- Monitor security events dashboard
- Review audit logs regularly
- Check for blocked IPs and suspicious activity
- Update security policies as needed

## Support

### Getting Help

- **Documentation**: Check this guide and API documentation
- **Logs**: Review Vercel function logs and application logs
- **Health Checks**: Use built-in health endpoints
- **Community**: GitHub issues and discussions

### Emergency Contacts

- **Technical Issues**: tech-support@yourteam.com
- **Security Issues**: security@yourteam.com
- **General Support**: support@yourteam.com

---

This deployment guide is regularly updated. For the latest version, check the project repository.
