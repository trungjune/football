# Tài liệu Yêu cầu - Refactor Toàn bộ Source Code

## Giới thiệu

Dự án Football Team Management hiện tại có cấu trúc code chưa được tổ chức tốt, với các thành phần như constants, types, interfaces, utils, hooks được trộn lẫn trong các file. Cần refactor toàn bộ source code để tách riêng các thành phần này, tạo ra một cấu trúc code clean, dễ maintain và scale.

## Thuật ngữ

- **Source Code**: Toàn bộ mã nguồn của dự án bao gồm frontend (Next.js) và backend (NestJS)
- **Constants**: Các hằng số được sử dụng trong ứng dụng
- **Types**: Các kiểu dữ liệu TypeScript
- **Interfaces**: Các interface TypeScript định nghĩa cấu trúc dữ liệu
- **Utils**: Các hàm tiện ích được sử dụng chung
- **Hooks**: Các custom React hooks
- **Components**: Các React components
- **Services**: Các service classes xử lý business logic
- **Clean Architecture**: Kiến trúc code có tổ chức tốt, tách biệt concerns

## Yêu cầu

### Yêu cầu 1

**User Story:** Là một developer, tôi muốn có cấu trúc thư mục rõ ràng để dễ dàng tìm kiếm và maintain code.

#### Tiêu chí chấp nhận

1. KHI cần tìm một type hoặc interface, HỆ THỐNG SẼ có thư mục `/types` chứa tất cả định nghĩa types
2. KHI cần sử dụng constants, HỆ THỐNG SẼ có thư mục `/constants` chứa tất cả hằng số
3. KHI cần sử dụng utility functions, HỆ THỐNG SẼ có thư mục `/utils` chứa các hàm tiện ích
4. KHI cần tìm custom hooks, HỆ THỐNG SẼ có thư mục `/hooks` chứa tất cả custom hooks
5. KHI cần tìm shared components, HỆ THỐNG SẼ có cấu trúc components được tổ chức theo chức năng

### Yêu cầu 2

**User Story:** Là một developer, tôi muốn các imports được tổ chức rõ ràng để code dễ đọc và maintain.

#### Tiêu chí chấp nhận

1. KHI import types, HỆ THỐNG SẼ sử dụng path alias `@/types/`
2. KHI import constants, HỆ THỐNG SẼ sử dụng path alias `@/constants/`
3. KHI import utils, HỆ THỐNG SẼ sử dụng path alias `@/utils/`
4. KHI import hooks, HỆ THỐNG SẼ sử dụng path alias `@/hooks/`
5. KHI import components, HỆ THỐNG SẼ sử dụng path alias `@/components/`

### Yêu cầu 3

**User Story:** Là một developer, tôi muốn backend có cấu trúc module rõ ràng để dễ dàng phát triển và test.

#### Tiêu chí chấp nhận

1. KHI phát triển feature mới, HỆ THỐNG SẼ có cấu trúc module tách biệt cho từng domain
2. KHI cần shared utilities, HỆ THỐNG SẼ có thư mục `/common` chứa các utilities chung
3. KHI cần types cho API, HỆ THỐNG SẼ có thư mục `/types` chứa DTOs và interfaces
4. KHI cần constants, HỆ THỐNG SẼ có thư mục `/constants` chứa các hằng số
5. KHI cần decorators hoặc guards, HỆ THỐNG SẼ có thư mục tương ứng trong `/common`

### Yêu cầu 4

**User Story:** Là một developer, tôi muốn có shared types giữa frontend và backend để đảm bảo consistency.

#### Tiêu chí chấp nhận

1. KHI định nghĩa API response types, HỆ THỐNG SẼ sử dụng shared types từ `/shared` package
2. KHI định nghĩa entity types, HỆ THỐNG SẼ có types được share giữa frontend và backend
3. KHI cần validation schemas, HỆ THỐNG SẼ có shared validation logic
4. KHI định nghĩa enums, HỆ THỐNG SẼ có enums được share giữa các modules
5. KHI cần utility types, HỆ THỐNG SẼ có utility types được định nghĩa trong shared package

### Yêu cầu 5

**User Story:** Là một developer, tôi muốn loại bỏ code thừa và gộp các phần trùng lặp để code gọn gàng hơn.

#### Tiêu chí chấp nhận

1. KHI phát hiện unused imports, HỆ THỐNG SẼ loại bỏ tất cả imports không sử dụng
2. KHI phát hiện unused variables/functions, HỆ THỐNG SẼ xóa bỏ các biến và hàm không được sử dụng
3. KHI phát hiện duplicate constants, HỆ THỐNG SẼ gộp thành constants dùng chung trong `/constants`
4. KHI phát hiện duplicate utility functions, HỆ THỐNG SẼ gộp thành shared utils trong `/utils`
5. KHI phát hiện duplicate logic trong components, HỆ THỐNG SẼ tách thành custom hooks trong `/hooks`

### Yêu cầu 6

**User Story:** Là một developer, tôi muốn code tuân thủ các best practices để đảm bảo chất lượng.

#### Tiêu chí chấp nhận

1. KHI refactor, HỆ THỐNG SẼ đảm bảo không có breaking changes với functionality hiện tại
2. KHI tổ chức lại imports, HỆ THỐNG SẼ sử dụng barrel exports để simplify imports
3. KHI tách constants, HỆ THỐNG SẼ sử dụng const assertions và readonly types
4. KHI tách utils, HỆ THỐNG SẼ đảm bảo functions là pure và có proper typing
5. KHI refactor components, HỆ THỐNG SẼ maintain existing props interfaces và behaviors
