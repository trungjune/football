---
inclusion: always
---

# Tiêu chuẩn Chất lượng Code

## Nguyên tắc bắt buộc

**LUÔN LUÔN** phải đảm bảo không còn lỗi lint và types trước khi commit code.

## Quy trình kiểm tra bắt buộc

### 1. Trước khi commit

```bash
# Backend - Kiểm tra lint và types
cd backend
npm run lint
npm run build  # Kiểm tra TypeScript errors

# Frontend - Kiểm tra lint và types
cd frontend
npm run lint
npm run type-check
npm run build  # Kiểm tra build errors
```

### 2. Sửa lỗi lint tự động

```bash
# Backend
cd backend
npm run lint -- --fix

# Frontend
cd frontend
npm run lint -- --fix

# Format toàn bộ project
npm run format
```

### 3. Kiểm tra types nghiêm ngặt

- Không được ignore TypeScript errors bằng `@ts-ignore`
- Phải fix tất cả type errors trước khi commit
- Sử dụng proper typing thay vì `any`

## Cấu hình Lint và Format

### ESLint Rules (Backend)

```javascript
// Tuân thủ cấu hình trong backend/.eslintrc.js
rules: {
  '@typescript-eslint/no-explicit-any': 'error', // Không dùng any
  '@typescript-eslint/no-unused-vars': 'error',  // Không có biến unused
  'prefer-const': 'error',                       // Dùng const thay let khi có thể
}
```

### ESLint Rules (Frontend)

```json
// Tuân thủ cấu hình trong frontend/.eslintrc.json
{
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Configuration

```json
// Tuân thủ .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Code Standards

### TypeScript Best Practices

```typescript
// ✅ ĐÚNG: Proper typing
interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

const getMember = async (id: string): Promise<Member> => {
  // Implementation
};

// ❌ SAI: Using any
const getMember = async (id: any): Promise<any> => {
  // Implementation
};
```

### Error Handling

```typescript
// ✅ ĐÚNG: Proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    throw new Error(`API Error: ${error.message}`);
  }
  throw new Error('Lỗi không xác định');
}

// ❌ SAI: Silent errors
try {
  const result = await apiCall();
  return result;
} catch (error) {
  // Silent fail
}
```

### Import Organization

```typescript
// ✅ ĐÚNG: Organized imports
// External libraries
import React from 'react';
import { NextPage } from 'next';

// Internal modules
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// Types
import type { Member } from '@/types/member';
```

## Pre-commit Checklist

- [ ] `npm run lint` passes without errors
- [ ] `npm run type-check` passes without errors
- [ ] `npm run build` completes successfully
- [ ] All tests pass
- [ ] Code follows Vietnamese comment standards
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
