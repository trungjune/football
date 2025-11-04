# DEPLOYMENT CHECKLIST - BẮT BUỘC

## ⚠️ QUY TRÌNH BẮT BUỘC TRƯỚC KHI COMMIT

### 1. KIỂM TRA VÀ SỬA TẤT CẢ LỖI TRƯỚC

```bash
# Backend - KIỂM TRA KỸ LƯỠNG
cd backend
npm run lint
npm run build
# Nếu có lỗi database/seed, kiểm tra và sửa trước khi commit

# Frontend - KIỂM TRA KỸ LƯỠNG
cd frontend
npm run lint
npm run type-check
npm run build
```

### 2. CHỈ COMMIT KHI TẤT CẢ PASS VÀ KHÔNG CÒN LỖI

- ✅ Backend lint pass
- ✅ Backend type-check pass (trong build)
- ✅ Backend build pass
- ✅ Database/Prisma không có lỗi
- ✅ Seed scripts chạy thành công (nếu có)
- ✅ Frontend lint pass
- ✅ Frontend type-check pass
- ✅ Frontend build pass
- ✅ Tất cả dependencies được cài đặt đúng

### 3. DEPLOYMENT PROCESS

```bash
git add .
git commit -m "message"
git push origin main
# ✅ VERCEL TỰ ĐỘNG BUILD VÀ DEPLOY
# ❌ KHÔNG BAO GIỜ CHẠY vercel --prod SAU KHI PUSH!
```

## ❌ NHỮNG GÌ KHÔNG ĐƯỢC LÀM

1. **KHÔNG** commit khi còn lỗi build
2. **KHÔNG** push code lỗi lên repository
3. **KHÔNG BAO GIỜ** chạy `vercel --prod` sau khi push (Vercel auto-deploy)
4. **KHÔNG** vội vàng bỏ qua bước kiểm tra
5. **KHÔNG** quên rằng Vercel tự động deploy sau mỗi push
6. **KHÔNG** commit khi còn lỗi database/Prisma
7. **KHÔNG** vội vàng - LUÔN KIỂM TRA KỸ TRƯỚC KHI COMMIT

## ✅ LUÔN NHỚ

- **Vercel tự động build và deploy** khi có commit mới trên main branch
- **Manual deploy chỉ cần thiết** khi muốn deploy branch khác hoặc test
- **Build local trước** để tránh lỗi trên Vercel
- **Kiểm tra cả lint và types** không chỉ build

---

**GHI NHỚ: LUÔN BUILD LOCAL TRƯỚC KHI COMMIT!**
