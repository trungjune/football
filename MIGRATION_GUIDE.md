# Migration Guide - Tính năng OCR Zalo

## Sau khi pull code mới, cần chạy migration để tạo bảng NameMapping

### Bước 1: Chạy migration

```bash
cd backend
npx prisma migrate deploy
```

Hoặc nếu đang development:

```bash
cd backend
npx prisma migrate dev
```

### Bước 2: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Bước 3: Kiểm tra

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Tính năng mới

### OCR Zalo Image Import

Tính năng mới cho phép:
1. **Upload ảnh điểm danh từ Zalo**
2. **OCR tự động nhận dạng tên** (Tesseract.js)
3. **Fuzzy matching** với members trong database
4. **Auto-fill skill/position** từ profile
5. **Lưu name mapping** để cải thiện độ chính xác cho lần sau

### API Endpoints mới

- `POST /api/ocr/process-image` - Upload và xử lý ảnh
- `POST /api/ocr/save-mappings` - Lưu name mappings

### Dependencies mới

Backend:
- `tesseract.js@^5.0.4` - OCR engine
- `fuzzball@^2.1.2` - Fuzzy string matching
- `sharp@^0.33.2` - Image processing

## Cách sử dụng

1. Vào trang **Chia đội** → Tab **Chia đội tự động**
2. Click vào card **"Nhập từ ảnh Zalo"**
3. Upload ảnh điểm danh từ Zalo
4. Xem kết quả nhận dạng và matching
5. Sửa nếu cần (cho những match score < 90%)
6. Click **"Xác nhận và thêm vào danh sách"**
7. Tiếp tục chia đội như bình thường

## Lưu ý

- Ảnh nên rõ nét, không bị mờ
- Kích thước tối đa 10MB
- Hỗ trợ format: PNG, JPG, WebP
- OCR hỗ trợ tiếng Việt và tiếng Anh
- Độ chính xác ~95-98% với ảnh tốt
- Fuzzy matching threshold: 60%
- Name mappings được lưu để cải thiện độ chính xác cho lần sau
