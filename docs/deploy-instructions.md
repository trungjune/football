# Hướng dẫn Deploy lên Vercel

## Bước 0: Setup Database (Chỉ chạy 1 lần)

Trước khi deploy, cần setup database với dữ liệu thật:

**Windows:**

```bash
setup-database.bat
```

**Linux/Mac:**

```bash
./setup-database.sh
```

Lệnh này sẽ:

- Cài đặt dependencies cho backend
- Generate Prisma client
- Seed database với dữ liệu thật từ FC Vui Vẻ
- Tạo admin user và member users với password

## Bước 1: Deploy Backend

1. Mở terminal và chuyển đến thư mục backend:

```bash
cd backend
```

2. Deploy backend lên Vercel:

```bash
vercel --prod
```

3. Lưu lại URL của backend (ví dụ: `https://your-backend-domain.vercel.app`)

## Bước 2: Cập nhật Frontend Config

1. Cập nhật `BACKEND_URL` trong `vercel.json` của root project với URL backend vừa deploy:

```json
"BACKEND_URL": "https://your-backend-domain.vercel.app"
```

2. Cập nhật `frontend/pages/api/[...slug].ts` nếu cần thiết

## Bước 3: Deploy Frontend

1. Quay lại thư mục root:

```bash
cd ..
```

2. Deploy frontend:

```bash
vercel --prod
```

## Bước 4: Cập nhật CORS

Sau khi deploy xong, cập nhật `CORS_ORIGIN` trong backend vercel.json với URL frontend thực tế.

## Cấu trúc sau khi deploy:

- **Frontend**: `https://football-team-manager-pi.vercel.app` (Next.js app)
- **Backend**: `https://your-backend-domain.vercel.app` (NestJS API)
- **API Proxy**: Frontend sẽ proxy các request `/api/*` đến backend

## Environment Variables cần thiết:

### Frontend (.env.local):

```
NEXTAUTH_SECRET=ClxHKWChQzAgFLrhCkS8fXmZKfAV7lDsFGiLSGyoI+FbI5mssgKKI7CV6OtD88zArNvVU1Q8QrnltfvJvPGd5w==
NEXTAUTH_URL=https://football-team-manager-pi.vercel.app
BACKEND_URL=https://your-backend-domain.vercel.app
```

### Backend (.env):

```
DATABASE_URL=postgres://postgres.atmpfhxwtfkwygkvduzh:biu74dj2MRtT3t1q@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
JWT_SECRET=ClxHKWChQzAgFLrhCkS8fXmZKfAV7lDsFGiLSGyoI+FbI5mssgKKI7CV6OtD88zArNvVU1Q8QrnltfvJvPGd5w==
FRONTEND_URL=https://football-team-manager-pi.vercel.app
CORS_ORIGIN=https://football-team-manager-pi.vercel.app
```

## Lưu ý:

- Database đã được cấu hình với Supabase
- Không cần data fake nữa, sẽ sử dụng database thật
- Cả frontend và backend sẽ chạy trên cùng domain thông qua API proxy

## Thông tin đăng nhập sau khi deploy:

### Admin Account:

- **Email**: admin@football.com
- **Password**: admin123

### Member Account (ví dụ):

- **Email**: nguyen.huu.phuc.fcvuive@gmail.com (Chủ tịch/Đội trưởng)
- **Email**: vu.minh.hoang.fcvuive@gmail.com (Thu họ)
- **Email**: trinh.hoang.trung.fcvuive@gmail.com (CTO)
- **Password**: password123 (cho tất cả member)

**Lưu ý**: Tất cả 26 thành viên từ FC Vui Vẻ đều có password: `password123`

## Lưu ý quan trọng:

- ✅ Database đã được cấu hình với Supabase
- ✅ Không còn data fake, tất cả dữ liệu thật từ FC Vui Vẻ
- ✅ Authentication thật qua backend API
- ✅ Cả frontend và backend sẽ chạy trên cùng domain thông qua API proxy
- ✅ Dữ liệu bao gồm 26 thành viên thật với lịch sử đóng phí từ CSV
- ⚠️ **Phải chạy setup-database trước khi deploy để tạo dữ liệu trong database**
