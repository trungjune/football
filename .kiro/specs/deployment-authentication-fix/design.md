# Design Document

## Overview

This design addresses the 404 authentication errors by implementing proper deployment configuration for both frontend and backend services, ensuring consistent URL configuration, and establishing reliable communication between the Next.js frontend and NestJS backend.

## Architecture

### Current State Analysis

- Frontend: Next.js app deployed on Vercel with NextAuth.js
- Backend: NestJS API with Prisma ORM, not currently deployed
- Database: Supabase PostgreSQL
- Authentication: NextAuth.js with credentials provider (currently mocked)

### Target Architecture

- Frontend: Next.js on Vercel with proper environment configuration
- Backend: NestJS API deployed on Vercel as serverless functions
- Database: Supabase PostgreSQL (existing)
- Authentication: Integrated NextAuth.js with real backend validation

## Components and Interfaces

### 1. Deployment Configuration

- **Vercel Configuration**: Updated vercel.json to handle both frontend and backend
- **Environment Management**: Consistent URL and secret configuration
- **Build Process**: Separate build commands for frontend and backend

### 2. Backend API Deployment

- **Serverless Functions**: Convert NestJS controllers to Vercel serverless functions
- **API Routes**: Expose authentication and user management endpoints
- **Database Connection**: Maintain Supabase connection with proper pooling

### 3. Authentication Integration

- **NextAuth Configuration**: Update to use real backend endpoints
- **Credential Validation**: Replace mock authentication with backend API calls
- **Session Management**: Proper JWT token handling between frontend and backend

### 4. URL Configuration Management

- **Environment Variables**: Centralized URL configuration
- **Dynamic URL Resolution**: Environment-specific URL handling
- **CORS Configuration**: Proper cross-origin setup for API communication

## Data Models

### Authentication Flow

```typescript
interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
    member?: MemberProfile;
  };
  accessToken: string;
}

interface MemberProfile {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
}
```

### Environment Configuration

```typescript
interface DeploymentConfig {
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  BACKEND_API_URL: string;
  DATABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
}
```

## Error Handling

### 1. URL Mismatch Resolution

- Validate environment URLs on application startup
- Provide clear error messages for configuration issues
- Fallback mechanisms for development environments

### 2. Backend Connectivity

- Retry logic for API calls
- Graceful degradation when backend is unavailable
- Health check endpoints for monitoring

### 3. Authentication Errors

- Specific error codes for different failure scenarios
- User-friendly error messages
- Proper error logging for debugging

## Testing Strategy

### 1. Deployment Verification

- Automated checks for URL consistency
- Health check endpoints for both frontend and backend
- Environment variable validation

### 2. Authentication Testing

- Unit tests for authentication logic
- Integration tests for login flow
- End-to-end tests for complete user journey

### 3. Configuration Testing

- Environment-specific configuration validation
- Cross-environment compatibility checks
- Deployment pipeline testing
