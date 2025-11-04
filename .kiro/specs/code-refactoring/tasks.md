# Implementation Plan - Refactor Toàn bộ Source Code

- [x] 1. Phân tích và chuẩn bị refactor
  - Scan toàn bộ codebase để identify duplicate code, unused imports và orphaned files
  - Tạo mapping dependencies giữa các modules để đánh giá impact
  - Backup current codebase và setup branch cho refactor
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Setup shared infrastructure
- [x] 2.1 Tạo shared package structure
  - Tạo thư mục `/shared/src` với cấu trúc types, constants, enums, schemas, utils
  - Setup package.json cho shared package với proper dependencies
  - Configure TypeScript cho shared package
  - _Requirements: 1.1, 1.2, 4.1_

- [x] 2.2 Configure build tools và path aliases
  - Update tsconfig.json cho cả frontend và backend để support shared package
  - Configure Next.js webpack để resolve @shared alias
  - Configure NestJS để support shared imports
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.3 Setup barrel exports cho shared package
  - Tạo index.ts files cho từng module trong shared
  - Setup main barrel export cho toàn bộ shared package
  - Test import paths từ frontend và backend
  - _Requirements: 6.2_

- [ ] 3. Migrate shared types và constants
- [x] 3.1 Move entity types vào shared package
  - Migrate User, Member, Session, Fee entity types từ backend/frontend vào shared/src/types/entities
  - Update imports trong cả frontend và backend để sử dụng shared types
  - Ensure type consistency giữa Prisma models và shared types
  - _Requirements: 4.1, 4.2_

- [x] 3.2 Consolidate API types vào shared
  - Move tất cả API request/response types vào shared/src/types/api
  - Remove duplicate API types từ frontend và backend
  - Update tất cả API calls để sử dụng shared types
  - _Requirements: 4.1, 4.2, 5.4_

- [x] 3.3 Migrate constants vào shared package
  - Move API endpoints, HTTP status codes, error codes vào shared/src/constants
  - Remove duplicate constants từ frontend middleware, api-client và backend controllers
  - Update tất cả references để sử dụng shared constants
  - _Requirements: 5.3, 5.4_

- [x] 3.4 Consolidate enums và validation schemas
  - Move UserRole, Position, SessionType enums vào shared/src/enums
  - Migrate Zod schemas vào shared/src/schemas
  - Remove duplicate enums và schemas từ frontend/backend
  - _Requirements: 4.4, 4.5_

- [ ] 4. Consolidate utility functions
- [x] 4.1 Migrate shared utilities
  - Move formatDate, formatCurrency, validateEmail, validatePhone từ shared/src/utils/index.ts
  - Remove duplicate utility functions từ frontend/lib/utils.ts
  - Ensure utilities work properly trong cả browser và Node.js environments
  - _Requirements: 5.4, 6.4_

- [x] 4.2 Create specialized utility modules
  - Tách date utilities vào shared/src/utils/date.ts
  - Tách validation utilities vào shared/src/utils/validation.ts
  - Tách string utilities vào shared/src/utils/string.ts
  - Setup barrel exports cho utils modules
  - _Requirements: 1.3, 5.4_

- [x] 4.3 Remove duplicate utility logic
  - Identify và remove duplicate date formatting functions từ components
  - Consolidate validation regex patterns
  - Remove unused utility functions
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 5. Refactor frontend structure
- [x] 5.1 Restructure frontend types
  - Tạo frontend/src/types với component, hook, page-specific types
  - Move component prop types từ component files vào dedicated type files
  - Setup barrel exports cho frontend types
  - _Requirements: 1.1, 2.1_

- [x] 5.2 Consolidate frontend constants
  - Tạo frontend/src/constants với routes, UI, storage constants
  - Move route constants từ middleware và components
  - Move localStorage keys và UI constants vào dedicated files
  - _Requirements: 1.2, 2.2_

- [x] 5.3 Restructure hooks theo categories
  - Tạo frontend/src/hooks/api cho API-related hooks
  - Tạo frontend/src/hooks/ui cho UI-related hooks
  - Tạo frontend/src/hooks/utils cho utility hooks
  - Move existing hooks vào appropriate categories
  - _Requirements: 1.4, 2.4_

- [ ] 5.4 Create generic API hooks
  - Implement useApiQuery generic hook để replace duplicate query logic
  - Implement useApiMutation generic hook với common error handling
  - Refactor use-auth, use-members, use-sessions để sử dụng generic hooks
  - _Requirements: 5.5, 6.4_

- [ ] 5.5 Restructure components theo features
  - Tạo frontend/src/components/features với auth, members, sessions, finance modules
  - Move feature-specific components từ current locations
  - Ensure UI components remain trong components/ui
  - Setup barrel exports cho component modules
  - _Requirements: 1.5, 2.5_

- [ ] 6. Refactor backend structure
- [ ] 6.1 Restructure backend types và constants
  - Tạo backend/src/types cho backend-specific types
  - Tạo backend/src/constants cho database, JWT, error constants
  - Move backend-specific logic từ shared locations
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 6.2 Consolidate backend utilities
  - Tạo backend/src/utils với password, JWT, database, response utilities
  - Remove duplicate utility logic từ various backend modules
  - Ensure utilities follow NestJS patterns
  - _Requirements: 3.5, 6.4_

- [ ] 6.3 Refactor common backend modules
  - Organize decorators, guards, interceptors, pipes, filters trong src/common
  - Remove duplicate authentication và validation logic
  - Setup barrel exports cho common modules
  - _Requirements: 3.3, 3.5_

- [ ] 6.4 Update backend modules để sử dụng shared types
  - Update auth module để sử dụng shared LoginRequest, User types
  - Update members module để sử dụng shared Member, CreateMemberRequest types
  - Update sessions module để sử dụng shared Session types
  - Ensure DTOs implement shared interfaces
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Clean up unused code
- [x] 7.1 Remove unused imports
  - Scan tất cả TypeScript files để detect unused imports
  - Remove unused imports từ cả frontend và backend
  - Update import statements để sử dụng new barrel exports
  - _Requirements: 5.1, 6.1_

- [ ] 7.2 Remove unused functions và variables
  - Identify unused exported functions trong utils modules
  - Remove unused component props và state variables
  - Remove orphaned files không được reference
  - _Requirements: 5.2, 6.2_

- [ ] 7.3 Consolidate duplicate component logic
  - Extract common form validation logic vào custom hooks
  - Merge similar components với overlapping functionality
  - Remove duplicate API error handling patterns
  - _Requirements: 5.5, 6.4_

- [ ] 8. Update imports và references
- [ ] 8.1 Update frontend imports
  - Replace old import paths với new barrel exports
  - Update component imports để sử dụng @/components paths
  - Update hook imports để sử dụng @/hooks paths
  - Ensure @shared imports work properly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8.2 Update backend imports
  - Replace old import paths với new barrel exports
  - Update module imports để sử dụng proper paths
  - Ensure @shared imports work trong NestJS context
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.3 Fix broken references
  - Resolve any broken imports sau khi restructure
  - Update test files để sử dụng new import paths
  - Fix any circular dependency issues
  - _Requirements: 6.1, 6.2_

- [ ] 9. Testing và validation
- [x] 9.1 Run type checking
  - Run TypeScript compiler cho cả frontend và backend
  - Fix any type errors introduced during refactor
  - Ensure shared types work properly trong cả environments
  - _Requirements: 6.1, 6.5_

- [x] 9.2 Run build tests
  - Test frontend build với Next.js
  - Test backend build với NestJS
  - Ensure no build errors sau refactor
  - _Requirements: 6.1, 6.5_

- [x] 9.3 Run existing test suites
  - Run frontend tests với Vitest
  - Run backend tests với Jest
  - Fix any test failures caused by import changes
  - _Requirements: 6.5_

- [x] 9.4 Manual testing critical flows
  - Test authentication flow end-to-end
  - Test member management functionality
  - Test session management functionality
  - Verify no functionality regression
  - _Requirements: 6.1_

- [ ] 10. Documentation và cleanup
- [x] 10.1 Update import documentation
  - Document new import patterns trong README
  - Update development guidelines với new structure
  - Create migration guide cho developers
  - _Requirements: 6.3_

- [x] 10.2 Bundle size analysis
  - Analyze frontend bundle size sau refactor
  - Ensure no significant bundle size increase
  - Optimize imports nếu cần thiết
  - _Requirements: 6.2_

- [x] 10.3 Performance validation
  - Run performance tests để ensure no regression
  - Monitor build times cho cả frontend và backend
  - Validate startup times không bị impact
  - _Requirements: 6.2_
