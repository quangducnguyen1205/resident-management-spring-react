# Hướng dẫn sử dụng Module Thu Phí và Đóng Góp

## 📌 Tổng quan

Module mới bao gồm:
- **Đợt Thu Phí** (`dot_thu_phi`): Quản lý các đợt thu phí (quản lý, vệ sinh, bảo vệ, ...)
- **Thu Phí Hộ Khẩu** (`thu_phi_ho_khau`): Ghi nhận việc thu phí từng hộ khẩu

## 🚀 Khởi động nhanh

### 1. Khởi động Database với Docker

```bash
docker-compose -f docker-compose.backend.yml up postgres -d
```

### 2. Chạy Backend từ IntelliJ IDEA

1. Mở project trong IntelliJ
2. Chờ Maven download dependencies (bao gồm springdoc-openapi)
3. Run `QuanLyDanCuApplication.java`

### 3. Truy cập Swagger UI

Mở trình duyệt và truy cập:
```
http://localhost:8080/swagger-ui.html
```

## 🔐 Xác thực

### Bước 1: Đăng nhập để lấy JWT Token

Trong Swagger UI:
1. Tìm endpoint `POST /api/auth/login`
2. Click "Try it out"
3. Nhập credentials:
```json
{
  "tenDangNhap": "admin",
  "matKhau": "password"
}
```
4. Click "Execute"
5. Copy `token` từ response

### Bước 2: Authorize trong Swagger

1. Click nút **"Authorize"** ở góc trên bên phải
2. Paste token vào ô "Value"
3. Click "Authorize" rồi "Close"

✅ Giờ bạn có thể gọi các API yêu cầu authentication!

## 📋 Use Cases thực tế

### Case 1: Tạo đợt thu phí mới

**Scenario**: Ban quản lý muốn tạo đợt thu phí quản lý cho tháng 1/2025

1. Endpoint: `POST /api/dot-thu-phi`
2. Request body:
```json
{
  "tenDot": "Thu phí quản lý tháng 1/2025",
  "loai": "QUAN_LY",
  "ngayBatDau": "2025-01-01",
  "ngayKetThuc": "2025-01-31",
  "dinhMuc": 50000
}
```
3. Response (HTTP 201):
```json
{
  "id": 1,
  "tenDot": "Thu phí quản lý tháng 1/2025",
  "loai": "QUAN_LY",
  "ngayBatDau": "2025-01-01",
  "ngayKetThuc": "2025-01-31",
  "dinhMuc": 50000,
  "createdBy": 1,
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": null
}
```

### Case 2: Ghi nhận thu phí từ hộ khẩu

**Scenario**: Hộ khẩu HK001 đã đóng phí quản lý tháng 1

1. Endpoint: `POST /api/thu-phi-ho-khau`
2. Request body:
```json
{
  "hoKhauId": 1,
  "dotThuPhiId": 1,
  "soTienDaThu": 50000,
  "ngayThu": "2025-01-15",
  "months": "1",
  "ghiChu": "Đã thanh toán đủ"
}
```
3. Response (HTTP 201):
```json
{
  "id": 1,
  "hoKhauId": 1,
  "soHoKhau": "HK001",
  "tenChuHo": "Nguyễn Văn A",
  "dotThuPhiId": 1,
  "tenDot": "Thu phí quản lý tháng 1/2025",
  "soTienDaThu": 50000,
  "ngayThu": "2025-01-15",
  "months": "1",
  "ghiChu": "Đã thanh toán đủ",
  "collectedBy": 1,
  "createdAt": "2025-01-15T14:20:00"
}
```

### Case 3: Xem lịch sử thu phí của một hộ khẩu

**Scenario**: Kiểm tra tất cả các lần đóng phí của hộ khẩu ID=1

1. Endpoint: `GET /api/thu-phi-ho-khau/ho-khau/1`
2. Response: Danh sách tất cả bản ghi thu phí của hộ đó

### Case 4: Xem báo cáo thu phí của một đợt

**Scenario**: Xem có bao nhiêu hộ đã đóng phí cho đợt ID=1

1. Endpoint: `GET /api/thu-phi-ho-khau/dot-thu-phi/1`
2. Response: Danh sách tất cả hộ đã đóng phí trong đợt này

### Case 5: Cập nhật thông tin thu phí

**Scenario**: Sửa lại số tiền hoặc ghi chú

1. Endpoint: `PUT /api/thu-phi-ho-khau/{id}`
2. Request body: Các trường cần cập nhật
3. Response: Thông tin đã được cập nhật

## ⚠️ Validation Errors

### Lỗi: "Tên đợt không được để trống"
```json
{
  "tenDot": ""  // ❌ Sai
}
```
✅ **Fix**: Nhập tên đợt hợp lệ

### Lỗi: "Định mức phải là số dương"
```json
{
  "dinhMuc": -1000  // ❌ Sai
}
```
✅ **Fix**: Nhập số dương > 0

### Lỗi: "Không tìm thấy hộ khẩu id = X"
```json
{
  "hoKhauId": 999  // ❌ ID không tồn tại
}
```
✅ **Fix**: Kiểm tra ID hộ khẩu tồn tại bằng `GET /api/hokhau`

## 🔑 Phân quyền

| Vai trò | Xem | Tạo | Sửa | Xóa |
|---------|-----|-----|-----|-----|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| TOTRUONG | ✅ | ✅ | ✅ | ✅ |
| KETOAN | ✅ | ❌ | ❌ | ❌ |
| USER | ❌ | ❌ | ❌ | ❌ |

## 📊 Mẫu dữ liệu

### Các loại phí phổ biến
- `QUAN_LY` - Phí quản lý
- `VE_SINH` - Phí vệ sinh
- `BAO_VE` - Phí bảo vệ
- `NUOC` - Tiền nước
- `DIEN` - Tiền điện
- `INTERNET` - Phí Internet
- `XE` - Phí gửi xe

### Ví dụ về trường `months`
```json
"months": "1"        // Thu phí tháng 1
"months": "1,2,3"    // Thu phí 3 tháng 1-3
"months": "Q1"       // Thu phí quý 1
"months": "2025"     // Thu phí cả năm
```

## 🧪 Testing với Postman

Nếu muốn test bằng Postman:

1. Import OpenAPI schema từ:
   ```
   http://localhost:8080/v3/api-docs
   ```
2. Hoặc tạo collection thủ công theo các endpoint trong Swagger

## 📈 Best Practices

### 1. Tạo đợt thu trước khi ghi nhận
Luôn tạo `DotThuPhi` trước, sau đó mới tạo `ThuPhiHoKhau`

### 2. Kiểm tra dữ liệu trước khi submit
Sử dụng các endpoint GET để kiểm tra ID hợp lệ

### 3. Xử lý lỗi
Luôn kiểm tra response code:
- `200/201` - Thành công
- `400` - Validation error
- `403` - Không có quyền
- `404` - Không tìm thấy

### 4. Sử dụng BigDecimal cho tiền
Không sử dụng float/double cho số tiền, luôn dùng `BigDecimal`

## 🔄 Workflow đầy đủ

```
1. Đăng nhập (POST /api/auth/login)
   ↓
2. Lấy JWT token
   ↓
3. Authorize trong Swagger
   ↓
4. Tạo đợt thu phí (POST /api/dot-thu-phi)
   ↓
5. Lấy danh sách hộ khẩu (GET /api/hokhau)
   ↓
6. Ghi nhận thu phí cho từng hộ (POST /api/thu-phi-ho-khau)
   ↓
7. Xem báo cáo (GET /api/thu-phi-ho-khau/dot-thu-phi/{id})
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Kiểm tra database connection
3. Verify JWT token chưa hết hạn
4. Đọc error message trong response body

---
