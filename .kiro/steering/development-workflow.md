---
inclusion: always
---

# Quy trình Phát triển

## Git Workflow

### Branch Strategy

```bash
main                    # Production branch (auto-deploy)
├── develop            # Development branch
├── feature/ten-tinh-nang    # Feature branches
├── hotfix/sua-loi-gap      # Hotfix branches
└── release/v1.2.0          # Release branches
```

### Commit Message Convention

```bash
# Format: <type>: <description in Vietnamese>
feat: thêm tính năng quản lý thành viên
fix: sửa lỗi đăng nhập không thành công
docs: cập nhật hướng dẫn API
style: format code theo prettier
refactor: tối ưu hóa service member
test: thêm unit test cho auth service
chore: cập nhật dependencies
```

### Pull Request Process

1. Tạo feature branch từ develop
2. Implement feature với proper testing
3. Ensure code quality (lint + type check)
4. Create PR với description bằng tiếng Việt
5. Code review và approval
6. Merge vào develop
7. Deploy to staging for testing
8. Merge develop → main for production

## Development Environment

### Local Setup

```bash
# 1. Clone và install dependencies
git clone <repo-url>
cd football-team-management
npm run install:all

# 2. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Setup database
cd backend
npx prisma migrate dev
npx prisma db seed

# 4. Start development servers
npm run backend:dev    # Port 3001
npm run frontend:dev   # Port 3000
```

### Development Scripts

```bash
# Backend development
cd backend
npm run start:dev      # Start with hot reload
npm run lint          # ESLint check
npm run test          # Run unit tests
npm run test:e2e      # End-to-end tests

# Frontend development
cd frontend
npm run dev           # Start Next.js dev server
npm run lint          # ESLint check
npm run type-check    # TypeScript check
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright E2E tests

# Full project
npm run format        # Format all files
npm run build         # Build both frontend & backend
```

## Code Review Guidelines

### Checklist cho Reviewer

- [ ] Code tuân thủ tiêu chuẩn TypeScript
- [ ] Comments và documentation bằng tiếng Việt
- [ ] Không có lỗi lint hoặc type errors
- [ ] Test coverage đầy đủ cho logic quan trọng
- [ ] Error handling proper
- [ ] Security best practices
- [ ] Performance considerations
- [ ] UI/UX responsive và accessible

### Checklist cho Developer

- [ ] Self-review code trước khi tạo PR
- [ ] Run full test suite locally
- [ ] Update documentation nếu cần
- [ ] Add/update tests cho new features
- [ ] Verify không break existing functionality
- [ ] Check bundle size impact (frontend)
- [ ] Ensure database migrations work properly

## Testing Strategy

### Unit Tests

```typescript
// Backend (Jest)
describe('MemberService', () => {
  it('nên tạo thành viên mới thành công', async () => {
    const memberData = { name: 'Nguyễn Văn A', email: 'a@test.com' };
    const result = await memberService.create(memberData);
    expect(result).toBeDefined();
    expect(result.name).toBe(memberData.name);
  });
});

// Frontend (Vitest + Testing Library)
describe('MemberCard', () => {
  it('nên hiển thị thông tin thành viên', () => {
    const member = { id: '1', name: 'Test User', email: 'test@test.com' };
    render(<MemberCard member={member} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// Playwright
test('quản lý thành viên end-to-end', async ({ page }) => {
  // Đăng nhập
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'admin@football.com');
  await page.fill('[data-testid=password]', 'admin123');
  await page.click('[data-testid=login-button]');

  // Thêm thành viên mới
  await page.goto('/members');
  await page.click('[data-testid=add-member]');
  await page.fill('[data-testid=member-name]', 'Thành viên mới');
  await page.click('[data-testid=save-member]');

  // Verify thành viên được tạo
  await expect(page.locator('text=Thành viên mới')).toBeVisible();
});
```

## Database Management

### Migration Workflow

```bash
# Tạo migration mới
npx prisma migrate dev --name ten-migration

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Seeding Data

```typescript
// prisma/seed.ts
async function main() {
  // Tạo admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@football.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  // Tạo sample members
  const members = await prisma.member.createMany({
    data: [
      { name: 'Nguyễn Văn A', position: 'GOALKEEPER' },
      { name: 'Trần Văn B', position: 'DEFENDER' },
    ],
  });
}
```

## Monitoring và Debugging

### Error Tracking

- **Sentry**: Automatic error reporting
- **Console logs**: Development debugging
- **Vercel logs**: Production debugging

### Performance Monitoring

- **Vercel Analytics**: Page performance
- **React DevTools**: Component performance
- **Prisma logs**: Database query performance

### Health Checks

```typescript
// Backend health endpoint
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: await this.checkDatabase(),
    memory: process.memoryUsage(),
  };
}
```

## Deployment Pipeline

### Staging Environment

- Auto-deploy từ develop branch
- Full testing trước production
- Staging URL: https://staging-football-manager.vercel.app

### Production Deployment

1. Merge develop → main
2. Vercel auto-deploy
3. Run smoke tests
4. Monitor for errors
5. Rollback nếu có issues

### Rollback Strategy

```bash
# Revert commit nếu có lỗi
git revert <commit-hash>
git push origin main

# Hoặc deploy version cũ
vercel --prod --force
```
