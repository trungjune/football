# Thiết kế Refactor Toàn bộ Source Code

## Tổng quan

Refactor toàn bộ source code để tạo ra kiến trúc clean, tách biệt concerns, loại bỏ code trùng lặp và tối đa hóa việc dùng chung giữa backend/frontend cũng như nội bộ từng module.

## Kiến trúc Mới

### 1. Cấu trúc Thư mục Shared (Dùng chung Backend/Frontend)

```
shared/
├── src/
│   ├── types/              # Types chung
│   │   ├── entities/       # Entity types (User, Member, Session...)
│   │   ├── api/           # API request/response types
│   │   ├── common/        # Common utility types
│   │   └── index.ts       # Barrel export
│   ├── constants/         # Constants chung
│   │   ├── api.ts         # API endpoints, status codes
│   │   ├── app.ts         # App-wide constants
│   │   ├── validation.ts  # Validation constants
│   │   └── index.ts       # Barrel export
│   ├── enums/            # Enums chung
│   │   ├── user.ts       # User-related enums
│   │   ├── session.ts    # Session-related enums
│   │   └── index.ts      # Barrel export
│   ├── schemas/          # Validation schemas (Zod)
│   │   ├── user.ts       # User validation schemas
│   │   ├── member.ts     # Member validation schemas
│   │   ├── session.ts    # Session validation schemas
│   │   └── index.ts      # Barrel export
│   ├── utils/            # Utility functions chung
│   │   ├── date.ts       # Date utilities
│   │   ├── format.ts     # Format utilities
│   │   ├── validation.ts # Validation utilities
│   │   ├── string.ts     # String utilities
│   │   └── index.ts      # Barrel export
│   └── index.ts          # Main barrel export
└── package.json
```

### 2. Cấu trúc Frontend Refactored

```
frontend/
├── src/
│   ├── types/            # Frontend-specific types
│   │   ├── components/   # Component prop types
│   │   ├── hooks/        # Hook return types
│   │   ├── pages/        # Page-specific types
│   │   └── index.ts      # Barrel export
│   ├── constants/        # Frontend-specific constants
│   │   ├── routes.ts     # Route constants
│   │   ├── ui.ts         # UI constants (colors, sizes...)
│   │   ├── storage.ts    # LocalStorage keys
│   │   └── index.ts      # Barrel export
│   ├── utils/            # Frontend-specific utilities
│   │   ├── dom.ts        # DOM utilities
│   │   ├── storage.ts    # Storage utilities
│   │   ├── navigation.ts # Navigation utilities
│   │   ├── ui.ts         # UI utilities (cn function...)
│   │   └── index.ts      # Barrel export
│   ├── hooks/            # Custom React hooks
│   │   ├── api/          # API-related hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-members.ts
│   │   │   ├── use-sessions.ts
│   │   │   └── index.ts
│   │   ├── ui/           # UI-related hooks
│   │   │   ├── use-toast.ts
│   │   │   ├── use-modal.ts
│   │   │   └── index.ts
│   │   ├── utils/        # Utility hooks
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── index.ts
│   │   └── index.ts      # Barrel export
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   ├── features/     # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── members/
│   │   │   ├── sessions/
│   │   │   └── finance/
│   │   └── index.ts      # Barrel export
│   ├── services/         # API services
│   │   ├── api/          # API clients
│   │   ├── storage/      # Storage services
│   │   ├── websocket/    # WebSocket services
│   │   └── index.ts      # Barrel export
│   └── lib/              # Third-party integrations
│       ├── react-query.ts
│       ├── axios.ts
│       └── index.ts
```

### 3. Cấu trúc Backend Refactored

```
backend/
├── src/
│   ├── types/            # Backend-specific types
│   │   ├── express/      # Express-related types
│   │   ├── database/     # Database-related types
│   │   └── index.ts      # Barrel export
│   ├── constants/        # Backend-specific constants
│   │   ├── database.ts   # Database constants
│   │   ├── jwt.ts        # JWT constants
│   │   ├── errors.ts     # Error constants
│   │   └── index.ts      # Barrel export
│   ├── utils/            # Backend-specific utilities
│   │   ├── password.ts   # Password utilities
│   │   ├── jwt.ts        # JWT utilities
│   │   ├── database.ts   # Database utilities
│   │   ├── response.ts   # Response utilities
│   │   └── index.ts      # Barrel export
│   ├── common/           # Shared backend utilities
│   │   ├── decorators/   # Custom decorators
│   │   ├── guards/       # Auth guards
│   │   ├── interceptors/ # Response interceptors
│   │   ├── pipes/        # Validation pipes
│   │   ├── filters/      # Exception filters
│   │   └── index.ts      # Barrel export
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── members/
│   │   ├── sessions/
│   │   ├── finance/
│   │   └── health/
│   └── config/           # Configuration
│       ├── database.ts
│       ├── jwt.ts
│       └── index.ts
```

## Chiến lược Loại bỏ Trùng lặp

### 1. Shared Types và Constants

**Hiện tại có trùng lặp:**

- API response types được định nghĩa ở cả frontend và backend
- Constants như status codes, error messages
- Validation logic

**Giải pháp:**

```typescript
// shared/src/types/api/responses.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// shared/src/constants/api.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  MEMBERS: {
    LIST: '/api/members',
    CREATE: '/api/members',
    UPDATE: (id: string) => `/api/members/${id}`,
    DELETE: (id: string) => `/api/members/${id}`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

### 2. Utility Functions Consolidation

**Hiện tại có trùng lặp:**

- Date formatting functions
- Validation functions
- String manipulation

**Giải pháp:**

```typescript
// shared/src/utils/date.ts
export const formatDate = (date: Date | string, locale = 'vi-VN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

// shared/src/utils/validation.ts
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;

export const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);
export const validatePhone = (phone: string): boolean => PHONE_REGEX.test(phone);
```

### 3. Component Logic Extraction

**Hiện tại có trùng lặp:**

- Form validation logic
- API call patterns
- State management patterns

**Giải pháp:**

```typescript
// frontend/src/hooks/api/use-api-mutation.ts
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiError) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: data => {
      options?.onSuccess?.(data);
      // Common success logic
    },
    onError: (error: ApiError) => {
      options?.onError?.(error);
      // Common error handling
    },
  });
}

// frontend/src/hooks/forms/use-form-validation.ts
export function useFormValidation<T>(schema: ZodSchema<T>, initialValues: T) {
  // Common form validation logic
}
```

## Data Models

### 1. Entity Types (Shared)

```typescript
// shared/src/types/entities/user.ts
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// shared/src/types/entities/member.ts
export interface Member {
  id: string;
  userId: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  position?: Position;
  skillLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. API DTOs (Shared)

```typescript
// shared/src/types/api/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// shared/src/types/api/members.ts
export interface CreateMemberRequest {
  fullName: string;
  nickname?: string;
  phone?: string;
  position?: Position;
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {}
```

## Error Handling

### 1. Centralized Error Types

```typescript
// shared/src/types/common/errors.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### 2. Error Handling Utilities

```typescript
// shared/src/utils/errors.ts
export function createApiError(
  code: string,
  message: string,
  statusCode?: number,
  details?: Record<string, any>,
): ApiError {
  return { code, message, statusCode, details };
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'code' in error;
}
```

## Testing Strategy

### 1. Shared Test Utilities

```typescript
// shared/src/test-utils/factories.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  role: UserRole.MEMBER,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// shared/src/test-utils/matchers.ts
export const expectApiResponse = <T>(response: any): ApiResponse<T> => {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  return response;
};
```

### 2. Component Testing Utilities

```typescript
// frontend/src/test-utils/render.tsx
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  // Common test setup with providers
}
```

## Implementation Approach

### Phase 1: Shared Infrastructure

1. Tạo shared package với types, constants, utils
2. Setup barrel exports cho easy imports
3. Configure path aliases

### Phase 2: Backend Refactor

1. Tách constants và utils riêng
2. Implement shared types từ shared package
3. Refactor modules theo clean architecture

### Phase 3: Frontend Refactor

1. Tách components, hooks, utils
2. Implement shared types và constants
3. Consolidate duplicate logic

### Phase 4: Cleanup

1. Remove unused imports và code
2. Optimize bundle size
3. Update documentation

## Phân tích Code Trùng lặp Hiện tại

### 1. Duplicate Constants

**Phát hiện:**

- API endpoints được hardcode ở nhiều nơi
- Error messages trùng lặp
- Validation regex patterns
- UI constants (colors, sizes)

**Ví dụ cụ thể:**

```typescript
// Trùng lặp trong frontend/lib/api-client.ts và backend controllers
const LOGIN_ENDPOINT = '/api/auth/login';

// Trùng lặp validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Xuất hiện ở 3+ files
```

### 2. Duplicate Utility Functions

**Phát hiện:**

- Date formatting functions
- String manipulation utilities
- Validation functions
- Response formatting

**Ví dụ cụ thể:**

```typescript
// shared/src/utils/index.ts đã có formatDate
// Nhưng vẫn có duplicate logic ở frontend/lib/utils.ts và backend/src/utils/
```

### 3. Duplicate Types và Interfaces

**Phát hiện:**

- API request/response types
- Entity interfaces
- Error types
- Component prop types tương tự

### 4. Duplicate Business Logic

**Phát hiện:**

- Authentication logic
- Form validation patterns
- API error handling
- Data transformation logic

## Chiến lược Loại bỏ Trùng lặp Chi tiết

### 1. Constants Consolidation Map

```typescript
// BEFORE: Scattered constants
// frontend/middleware.ts
const publicRoutes = ['/login', '/register'];

// frontend/lib/api-client.ts
const API_BASE = '/api';

// backend/src/auth/auth.controller.ts
const LOGIN_ROUTE = '/auth/login';

// AFTER: Centralized constants
// shared/src/constants/routes.ts
export const ROUTES = {
  PUBLIC: ['/login', '/register', '/'] as const,
  API: {
    BASE: '/api',
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
    },
  },
} as const;
```

### 2. Utils Consolidation Map

```typescript
// BEFORE: Multiple date formatters
// frontend/components/sessions/SessionCard.tsx
const formatDate = (date: Date) => date.toLocaleDateString('vi-VN');

// backend/src/sessions/sessions.service.ts
const formatSessionDate = (date: Date) => new Intl.DateTimeFormat('vi-VN').format(date);

// AFTER: Single shared utility
// shared/src/utils/date.ts
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', options).format(d);
};
```

### 3. Type Consolidation Strategy

```typescript
// BEFORE: Duplicate API types
// frontend/types/api.ts
interface LoginRequest {
  email: string;
  password: string;
}

// backend/src/auth/dto/login.dto.ts
class LoginDto {
  email: string;
  password: string;
}

// AFTER: Shared types
// shared/src/types/api/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

// backend/src/auth/dto/login.dto.ts
import { LoginRequest } from '@shared/types/api/auth';
export class LoginDto implements LoginRequest {
  email: string;
  password: string;
}
```

### 4. Hook Logic Consolidation

```typescript
// BEFORE: Similar API hooks
// frontend/hooks/use-members.ts - có logic tương tự use-sessions.ts

// AFTER: Generic API hook
// frontend/src/hooks/api/use-api-query.ts
export function useApiQuery<TData>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options?: UseQueryOptions<TData>,
) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    ...options,
  });
}

// Usage
export const useMembers = () => useApiQuery(['members'], membersApi.getAll);
export const useSessions = () => useApiQuery(['sessions'], sessionsApi.getAll);
```

## Unused Code Detection Strategy

### 1. Import Analysis

- Scan tất cả imports và detect unused imports
- Remove dead code paths
- Identify orphaned files

### 2. Function Usage Analysis

- Detect unused exported functions
- Remove unused utility functions
- Consolidate similar functions

### 3. Component Analysis

- Find unused components
- Merge similar components
- Extract common component logic

## Barrel Export Strategy

### 1. Shared Package Exports

```typescript
// shared/src/index.ts
export * from './types';
export * from './constants';
export * from './utils';
export * from './schemas';
export * from './enums';
```

### 2. Feature-based Exports

```typescript
// frontend/src/components/index.ts
export * from './ui';
export * from './forms';
export * from './layout';
export * from './features';

// frontend/src/hooks/index.ts
export * from './api';
export * from './ui';
export * from './utils';
```

## Path Alias Configuration

### 1. TypeScript Paths

```json
// tsconfig.json (both frontend & backend)
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/src/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

### 2. Build Tool Configuration

```javascript
// next.config.js
module.exports = {
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared/src'),
    };
    return config;
  },
};
```

## Implementation Approach Chi tiết

### Phase 1: Analysis & Planning

1. **Code Analysis**: Scan toàn bộ codebase để identify duplicates
2. **Dependency Mapping**: Map ra dependencies giữa các modules
3. **Impact Assessment**: Đánh giá impact của việc refactor

### Phase 2: Shared Infrastructure Setup

1. **Shared Package**: Tạo shared package với proper structure
2. **Build Configuration**: Setup build tools và path aliases
3. **Type Definitions**: Move shared types vào shared package

### Phase 3: Constants & Utils Migration

1. **Constants Consolidation**: Move tất cả constants vào shared
2. **Utils Migration**: Consolidate utility functions
3. **Remove Duplicates**: Xóa duplicate constants và utils

### Phase 4: Backend Refactor

1. **Module Restructure**: Tách modules theo clean architecture
2. **Shared Types Integration**: Sử dụng shared types
3. **Utils Refactor**: Tách backend-specific utils

### Phase 5: Frontend Refactor

1. **Component Restructure**: Tách components theo features
2. **Hooks Consolidation**: Merge duplicate hook logic
3. **Service Layer**: Tạo service layer cho API calls

### Phase 6: Cleanup & Optimization

1. **Dead Code Removal**: Remove unused imports và functions
2. **Bundle Analysis**: Optimize bundle size
3. **Performance Testing**: Ensure no performance regression
4. **Documentation Update**: Update all documentation

### Phase 7: Validation

1. **Type Checking**: Ensure no TypeScript errors
2. **Build Testing**: Test builds cho cả frontend và backend
3. **Integration Testing**: Run full test suite
4. **Manual Testing**: Test critical user flows
