---
inclusion: always
---

# Quy tắc Tự động Deploy

## Nguyên tắc Deploy

**TỰ ĐỘNG** deploy lên Vercel production sau khi hoàn thành code để áp dụng thay đổi mới nhất.

## Quy trình Deploy Bắt buộc

### 1. Sau khi hoàn thành code

```bash
# Kiểm tra cuối cùng trước deploy
npm run lint
npm run build

# Commit code (sẽ trigger auto-deploy từ Vercel)
git add .
git commit -m "feat: mô tả tính năng bằng tiếng Việt"
git push origin main

# ❌ KHÔNG CẦN chạy vercel --prod sau khi push!
# Vercel sẽ tự động deploy
```

### 2. Vercel Auto-Deploy

- **BẮT BUỘC**: Vercel tự động build và deploy khi có commit mới push lên main branch
- **KHÔNG BAO GIỜ** chạy `vercel --prod` sau khi đã push code
- Chỉ kiểm tra deployment status tại Vercel dashboard
- Auto-deploy đã được setup và hoạt động tự động

### 3. Manual Deploy (CHỈ khi cần thiết đặc biệt)

⚠️ **CHÚ Ý**: Manual deploy chỉ dùng trong trường hợp đặc biệt, KHÔNG phải quy trình thường xuyên

```bash
# CHỈ khi cần deploy branch khác hoặc test
vercel --prod

# KHÔNG bao giờ chạy sau khi đã push lên main
```

## Cấu hình Deploy

### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run install:all && cd backend && npx prisma generate && npm run build",
  "installCommand": "npm ci",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/index.ts?path=$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### Environment Variables

- Tất cả env vars đã được cấu hình trong vercel.json
- Database: Supabase PostgreSQL
- Frontend URL: https://football-team-manager-pi.vercel.app
- Backend API: https://football-team-manager-pi.vercel.app/api

### Build Process

1. Install dependencies: `npm run install:all`
2. Generate Prisma client: `npx prisma generate`
3. Build backend: `npm run build`
4. Build frontend: Next.js build
5. Deploy to Vercel

## Deploy Scripts

### Windows (scripts/deploy.bat)

```batch
@echo off
echo Deploying to production...
call vercel --prod
echo Deploy completed!
```

### Linux/Mac (scripts/deploy.sh)

```bash
#!/bin/bash
echo "Deploying to production..."
vercel --prod
echo "Deploy completed!"
```

## Post-Deploy Checklist

- [ ] Kiểm tra frontend hoạt động: https://football-team-manager-pi.vercel.app
- [ ] Kiểm tra API endpoints: https://football-team-manager-pi.vercel.app/api/health
- [ ] Test login với credentials:
  - Admin: admin@football.com / admin123
  - Member: nguyen.huu.phuc.fcvuive@gmail.com / password123
- [ ] Kiểm tra database connection
- [ ] Verify real-time features (WebSocket)

## Troubleshooting Deploy Issues

### Build Failures

```bash
# Kiểm tra build locally trước
npm run build

# Xem logs chi tiết
vercel logs <deployment-url>
```

### Database Issues

```bash
# Kiểm tra Prisma schema
cd backend
npx prisma validate
npx prisma generate
```

### Environment Variables

- Kiểm tra tất cả env vars trong Vercel dashboard
- Đảm bảo DATABASE_URL đúng format
- Verify JWT_SECRET và các secrets khác

## Monitoring

- Vercel Analytics: Theo dõi performance
- Sentry: Error tracking và monitoring
- Database: Supabase dashboard cho database metrics
