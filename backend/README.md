# Quản Lý Dân Cư - Backend API

REST API cho hệ thống quản lý dân cư với Spring Boot.

## 🚀 Tính năng

- ✅ Quản lý Hộ khẩu
- ✅ Quản lý Tài khoản
- ✅ **Thu phí và đóng góp** (Mới)
  - Quản lý đợt thu phí
  - Ghi nhận thu phí từng hộ khẩu
- ✅ Xác thực JWT
- ✅ Validation requests với Jakarta Validation
- ✅ API Documentation với Swagger UI

## 📋 Yêu cầu

- Java 17+
- Maven 3.6+
- PostgreSQL 15
- Docker & Docker Compose (optional)

## 🛠️ Cài đặt

### Cách 1: Chạy với Docker Compose (Chỉ Database)

```bash
# Khởi động PostgreSQL
docker-compose up db -d

# Chạy backend từ IntelliJ IDEA hoặc terminal
./mvnw spring-boot:run
```

### Cách 2: Chạy toàn bộ với Docker Compose

```bash
# Khởi động cả backend và database
docker-compose up -d
```

### Cách 3: Cài đặt thủ công

1. Cài đặt PostgreSQL và tạo database:
```sql
CREATE DATABASE QuanLyDanCu;
```

2. Chạy script SQL:
```bash
psql -U postgres -d QuanLyDanCu -f quanlydancu.sql
```

3. Cấu hình `application.properties` nếu cần

4. Chạy ứng dụng:
```bash
./mvnw spring-boot:run
```

## 📚 API Documentation

Sau khi khởi động ứng dụng, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON schema:
```
http://localhost:8080/v3/api-docs
```

## 🔐 Authentication

Hầu hết các endpoints yêu cầu JWT token. 

1. **Đăng nhập** để lấy token:
```bash
POST /api/auth/login
{
  "tenDangNhap": "admin",
  "matKhau": "password"
}
```

2. **Sử dụng token** trong header:
```
Authorization: Bearer <your-jwt-token>
```

3. **Trong Swagger UI**: Click nút "Authorize" và nhập token (không cần "Bearer" prefix)

## 📦 API Endpoints

### Thu Phí Module

#### Đợt Thu Phí
- `GET /api/dot-thu-phi` - Lấy danh sách tất cả đợt thu phí
- `GET /api/dot-thu-phi/{id}` - Lấy chi tiết đợt thu phí
- `POST /api/dot-thu-phi` - Tạo đợt thu phí mới (ADMIN/TOTRUONG)
- `PUT /api/dot-thu-phi/{id}` - Cập nhật đợt thu phí (ADMIN/TOTRUONG)
- `DELETE /api/dot-thu-phi/{id}` - Xóa đợt thu phí (ADMIN/TOTRUONG)

#### Thu Phí Hộ Khẩu
- `GET /api/thu-phi-ho-khau` - Lấy danh sách tất cả thu phí
- `GET /api/thu-phi-ho-khau/{id}` - Lấy chi tiết thu phí
- `GET /api/thu-phi-ho-khau/ho-khau/{hoKhauId}` - Lấy thu phí theo hộ khẩu
- `GET /api/thu-phi-ho-khau/dot-thu-phi/{dotThuPhiId}` - Lấy thu phí theo đợt
- `POST /api/thu-phi-ho-khau` - Tạo bản ghi thu phí mới (ADMIN/TOTRUONG)
- `PUT /api/thu-phi-ho-khau/{id}` - Cập nhật thu phí (ADMIN/TOTRUONG)
- `DELETE /api/thu-phi-ho-khau/{id}` - Xóa thu phí (ADMIN/TOTRUONG)

### Hộ Khẩu
- `GET /api/hokhau` - Lấy danh sách hộ khẩu
- `GET /api/hokhau/{id}` - Lấy chi tiết hộ khẩu
- `POST /api/hokhau` - Tạo hộ khẩu mới (ADMIN/TOTRUONG)
- `PUT /api/hokhau/{id}` - Cập nhật hộ khẩu (ADMIN/TOTRUONG)
- `DELETE /api/hokhau/{id}` - Xóa hộ khẩu (ADMIN/TOTRUONG)

## 🧪 Testing

### Swagger UI
Sử dụng Swagger UI để test API trực tiếp trong trình duyệt.

### cURL Examples

```bash
# Đăng nhập
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"password"}'

# Tạo đợt thu phí
curl -X POST http://localhost:8080/api/dot-thu-phi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tenDot": "Thu phí quản lý tháng 1/2025",
    "loai": "QUAN_LY",
    "ngayBatDau": "2025-01-01",
    "ngayKetThuc": "2025-01-31",
    "dinhMuc": 50000
  }'

# Ghi nhận thu phí
curl -X POST http://localhost:8080/api/thu-phi-ho-khau \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "hoKhauId": 1,
    "dotThuPhiId": 1,
    "soTienDaThu": 50000,
    "ngayThu": "2025-01-15",
    "months": "1",
    "ghiChu": "Đã thanh toán đủ"
  }'
```

## 🏗️ Cấu trúc dự án

```
src/main/java/com/example/QuanLyDanCu/
├── config/
│   ├── OpenApiConfig.java          # Cấu hình Swagger
│   └── SecurityConfig.java         # Cấu hình bảo mật
├── controller/
│   ├── AuthController.java
│   ├── HoKhauController.java
│   ├── DotThuPhiController.java    # Mới
│   └── ThuPhiHoKhauController.java # Mới
├── dto/
│   ├── request/                    # Mới
│   │   ├── DotThuPhiRequestDto.java
│   │   ├── ThuPhiHoKhauRequestDto.java
│   │   ├── HoKhauRequestDto.java
│   │   └── TaiKhoanRequestDto.java
│   └── response/                   # Mới
│       ├── DotThuPhiResponseDto.java
│       ├── ThuPhiHoKhauResponseDto.java
│       └── HoKhauResponseDto.java
├── entity/
│   ├── HoKhau.java
│   ├── TaiKhoan.java
│   ├── DotThuPhi.java              # Mới
│   └── ThuPhiHoKhau.java           # Mới
├── repository/
│   ├── HoKhauRepository.java
│   ├── TaiKhoanRepository.java
│   ├── DotThuPhiRepository.java    # Mới
│   └── ThuPhiHoKhauRepository.java # Mới
├── service/
│   ├── AuthService.java
│   ├── HoKhauService.java
│   ├── DotThuPhiService.java       # Mới
│   └── ThuPhiHoKhauService.java    # Mới
├── security/
│   ├── JwtFilter.java
│   └── JwtUtil.java
└── exception/
    └── GlobalExceptionHandler.java
```

## 📝 Validation Rules

### DotThuPhiRequestDto
- `tenDot`: Bắt buộc, không được để trống
- `loai`: Bắt buộc, không được để trống
- `ngayBatDau`: Bắt buộc
- `ngayKetThuc`: Bắt buộc
- `dinhMuc`: Bắt buộc, phải là số dương

### ThuPhiHoKhauRequestDto
- `hoKhauId`: Bắt buộc, phải là số dương
- `dotThuPhiId`: Bắt buộc, phải là số dương
- `soTienDaThu`: Bắt buộc, phải >= 0
- `ngayThu`: Bắt buộc
- `months`: Tùy chọn
- `ghiChu`: Tùy chọn

## 🔒 Phân quyền

- **ADMIN**: Toàn quyền truy cập
- **TOTRUONG**: Quản lý hộ khẩu và thu phí
- **KETOAN**: Xem dữ liệu
- **USER**: Quyền giới hạn

## 🐛 Troubleshooting

### Lỗi kết nối database
```
Error: Connection refused
```
**Giải pháp**: Kiểm tra PostgreSQL đang chạy và cấu hình trong `application.properties`

### Swagger UI không hiển thị
```
Whitelabel Error Page
```
**Giải pháp**: Kiểm tra SecurityConfig đã permit `/swagger-ui/**` và `/v3/api-docs/**`

### JWT Token hết hạn
```
401 Unauthorized
```
**Giải pháp**: Đăng nhập lại để lấy token mới

## 📄 License

Apache 2.0
