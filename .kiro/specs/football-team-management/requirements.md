# Tài liệu Yêu cầu - Ứng dụng Quản lý Đội bóng Sân 7

## Giới thiệu

Ứng dụng quản lý đội bóng sân 7 là một hệ thống fullstack giúp người quản lý đội bóng dễ dàng theo dõi thành viên, điểm danh, thu quỹ và chia đội hiệu quả. Hệ thống hỗ trợ cả giao diện web và mobile với khả năng quản lý nhiều đội bóng.

## Thuật ngữ

- **Team_Management_System**: Hệ thống quản lý đội bóng sân 7
- **Admin**: Người quản lý đội bóng có quyền cao nhất
- **Member**: Thành viên đội bóng
- **Training_Session**: Buổi tập luyện
- **Match**: Trận đấu (giao hữu hoặc giải đấu)
- **Attendance**: Điểm danh
- **Fund_Collection**: Thu quỹ
- **Team_Division**: Chia đội
- **Payment_Record**: Bản ghi thanh toán

## Yêu cầu

### Yêu cầu 1

**User Story:** Là một Admin, tôi muốn quản lý thông tin thành viên đội bóng, để có thể theo dõi và tổ chức đội hiệu quả

#### Tiêu chí chấp nhận

1. WHEN Admin thêm thành viên mới, THE Team_Management_System SHALL lưu trữ thông tin cơ bản bao gồm họ tên, biệt danh, số điện thoại, email, ngày sinh và vị trí sở trường
2. WHEN Admin thêm thành viên mới, THE Team_Management_System SHALL cho phép nhập thông tin bổ sung bao gồm ảnh đại diện, chiều cao, cân nặng và chân thuận
3. WHEN Admin phân loại thành viên, THE Team_Management_System SHALL hỗ trợ ba loại: thành viên chính thức, thành viên thử việc và khách mời
4. WHEN Admin tìm kiếm thành viên, THE Team_Management_System SHALL cho phép tìm kiếm theo tên, biệt danh hoặc số điện thoại
5. WHEN Admin cập nhật thông tin thành viên, THE Team_Management_System SHALL lưu trữ các thay đổi và cập nhật trạng thái hoạt động

### Yêu cầu 2

**User Story:** Là một Admin, tôi muốn tạo và quản lý buổi tập/trận đấu, để thành viên có thể đăng ký tham gia

#### Tiêu chí chấp nhận

1. WHEN Admin tạo buổi tập hoặc trận đấu, THE Team_Management_System SHALL lưu trữ thông tin ngày giờ, địa điểm và loại hoạt động
2. WHEN Admin thiết lập buổi hoạt động, THE Team_Management_System SHALL cho phép đặt số lượng người tham gia tối đa và hạn đăng ký
3. WHEN Member đăng ký tham gia, THE Team_Management_System SHALL ghi nhận đăng ký nếu chưa đạt giới hạn và chưa hết hạn
4. WHEN Member hủy đăng ký, THE Team_Management_System SHALL cho phép hủy nếu còn trong thời hạn cho phép
5. WHEN Admin điểm danh, THE Team_Management_System SHALL ghi nhận sự có mặt thực tế và lý do vắng mặt

### Yêu cầu 3

**User Story:** Là một Admin, tôi muốn quản lý thu quỹ và thanh toán, để theo dõi tình hình tài chính của đội

#### Tiêu chí chấp nhận

1. WHEN Admin tạo khoản thu, THE Team_Management_System SHALL hỗ trợ các loại phí: phí thường kỳ, phí theo buổi và phí đặc biệt
2. WHEN Member thanh toán, THE Team_Management_System SHALL ghi nhận thanh toán với phương thức tiền mặt hoặc chuyển khoản
3. WHEN Admin xác nhận thanh toán, THE Team_Management_System SHALL cập nhật trạng thái và gửi thông báo cho Member
4. WHEN có khoản phí chưa thanh toán, THE Team_Management_System SHALL hiển thị danh sách công nợ và gửi thông báo nhắc nhở
5. WHEN Admin tạo báo cáo tài chính, THE Team_Management_System SHALL tổng hợp thu chi theo thời gian và xuất file PDF hoặc Excel

### Yêu cầu 4

**User Story:** Là một Admin, tôi muốn chia đội thi đấu, để tạo ra các trận đấu cân bằng và thú vị

#### Tiêu chí chấp nhận

1. WHEN Admin chia đội thủ công, THE Team_Management_System SHALL cho phép chọn thành viên vào các đội và hiển thị thông tin cân bằng
2. WHEN Admin sử dụng chia đội tự động, THE Team_Management_System SHALL phân chia dựa trên vị trí thi đấu, kỹ năng và thể lực
3. WHEN Admin lưu đội hình, THE Team_Management_System SHALL cho phép tái sử dụng đội hình đã lưu trong các buổi sau
4. WHEN kết thúc trận đấu, THE Team_Management_System SHALL ghi nhận kết quả và thống kê hiệu suất các cách chia đội

### Yêu cầu 5

**User Story:** Là một Member, tôi muốn truy cập thông tin cá nhân và hoạt động của đội, để theo dõi lịch tập và tình hình thanh toán

#### Tiêu chí chấp nhận

1. WHEN Member đăng nhập, THE Team_Management_System SHALL hiển thị thông tin cá nhân và lịch sử tham gia
2. WHEN có buổi tập mới, THE Team_Management_System SHALL gửi thông báo và cho phép Member đăng ký
3. WHEN Member xem tình hình tài chính, THE Team_Management_System SHALL hiển thị các khoản phí đã thanh toán và chưa thanh toán
4. WHEN Member cập nhật thông tin, THE Team_Management_System SHALL cho phép chỉnh sửa thông tin cá nhân cơ bản

### Yêu cầu 6

**User Story:** Là một người dùng, tôi muốn sử dụng ứng dụng trên nhiều thiết bị khác nhau, để có thể truy cập mọi lúc mọi nơi

#### Tiêu chí chấp nhận

1. THE Team_Management_System SHALL hiển thị giao diện responsive trên cả thiết bị di động và máy tính
2. THE Team_Management_System SHALL hỗ trợ chế độ tối và sáng theo lựa chọn người dùng
3. WHEN người dùng đăng nhập, THE Team_Management_System SHALL xác thực bằng số điện thoại hoặc email
4. THE Team_Management_System SHALL phân quyền rõ ràng giữa Admin và Member
5. THE Team_Management_System SHALL bảo vệ thông tin cá nhân của thành viên theo quy định bảo mật