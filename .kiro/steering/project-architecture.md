---
inclusion: always
---

# Kiến trúc Dự án Football Team Management

## Tổng quan Kiến trúc

### Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: NestJS 10 + TypeScript + Prisma ORM
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (Serverless)
- **Real-time**: Socket.IO
- **Authentication**: JWT + NextAuth.js

### Cấu trúc Thư mục

```
football-team-management/
├── frontend/                 # Next.js App Router
│   ├── app/                 # Pages và layouts
│   ├── components/          # UI components
│   ├── lib/                 # Utilities và configs
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── members/        # Quản lý thành viên
│   │   ├── sessions/       # Quản lý buổi tập/thi đấu
│   │   ├── finance/        # Quản lý tài chính
│   │   ├── team-division/  # Chia đội
│   │   └── common/         # Shared utilities
│   └── prisma/             # Database schema
├── shared/                  # Shared types và utils
└── docs/                   # Documentation
```

## Patterns và Conventions

### Backend (NestJS)

```typescript
// Module structure
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [Controller],
  providers: [Service, Repository],
  exports: [Service],
})
export class FeatureModule {}

// Service pattern
@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Member[]> {
    // Implementation với proper error handling
  }
}

// Controller pattern
@Controller('members')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thành viên' })
  async findAll(): Promise<Member[]> {
    return this.memberService.findAll();
  }
}
```

### Frontend (Next.js)

```typescript
// Page component (App Router)
export default function MembersPage() {
  const { data: members, isLoading } = useMembers();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <MemberList members={members} />
    </div>
  );
}

// Custom hook pattern
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.members.getAll(),
  });
}

// Component pattern
interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  return (
    <Card>
      {/* Component implementation */}
    </Card>
  );
}
```

## Database Schema (Prisma)

### Core Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(MEMBER)
  member    Member?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Member {
  id           String        @id @default(cuid())
  name         String
  phone        String?
  position     Position?
  skillLevel   Int           @default(5)
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id])
  registrations Registration[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Session {
  id            String         @id @default(cuid())
  title         String
  description   String?
  date          DateTime
  location      String
  maxPlayers    Int            @default(14)
  cost          Float          @default(0)
  type          SessionType    @default(TRAINING)
  status        SessionStatus  @default(OPEN)
  registrations Registration[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

## API Design

### RESTful Endpoints

```typescript
// Members API
GET    /api/members           // Lấy danh sách thành viên
POST   /api/members           // Tạo thành viên mới
GET    /api/members/:id       // Lấy thông tin thành viên
PUT    /api/members/:id       // Cập nhật thành viên
DELETE /api/members/:id       // Xóa thành viên

// Sessions API
GET    /api/sessions          // Lấy danh sách buổi tập
POST   /api/sessions          // Tạo buổi tập mới
GET    /api/sessions/:id      // Lấy thông tin buổi tập
PUT    /api/sessions/:id      // Cập nhật buổi tập

// Registration API
POST   /api/sessions/:id/register    // Đăng ký tham gia
DELETE /api/sessions/:id/register    // Hủy đăng ký
```

### Response Format

```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## State Management

### Frontend State (Zustand)

```typescript
interface AppState {
  user: User | null;
  members: Member[];
  sessions: Session[];
  setUser: (user: User | null) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
}

export const useAppStore = create<AppState>(set => ({
  user: null,
  members: [],
  sessions: [],
  setUser: user => set({ user }),
  addMember: member =>
    set(state => ({
      members: [...state.members, member],
    })),
  updateMember: (id, updates) =>
    set(state => ({
      members: state.members.map(m => (m.id === id ? { ...m, ...updates } : m)),
    })),
}));
```

## Security

### Authentication Flow

1. User login → JWT token issued
2. Token stored in httpOnly cookie
3. Protected routes check JWT validity
4. Role-based access control (RBAC)

### Authorization Guards

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete('members/:id')
async deleteMember(@Param('id') id: string) {
  // Chỉ admin mới có thể xóa thành viên
}
```

## Real-time Features

### WebSocket Events

```typescript
// Client side
socket.on('session:updated', (session: Session) => {
  // Cập nhật UI real-time
});

socket.on('member:registered', (data: { sessionId: string; member: Member }) => {
  // Hiển thị thông báo đăng ký mới
});

// Server side
@WebSocketGateway()
export class SessionGateway {
  @SubscribeMessage('join:session')
  handleJoinSession(client: Socket, sessionId: string) {
    client.join(`session:${sessionId}`);
  }
}
```

## Performance Optimization

### Frontend

- Next.js App Router với Server Components
- React Query cho data caching
- Image optimization với next/image
- Code splitting tự động

### Backend

- Database connection pooling
- Query optimization với Prisma
- Response caching với Redis (Upstash)
- Compression middleware

### Database

- Proper indexing trên các trường thường query
- Pagination cho large datasets
- Soft delete thay vì hard delete
