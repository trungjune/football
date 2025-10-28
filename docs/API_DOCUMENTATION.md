# API Documentation - Football Team Management System

## Overview

This document provides comprehensive documentation for the Football Team Management System API. The API is built with NestJS and follows RESTful principles.

## Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3001/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MEMBER"
  }
}
```

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "MEMBER"
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Member Management

### GET /members

Get list of all members with optional filtering.

**Query Parameters:**

- `search` (string): Search by name or email
- `position` (string): Filter by position
- `skill_level` (number): Filter by skill level
- `page` (number): Page number for pagination
- `limit` (number): Items per page

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "position": "MIDFIELDER",
      "skill_level": 8,
      "avatar_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### POST /members

Create a new member.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "position": "MIDFIELDER",
  "skill_level": 8,
  "date_of_birth": "1990-01-01",
  "address": "123 Main St",
  "notes": "Good player"
}
```

### GET /members/:id

Get member details by ID.

### PUT /members/:id

Update member information.

### DELETE /members/:id

Delete a member.

## Session Management

### GET /sessions

Get list of training sessions and matches.

**Query Parameters:**

- `type` (string): SESSION or MATCH
- `date_from` (string): Start date filter
- `date_to` (string): End date filter
- `status` (string): SCHEDULED, COMPLETED, CANCELLED

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Weekly Training",
      "type": "SESSION",
      "date": "2024-01-15T18:00:00Z",
      "location": "Main Field",
      "max_participants": 20,
      "registered_count": 15,
      "status": "SCHEDULED",
      "created_by": "uuid"
    }
  ]
}
```

### POST /sessions

Create a new training session or match.

**Request Body:**

```json
{
  "title": "Weekly Training",
  "type": "SESSION",
  "date": "2024-01-15T18:00:00Z",
  "location": "Main Field",
  "description": "Regular training session",
  "max_participants": 20,
  "cost_per_person": 50000
}
```

### POST /sessions/:id/register

Register for a session.

### DELETE /sessions/:id/register

Cancel registration for a session.

### POST /sessions/:id/attendance

Mark attendance for a session (Admin only).

**Request Body:**

```json
{
  "attendances": [
    {
      "member_id": "uuid",
      "status": "PRESENT"
    },
    {
      "member_id": "uuid",
      "status": "ABSENT"
    }
  ]
}
```

## Finance Management

### GET /finance/overview

Get financial overview.

**Response:**

```json
{
  "total_income": 5000000,
  "total_expense": 3000000,
  "balance": 2000000,
  "pending_payments": 500000,
  "monthly_stats": [
    {
      "month": "2024-01",
      "income": 1000000,
      "expense": 600000
    }
  ]
}
```

### GET /finance/transactions

Get list of financial transactions.

**Query Parameters:**

- `type` (string): INCOME or EXPENSE
- `category` (string): Transaction category
- `date_from` (string): Start date filter
- `date_to` (string): End date filter

### POST /finance/transactions

Create a new transaction.

**Request Body:**

```json
{
  "type": "EXPENSE",
  "category": "FIELD_RENTAL",
  "amount": 500000,
  "description": "Field rental for training",
  "date": "2024-01-15",
  "receipt_url": "https://..."
}
```

### GET /finance/debts

Get list of member debts.

### POST /finance/payments

Record a payment.

**Request Body:**

```json
{
  "member_id": "uuid",
  "amount": 100000,
  "description": "Monthly fee payment",
  "payment_method": "CASH"
}
```

## Team Division

### POST /team-division/manual

Create manual team division.

**Request Body:**

```json
{
  "name": "Training Match Teams",
  "members": ["uuid1", "uuid2", "uuid3"],
  "teams": [
    {
      "name": "Team A",
      "members": ["uuid1", "uuid2"]
    },
    {
      "name": "Team B",
      "members": ["uuid3"]
    }
  ]
}
```

### POST /team-division/automatic

Create automatic team division.

**Request Body:**

```json
{
  "name": "Auto Division",
  "members": ["uuid1", "uuid2", "uuid3", "uuid4"],
  "criteria": {
    "balance_skill": true,
    "balance_position": true,
    "avoid_pairs": [["uuid1", "uuid2"]]
  },
  "team_count": 2
}
```

### GET /team-division/saved

Get saved team formations.

### GET /team-division/:id

Get specific team division.

## Notifications

### GET /notifications

Get user notifications.

**Query Parameters:**

- `read` (boolean): Filter by read status
- `type` (string): Notification type
- `limit` (number): Items per page

### POST /notifications/:id/read

Mark notification as read.

### POST /notifications/read-all

Mark all notifications as read.

## Security Endpoints

### GET /security/events

Get security events (Admin only).

**Query Parameters:**

- `type` (string): Event type
- `severity` (string): Event severity
- `ip` (string): IP address filter
- `startDate` (string): Start date
- `endDate` (string): End date

### GET /security/blocked-ips

Get list of blocked IP addresses (Admin only).

### POST /security/block-ip/:ip

Block an IP address (Admin only).

### DELETE /security/block-ip/:ip

Unblock an IP address (Admin only).

## Data Protection

### POST /data-protection/gdpr/export/:userId

Export user data for GDPR compliance (Admin only).

### DELETE /data-protection/gdpr/delete/:userId

Delete user data for GDPR compliance (Admin only).

### POST /data-protection/gdpr/anonymize/:userId

Anonymize user data (Admin only).

## Monitoring

### GET /monitoring/health

Get system health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "services": {
    "database": "connected",
    "cache": "connected",
    "security": "active"
  },
  "metrics": {
    "memory": {
      "used": 256,
      "total": 512,
      "percentage": 50
    },
    "uptime": 86400
  }
}
```

### GET /monitoring/metrics

Get system metrics (Admin only).

### GET /monitoring/stats

Get system statistics (Admin only).

## File Upload

### POST /upload/avatar

Upload member avatar.

**Request:** Multipart form data with file field.

**Response:**

```json
{
  "url": "https://cloudinary.com/...",
  "public_id": "avatar_123"
}
```

### POST /upload/receipt

Upload financial receipt.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be a valid email address"]
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

## Webhooks

The system supports webhooks for real-time notifications:

### Webhook Events

- `member.created`: New member added
- `session.created`: New session created
- `session.updated`: Session updated
- `payment.received`: Payment recorded
- `team.divided`: Team division completed

### Webhook Payload

```json
{
  "event": "member.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript

```bash
npm install @football-team/api-client
```

```javascript
import { FootballTeamAPI } from '@football-team/api-client';

const api = new FootballTeamAPI({
  baseURL: 'https://your-app.vercel.app/api',
  token: 'your-jwt-token',
});

const members = await api.members.list();
```

### Python

```bash
pip install football-team-api
```

```python
from football_team_api import FootballTeamAPI

api = FootballTeamAPI(
    base_url='https://your-app.vercel.app/api',
    token='your-jwt-token'
)

members = api.members.list()
```

## Testing

### Postman Collection

Import the Postman collection for easy API testing:
[Download Collection](./postman/football-team-api.json)

### Example Requests

#### Create a Member

```bash
curl -X POST https://your-app.vercel.app/api/members \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "position": "MIDFIELDER",
    "skill_level": 8
  }'
```

#### Get Sessions

```bash
curl -X GET "https://your-app.vercel.app/api/sessions?type=SESSION" \
  -H "Authorization: Bearer your-jwt-token"
```

## Changelog

### v1.0.0 (2024-01-15)

- Initial API release
- Member management endpoints
- Session management endpoints
- Finance management endpoints
- Team division endpoints
- Authentication and security features

---

For more information or support, contact the development team at api-support@footballteam.com
