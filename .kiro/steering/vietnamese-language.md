---
inclusion: always
---

# Quy tắc Ngôn ngữ Tiếng Việt

## Nguyên tắc chung

- **LUÔN LUÔN** trả lời và viết tài liệu bằng tiếng Việt
- Sử dụng tiếng Việt cho tất cả comments, documentation, commit messages
- Chỉ sử dụng tiếng Anh cho:
  - Tên biến, hàm, class (theo convention lập trình)
  - Technical terms không có từ tiếng Việt tương đương
  - API endpoints và database schema

## Quy tắc cụ thể

### Comments trong code

```typescript
// ✅ ĐÚNG: Comment bằng tiếng Việt
// Kiểm tra xem người dùng có quyền admin không
const isAdmin = user.role === 'admin';

// ❌ SAI: Comment bằng tiếng Anh
// Check if user has admin permission
const isAdmin = user.role === 'admin';
```

### Commit messages

```bash
# ✅ ĐÚNG
git commit -m "feat: thêm tính năng quản lý thành viên"
git commit -m "fix: sửa lỗi đăng nhập không thành công"
git commit -m "docs: cập nhật hướng dẫn sử dụng"

# ❌ SAI
git commit -m "feat: add member management feature"
git commit -m "fix: login error"
```

### Documentation

- Tất cả README, user guides, API docs phải bằng tiếng Việt
- Technical specifications có thể kết hợp tiếng Việt và thuật ngữ kỹ thuật

### Error messages và UI text

```typescript
// ✅ ĐÚNG
throw new Error('Không tìm thấy thành viên với ID này');
const message = 'Đăng nhập thành công';

// ❌ SAI
throw new Error('Member not found with this ID');
const message = 'Login successful';
```

## Ngoại lệ

- Tên API endpoints: `/api/members`, `/api/sessions` (giữ nguyên tiếng Anh)
- Database table/column names: `users`, `sessions`, `created_at` (convention)
- Package names và dependencies
- Environment variables: `DATABASE_URL`, `JWT_SECRET`
