# DEPLOYMENT CHECKLIST - BẮT BUỘC

## ⚠️ QUY TRÌNH BẮT BUỘC TRƯỚC KHI COMMIT

### 1. KIỂM TRA BUILD CẢ BACKEND VÀ FRONTEND

```bash
# Backend
cd backend
npm run lint
npm run build

# Frontend
cd frontend
npm run lint
npm run type-check
npm run build
```

### 2. CHỈ COMMIT KHI TẤT CẢ PASS

- ✅ Backend lint pass
- ✅ Backend type-check pass (trong build)
- ✅ Backend build pass
- ✅ Frontend lint pass
- ✅ Frontend type-check pass
- ✅ Frontend build pass

### 3. DEPLOYMENT PROCESS

```bash
git add .
git commit -m "message"
git push origin main
# VERCEL TỰ ĐỘNG BUILD VÀ DEPLOY - KHÔNG CẦN CHẠY vercel --prod
```

## ❌ NHỮNG GÌ KHÔNG ĐƯỢC LÀM

1. **KHÔNG** commit khi còn lỗi build
2. **KHÔNG** push code lỗi lên repository
3. **KHÔNG** chạy `vercel --prod` sau khi push (Vercel auto-deploy)
4. **KHÔNG** vội vàng bỏ qua bước kiểm tra

## ✅ LUÔN NHỚ

- **Vercel tự động build và deploy** khi có commit mới trên main branch
- **Manual deploy chỉ cần thiết** khi muốn deploy branch khác hoặc test
- **Build local trước** để tránh lỗi trên Vercel
- **Kiểm tra cả lint và types** không chỉ build

---

**GHI NHỚ: LUÔN BUILD LOCAL TRƯỚC KHI COMMIT!**
