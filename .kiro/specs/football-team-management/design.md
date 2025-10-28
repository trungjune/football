# Tài liệu Thiết kế - Ứng dụng Quản lý Đội bóng Sân 7

## Tổng quan

Ứng dụng quản lý đội bóng sân 7 được thiết kế theo kiến trúc fullstack hiện đại với frontend React/Next.js, backend Node.js/Express, và cơ sở dữ liệu PostgreSQL. Hệ thống hỗ trợ real-time notifications và responsive design cho cả web và mobile.

## Kiến trúc Hệ thống

### Tech Stack (2025 Modern & Scalable)
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript 5.6, Tailwind CSS 3.4
- **Backend**: NestJS 10 với Express, TypeScript 5.6
- **Database**: PostgreSQL với Neon (serverless), Upstash Redis
- **ORM**: Prisma (excellent với NestJS)
- **Authentication**: NestJS Passport với JWT + NextAuth.js (frontend)
- **Real-time**: Socket.io với NestJS WebSocket Gateway
- **File Storage**: Cloudinary hoặc Vercel Blob Storage
- **State Management**: Zustand với Immer
- **Forms**: React Hook Form v7 với Zod v3
- **Styling**: Tailwind CSS 3.4 với Shadcn/ui
- **Testing**: Jest (NestJS), Vitest (Frontend), Playwright
- **Deployment**: Vercel Monorepo (Frontend + Backend serverless)
- **Monitoring**: Sentry + Vercel Analytics
- **API Communication**: Axios với TypeScript interfaces

### Kiến trúc Monorepo trên Vercel

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                          │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Next.js 15    │    │   NestJS API    │                │
│  │   (Frontend)    │◄──►│ (Backend Server) │                │
│  │ /frontend/*     │    │ /api/* routes   │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                                   │
                          ┌─────────────────┐
                          │  Neon Postgres  │
                          │  (Serverless)   │
                          └─────────────────┘
                                   │
                          ┌─────────────────┐
                          │ Upstash Redis   │
                          │   (Caching)     │
                          └─────────────────┘
```

## Thành phần và Giao diện

### 1. Frontend Components

#### Layout Components
- **AppLayout**: Layout chính với navigation và sidebar
- **AuthLayout**: Layout cho trang đăng nhập/đăng ký
- **MobileNavigation**: Navigation responsive cho mobile

#### Feature Components
- **MemberManagement**: Quản lý thành viên
  - MemberList: Danh sách thành viên với tìm kiếm/lọc
  - MemberForm: Form thêm/sửa thành viên
  - MemberCard: Card hiển thị thông tin thành viên
- **AttendanceManagement**: Quản lý điểm danh
  - SessionList: Danh sách buổi tập/trận đấu
  - SessionForm: Tạo buổi tập mới
  - AttendanceTracker: Điểm danh thực tế
- **FinanceManagement**: Quản lý tài chính
  - PaymentTracker: Theo dõi thanh toán
  - FeeManagement: Quản lý các khoản phí
  - FinancialReport: Báo cáo tài chính
- **TeamDivision**: Chia đội
  - ManualDivision: Chia đội thủ công với drag & drop
  - AutoDivision: Chia đội tự động
  - SavedFormations: Đội hình đã lưu

### 2. Backend API Structure

#### Authentication Routes
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Thông tin user hiện tại

#### Member Management Routes
- `GET /api/members` - Lấy danh sách thành viên
- `POST /api/members` - Thêm thành viên mới
- `PUT /api/members/:id` - Cập nhật thông tin thành viên
- `DELETE /api/members/:id` - Xóa thành viên
- `GET /api/members/search` - Tìm kiếm thành viên

#### Session Management Routes
- `GET /api/sessions` - Lấy danh sách buổi tập/trận đấu
- `POST /api/sessions` - Tạo buổi tập mới
- `PUT /api/sessions/:id` - Cập nhật buổi tập
- `POST /api/sessions/:id/register` - Đăng ký tham gia
- `DELETE /api/sessions/:id/register` - Hủy đăng ký
- `POST /api/sessions/:id/attendance` - Điểm danh

#### Finance Routes
- `GET /api/finance/fees` - Lấy danh sách phí
- `POST /api/finance/fees` - Tạo khoản phí mới
- `POST /api/finance/payments` - Ghi nhận thanh toán
- `GET /api/finance/reports` - Báo cáo tài chính
- `GET /api/finance/debts` - Danh sách công nợ

#### Team Division Routes
- `POST /api/teams/divide` - Chia đội
- `GET /api/teams/formations` - Lấy đội hình đã lưu
- `POST /api/teams/formations` - Lưu đội hình
- `POST /api/teams/results` - Ghi nhận kết quả trận đấu

## Mô hình Dữ liệu

### Database Schema (Prisma ORM)

```prisma
// Prisma Schema với PostgreSQL 16
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  phone       String?  @unique
  password    String?
  image       String?
  role        Role     @default(MEMBER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  member      Member?
  teams       TeamMember[]
  
  @@map("users")
}

model Member {
  id            String      @id @default(cuid())
  userId        String      @unique
  fullName      String
  nickname      String?
  dateOfBirth   DateTime?
  position      Position
  height        Float?
  weight        Float?
  preferredFoot PreferredFoot?
  avatar        String?
  memberType    MemberType  @default(OFFICIAL)
  status        MemberStatus @default(ACTIVE)
  
  user          User        @relation(fields: [userId], references: [id])
  attendances   Attendance[]
  payments      Payment[]
  teamMembers   TeamMember[]
}

model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  
  members     TeamMember[]
  sessions    Session[]
  fees        Fee[]
}

model Session {
  id          String      @id @default(cuid())
  teamId      String
  title       String
  description String?
  datetime    DateTime
  location    String
  type        SessionType
  maxParticipants Int?
  registrationDeadline DateTime?
  
  team        Team        @relation(fields: [teamId], references: [id])
  attendances Attendance[]
  registrations Registration[]
}

model Attendance {
  id        String   @id @default(cuid())
  sessionId String
  memberId  String
  status    AttendanceStatus
  reason    String?
  
  session   Session  @relation(fields: [sessionId], references: [id])
  member    Member   @relation(fields: [memberId], references: [id])
}

model Fee {
  id          String   @id @default(cuid())
  teamId      String
  title       String
  description String?
  amount      Float
  type        FeeType
  dueDate     DateTime?
  
  team        Team     @relation(fields: [teamId], references: [id])
  payments    Payment[]
}

model Payment {
  id          String        @id @default(cuid())
  feeId       String
  memberId    String
  amount      Float
  method      PaymentMethod
  status      PaymentStatus @default(PENDING)
  paidAt      DateTime?
  
  fee         Fee           @relation(fields: [feeId], references: [id])
  member      Member        @relation(fields: [memberId], references: [id])
}

enum Role {
  ADMIN
  MEMBER
}

enum Position {
  GOALKEEPER
  DEFENDER
  MIDFIELDER
  FORWARD
}

enum MemberType {
  OFFICIAL
  TRIAL
  GUEST
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  LEFT
}

enum SessionType {
  TRAINING
  FRIENDLY_MATCH
  TOURNAMENT
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum FeeType {
  MONTHLY
  PER_SESSION
  SPECIAL
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}
```

## Xử lý Lỗi

### Frontend Error Handling
- **React Error Boundary**: Bắt lỗi component và hiển thị fallback UI
- **API Error Interceptor**: Xử lý lỗi API và hiển thị toast notifications
- **Form Validation**: Sử dụng React Hook Form với Zod schema validation

### Backend Error Handling
- **Global Error Middleware**: Xử lý tất cả lỗi và trả về response nhất quán
- **Custom Error Classes**: BusinessError, ValidationError, AuthenticationError
- **Logging**: Winston logger với different levels (error, warn, info, debug)

```typescript
// Error Response Format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## Chiến lược Testing

### Frontend Testing (Stable & Proven)
- **Unit Tests**: Vitest + React Testing Library (mature ecosystem)
- **Integration Tests**: Testing user flows với MSW 2.0
- **E2E Tests**: Playwright 1.40+ với trace viewer

### Backend Testing (Node.js Stable)
- **Unit Tests**: Vitest cho business logic và utilities
- **Integration Tests**: Supertest với Fastify
- **Database Tests**: Prisma với SQLite in-memory

### Test Coverage Goals
- Unit Tests: >80% coverage
- Integration Tests: All critical API endpoints
- E2E Tests: Main user flows (login, create session, attendance, payment)

## Bảo mật

### Authentication & Authorization (Stable & Secure)
- **NextAuth.js v4**: Proven authentication với multiple providers
- **JWT + Session**: Hybrid approach cho security và performance
- **Role-based Access Control**: Admin vs Member permissions
- **Rate Limiting**: Express rate limit middleware

### Data Protection
- **Input Validation**: Zod schemas cho tất cả inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS Configuration**: Restrict origins in production

### Privacy
- **Data Encryption**: Bcrypt cho passwords, encrypt sensitive data
- **GDPR Compliance**: Data export/delete functionality
- **Audit Logs**: Track sensitive operations

## Performance Optimization

### Frontend (Optimized & Stable)
- **Next.js 14**: Stable App Router với proven performance
- **React 18**: Concurrent features và Server Components
- **Image Optimization**: Next.js Image với Cloudinary CDN
- **State Management**: Zustand với Immer cho immutable updates
- **Caching**: TanStack Query v5 cho API caching

### Backend (Vercel Serverless)
- **Next.js API Routes**: Serverless functions với auto-scaling
- **Database**: Neon PostgreSQL serverless với connection pooling
- **Redis Caching**: Upstash Redis cho session và query caching
- **Edge Functions**: Vercel Edge Runtime cho performance

### Monitoring
- **Performance Metrics**: Web Vitals tracking
- **Error Tracking**: Sentry integration
- **Database Monitoring**: Query performance analysis