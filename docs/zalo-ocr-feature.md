# Tính năng Nhập từ ảnh Zalo

## Tổng quan

Tính năng này cho phép bạn tự động nhận dạng danh sách thành viên từ ảnh điểm danh Zalo, thay thế quy trình thủ công:
- ❌ **Trước**: Điểm danh Zalo → ChatGPT → Copy/Paste → Xếp rank thủ công → Code cũ
- ✅ **Bây giờ**: Điểm danh Zalo → Chụp ảnh → Upload → Tự động match → Chia đội

## Cách sử dụng

### Bước 1: Chuẩn bị ảnh điểm danh

1. Mở Zalo, vào group bóng đá
2. Tạo poll điểm danh hoặc xem danh sách đã điểm danh
3. Chụp màn hình (hoặc screenshot) danh sách thành viên
4. Đảm bảo ảnh rõ nét, không bị mờ

**Ví dụ ảnh tốt:**
- Tên hiển thị rõ ràng
- Không bị che khuất
- Độ sáng phù hợp
- Không bị nghiêng

### Bước 2: Upload và xử lý

1. Vào trang **Chia đội** trong app
2. Chọn tab **"Chia đội tự động"**
3. Tìm card **"Nhập từ ảnh Zalo"**
4. Click vào khu vực upload hoặc kéo thả ảnh vào
5. Click nút **"Nhận dạng"**

### Bước 3: Xem và xác nhận kết quả

Sau khi xử lý, bạn sẽ thấy:

#### Thành viên đã khớp (màu xanh)
- Hiển thị tên member trong database
- Tên từ OCR
- Độ khớp (Match Score)
- Vị trí và kỹ năng tự động

**Nếu độ khớp < 90%:**
- Sẽ có dropdown để chọn member đúng
- Click vào dropdown và chọn người đúng

#### Tên không khớp (màu đỏ)
- Những tên này không tìm thấy trong database
- Có thể là:
  - Tên viết tắt không đúng
  - Member mới chưa có trong hệ thống
  - OCR đọc sai
- Những tên này sẽ không được thêm vào danh sách

### Bước 4: Xác nhận và chia đội

1. Kiểm tra lại danh sách đã khớp
2. Sửa nếu có sai sót
3. Click **"Xác nhận và thêm vào danh sách"**
4. Thành viên sẽ được thêm vào danh sách chia đội
5. Tiếp tục chọn số đội và chiến lược
6. Click **"Chia đội"**

## Tính năng thông minh

### 1. Fuzzy Matching
- Tự động tìm tên gần giống nhất trong database
- Ví dụ: "Cuong Cop Beo" → "Cường Cọp Béo"
- Threshold: 60% (có thể điều chỉnh)

### 2. Name Mapping Learning
- Lưu lại các mapping đã xác nhận
- Lần sau sẽ chính xác hơn
- Ví dụ: Lần 1 bạn sửa "Cuong" → "Cường", lần sau sẽ tự động đúng

### 3. Auto-fill thông tin
- Skill level tự động từ member type và position
- Position từ profile member
- Không cần nhập thủ công

## Tips để tăng độ chính xác

### Chụp ảnh tốt
- ✅ Ảnh rõ nét, không mờ
- ✅ Độ sáng vừa phải
- ✅ Không bị nghiêng
- ✅ Tên hiển thị đầy đủ

### Quản lý members
- ✅ Cập nhật nickname trong profile
- ✅ Thêm các biến thể tên vào nickname
- ✅ Ví dụ: Nickname = "Cường, Cuong, Cop Beo"

### Sửa lỗi OCR
- Nếu OCR đọc sai, chọn đúng member trong dropdown
- Hệ thống sẽ học và nhớ cho lần sau

## Xử lý lỗi thường gặp

### "Không thể xử lý ảnh"
- Kiểm tra kích thước ảnh (max 10MB)
- Kiểm tra format (PNG, JPG, WebP)
- Thử chụp lại ảnh rõ hơn

### "Không khớp member nào"
- Kiểm tra xem members đã được thêm vào hệ thống chưa
- Kiểm tra status của members (phải ACTIVE)
- Thử cập nhật nickname cho members

### "Độ khớp thấp"
- Sử dụng dropdown để chọn đúng member
- Hệ thống sẽ học và cải thiện cho lần sau

## So sánh với quy trình cũ

| Quy trình cũ | Quy trình mới |
|--------------|---------------|
| 1. Điểm danh Zalo | 1. Điểm danh Zalo |
| 2. Copy text (không được) | 2. Chụp ảnh |
| 3. Dùng ChatGPT convert | 3. Upload ảnh |
| 4. Copy kết quả | 4. Xác nhận |
| 5. Xếp rank thủ công | 5. Tự động match + skill |
| 6. Paste vào code cũ | 6. Chia đội |
| **Thời gian: ~10-15 phút** | **Thời gian: ~2-3 phút** |

## Giới hạn

- Kích thước ảnh tối đa: 10MB
- Format hỗ trợ: PNG, JPG, WebP
- OCR accuracy: ~95-98% với ảnh tốt
- Chỉ match với members ACTIVE
- Cần internet để xử lý OCR

## Câu hỏi thường gặp

**Q: Có thể dùng cho ảnh từ nguồn khác không?**
A: Có, miễn là ảnh có danh sách tên rõ ràng.

**Q: Có thể chỉnh sửa skill sau khi import không?**
A: Có, trong danh sách "Thành viên đã chọn" bạn có thể chỉnh sửa.

**Q: Tại sao một số tên không khớp?**
A: Có thể do OCR đọc sai, hoặc member chưa có trong hệ thống, hoặc tên quá khác biệt.

**Q: Có thể thêm member mới từ ảnh không?**
A: Chưa, bạn cần thêm member vào hệ thống trước.

**Q: Dữ liệu có được lưu lại không?**
A: Name mappings được lưu để cải thiện độ chính xác cho lần sau.
