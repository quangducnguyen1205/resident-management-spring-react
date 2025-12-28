# Quản Lý Dân Cư - Backend API

REST API Spring Boot phục vụ hệ thống quản lý dân cư, hỗ trợ quản lý hộ khẩu, nhân khẩu và thu phí tự động.

## 🚀 Tính năng chính
- Quản lý hộ khẩu, nhân khẩu và lịch sử biến động
- Quản lý đợt thu phí bắt buộc/tự nguyện và thống kê tổng quan
- Ghi nhận thanh toán từng hộ khẩu với tái tính toán trực tiếp
- Xác thực JWT, phân quyền theo vai trò và ghi log bảo mật
- Tài liệu API đầy đủ bằng Swagger/OpenAPI

## 🛠️ Tech Stack
- Java 17, Spring Boot 3.3.x, Spring Security + JWT
- PostgreSQL 16, Maven 3.9+
- Docker & Docker Compose (tùy chọn)

## 📋 Yêu cầu hệ thống
- Java 17+
- Maven 3.9+
- PostgreSQL 16 (hoặc Docker)
- Docker + Docker Compose nếu chạy toàn bộ stack

## ⚙️ Cài đặt
### Cách 1: Docker Compose (backend + database)
```bash
docker compose up -d
```
Truy cập API tại `http://localhost:8080`, Swagger UI tại `http://localhost:8080/swagger-ui/index.html`.

### Cách 2: Backend local + PostgreSQL Docker
```bash
docker compose up db -d       # chỉ bật database
./mvnw spring-boot:run        # chạy backend từ IDE hoặc terminal
```

### Cách 3: Cài đặt thủ công
1. Cài PostgreSQL 16 và tạo DB `QuanLyDanCu`
2. Chạy `psql -U postgres -d QuanLyDanCu -f quanlydancu.sql`
3. Điều chỉnh `src/main/resources/application.properties` nếu cần
4. Khởi động bằng `./mvnw spring-boot:run`

## 📚 Tài liệu
- `docs/API_REFERENCE.md` – danh sách endpoint
- `docs/ARCHITECTURE_OVERVIEW.md` – kiến trúc tổng quan
- `docs/BUSINESS_RULES.md` – quy tắc tính phí & nghiệp vụ

## 🧪 Kiểm thử
```bash
./mvnw test                      # unit tests
./test/test-voluntary-fees.sh    # kịch bản phí tự nguyện
./test/manual-recalc-test.sh     # kịch bản tái tính toán
```

### Swagger UI
Dùng Swagger UI để tương tác nhanh và xem schema chuẩn.

### Ví dụ cURL
#### Đăng nhập
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}'
```

#### Tạo đợt thu phí bắt buộc
```bash
curl -X POST http://localhost:8080/api/dot-thu-phi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
        "tenDot": "Phí vệ sinh Q1/2025",
        "loai": "BAT_BUOC",
        "ngayBatDau": "2025-01-01",
        "ngayKetThuc": "2025-03-31",
        "dinhMuc": 6000
      }'
```

#### Tạo đợt thu phí tự nguyện
```bash
curl -X POST http://localhost:8080/api/dot-thu-phi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
        "tenDot": "Ủng hộ Tết 2025",
        "loai": "TU_NGUYEN",
        "ngayBatDau": "2025-01-01",
        "ngayKetThuc": "2025-12-31"
      }'
```

#### Ghi nhận thu phí bắt buộc
```bash
# tongPhi được tính tự động = soNguoi × dinhMuc × soThang
curl -X POST http://localhost:8080/api/thu-phi-ho-khau \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
        "hoKhauId": 1,
        "dotThuPhiId": 1,
        "ngayThu": "2025-01-15",
        "ghiChu": "Đã thanh toán đủ"
      }'
```

#### Ghi nhận thu phí tự nguyện
```bash
# tongPhi bắt buộc phải gửi trong request, giá trị > 0
curl -X POST http://localhost:8080/api/thu-phi-ho-khau \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
        "hoKhauId": 1,
        "dotThuPhiId": 2,
        "tongPhi": 500000,
        "ngayThu": "2025-01-20",
        "ghiChu": "Ủng hộ Tết"
      }'
```

## 🔑 Tài khoản mặc định
| Username  | Password | Role     | Mô tả                              |
|-----------|----------|----------|------------------------------------|
| admin     | admin123 | ADMIN    | Quản trị hệ thống (toàn quyền)     |
| totruong1 | admin123 | TOTRUONG | Tổ trưởng (quản lý hộ khẩu/nhân khẩu) |
| ketoan01  | admin123 | KETOAN   | Kế toán (quản lý thu phí)          |
| ketoan02  | admin123 | KETOAN   | Kế toán (quản lý thu phí)          |

## 🏗️ Cấu trúc dự án
```
backend/
├── src/
│   ├── main/java/com/example/QuanLyDanCu/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/{request,response}/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── resources/application.properties
├── test/java/com/example/QuanLyDanCu/
├── test/ (shell scripts)
├── docs/
├── quanlydancu.sql
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## 📊 Lược đồ cơ sở dữ liệu
- `tai_khoan`: tài khoản đăng nhập
- `ho_khau`: thông tin hộ khẩu
- `nhan_khau`: nhân khẩu thuộc hộ
- `dot_thu_phi`: đợt thu phí
- `thu_phi_ho_khau`: thông tin đóng góp của hộ
- `bien_dong`: lịch sử biến động nhân khẩu

## ✅ Quy tắc validation nổi bật
### `DotThuPhiRequestDto`
- `tenDot`, `loai`, `ngayBatDau`, `ngayKetThuc`, `dinhMuc`: bắt buộc, `dinhMuc > 0`

### `ThuPhiHoKhauRequestDto`
- `hoKhauId`, `dotThuPhiId`: bắt buộc, phải là số dương
- `ngayThu`: **bắt buộc cho cả BAT_BUOC và TU_NGUYEN**
- `tongPhi`: chỉ gửi khi đợt thu là `TU_NGUYEN` và giá trị phải > 0; **không được gửi** trường này với `BAT_BUOC`
- `ghiChu`: tùy chọn

## 🔢 Công thức tính phí
- `BAT_BUOC`: `tongPhi = soNguoi × dinhMuc × soThang`, trong đó `soThang` là số tháng giữa `ngayBatDau` và `ngayKetThuc` (tính cả hai đầu mút). Nếu thiếu ngày, hệ thống mặc định 1 tháng để tránh sai lệch lịch sử.
- `TU_NGUYEN`: `tongPhi` lấy trực tiếp từ trường `tongPhi` trong request, hệ thống không tự suy ra.
- Bảng `thu_phi_ho_khau` chỉ lưu trạng thái `DA_NOP`. `CHUA_NOP` chỉ xuất hiện ảo trong API tổng quan đối với hộ chưa có bản ghi.

## 🐛 Troubleshooting
- **Kết nối database lỗi:** kiểm tra PostgreSQL đang chạy, thông tin trong `application.properties`, DB `QuanLyDanCu` tồn tại
- **Port 8080 bận:** cập nhật `server.port=8081` hoặc dừng tiến trình `lsof -ti:8080 | xargs kill -9`
- **Swagger UI trắng:** bảo đảm `SecurityConfig` permit `/swagger-ui/**` và `/v3/api-docs/**`
- **Test thất bại:** xác nhận container Docker đang healthy (`docker compose ps`) và schema mới nhất đã được áp dụng

## 🔒 Phân quyền theo vai trò
| Vai trò   | Hộ khẩu / Nhân khẩu       | Đợt thu phí           | Thu phí hộ khẩu       |
|-----------|---------------------------|----------------------|----------------------|
| ADMIN     | Xem / Tạo / Sửa / Xóa     | Xem / Tạo / Sửa / Xóa | Xem / Tạo / Sửa / Xóa |
| TOTRUONG  | Xem / Tạo / Sửa / Xóa     | Xem                  | Xem                  |
| KETOAN    | Xem                       | Xem / Tạo / Sửa / Xóa | Xem / Tạo / Sửa / Xóa |

> **Lưu ý:** TOTRUONG chỉ quản lý hộ khẩu và nhân khẩu, không có quyền tạo/sửa/xóa đợt thu phí hay ghi nhận thu phí.
```sql  "tenDangNhap": "admin",

CREATE DATABASE quanlydancu;  "matKhau": "password"

```}

```

**3. Run schema:**

```bash2. **Sử dụng token** trong header:

psql -U postgres -d quanlydancu -f quanlydancu.sql```

```Authorization: Bearer <your-jwt-token>

```

**4. Configure `application.properties`:**

```properties3. **Trong Swagger UI**: Click nút "Authorize" và nhập token (không cần "Bearer" prefix)

spring.datasource.url=jdbc:postgresql://localhost:5432/quanlydancu

spring.datasource.username=postgres## 📦 API Endpoints

spring.datasource.password=123456

```### Thu Phí Module



**5. Run the application:**#### Đợt Thu Phí

```bash- `GET /api/dot-thu-phi` - Lấy danh sách tất cả đợt thu phí

./mvnw clean spring-boot:run- `GET /api/dot-thu-phi/{id}` - Lấy chi tiết đợt thu phí

```- `POST /api/dot-thu-phi` - Tạo đợt thu phí mới (ADMIN/TOTRUONG)

- `PUT /api/dot-thu-phi/{id}` - Cập nhật đợt thu phí (ADMIN/TOTRUONG)

---- `DELETE /api/dot-thu-phi/{id}` - Xóa đợt thu phí (ADMIN/TOTRUONG)



## 🧪 Testing#### Thu Phí Hộ Khẩu

- `GET /api/thu-phi-ho-khau` - Lấy danh sách tất cả thu phí

### Run Integration Tests- `GET /api/thu-phi-ho-khau/{id}` - Lấy chi tiết thu phí

- `GET /api/thu-phi-ho-khau/ho-khau/{hoKhauId}` - Lấy thu phí theo hộ khẩu

**With Docker:**- `GET /api/thu-phi-ho-khau/dot-thu-phi/{dotThuPhiId}` - Lấy thu phí theo đợt

```bash- `POST /api/thu-phi-ho-khau` - Tạo bản ghi thu phí mới (ADMIN/TOTRUONG)

# Start Docker containers- `PUT /api/thu-phi-ho-khau/{id}` - Cập nhật thu phí (ADMIN/TOTRUONG)

docker compose up -d- `DELETE /api/thu-phi-ho-khau/{id}` - Xóa thu phí (ADMIN/TOTRUONG)



# Wait for services to be ready### Hộ Khẩu

sleep 15- `GET /api/hokhau` - Lấy danh sách hộ khẩu

- `GET /api/hokhau/{id}` - Lấy chi tiết hộ khẩu

# Run all tests- `POST /api/hokhau` - Tạo hộ khẩu mới (ADMIN/TOTRUONG)

./test/test-all.sh- `PUT /api/hokhau/{id}` - Cập nhật hộ khẩu (ADMIN/TOTRUONG)

```- `DELETE /api/hokhau/{id}` - Xóa hộ khẩu (ADMIN/TOTRUONG)



**Run specific test suites:**## 🧪 Testing

```bash

# Voluntary fee tests### Swagger UI

./test/test-voluntary-fees.shSử dụng Swagger UI để test API trực tiếp trong trình duyệt.



# Manual recalculation tests### cURL Examples

./test/manual-recalc-test.sh

``````bash

# Đăng nhập

### Run Unit Testscurl -X POST http://localhost:8080/api/auth/login \

  -H "Content-Type: application/json" \

```bash  -d '{"tenDangNhap":"admin","matKhau":"password"}'

./mvnw test

```# Tạo đợt thu phí

curl -X POST http://localhost:8080/api/dot-thu-phi \

---  -H "Content-Type: application/json" \

  -H "Authorization: Bearer <token>" \

## 📚 Documentation  -d '{

    "tenDot": "Thu phí quản lý tháng 1/2025",

Detailed documentation is available in the `/docs` folder:    "loai": "QUAN_LY",

    "ngayBatDau": "2025-01-01",

- **[API Reference](docs/API_REFERENCE.md)** - Complete API endpoint documentation    "ngayKetThuc": "2025-01-31",

- **[Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)** - System design and components    "dinhMuc": 50000

- **[Business Rules](docs/BUSINESS_RULES.md)** - Business logic and fee calculation rules  }'



---# Ghi nhận thu phí

curl -X POST http://localhost:8080/api/thu-phi-ho-khau \

## 🔑 Default User Accounts  -H "Content-Type: application/json" \

  -H "Authorization: Bearer <token>" \

After running the SQL schema, these accounts are available:  -d '{

    "hoKhauId": 1,

| Username | Password | Role | Description |    "dotThuPhiId": 1,

|----------|----------|------|-------------|    "soTienDaThu": 50000,

| admin | admin123 | ADMIN | System administrator |    "ngayThu": "2025-01-15",

| ketoan01 | admin123 | KETOAN | Accountant (fee management) |    "months": "1",

| ketoan02 | admin123 | KETOAN | Accountant (fee management) |    "ghiChu": "Đã thanh toán đủ"

| user01 | admin123 | USER | Regular user |  }'

| user02 | admin123 | USER | Regular user |```



---## 🏗️ Cấu trúc dự án



## 📊 Database Schema```

src/main/java/com/example/QuanLyDanCu/

The database schema is defined in `quanlydancu.sql` with the following main tables:├── config/

│   ├── OpenApiConfig.java          # Cấu hình Swagger

- `tai_khoan` - User accounts│   └── SecurityConfig.java         # Cấu hình bảo mật

- `ho_khau` - Household records├── controller/

- `nhan_khau` - Citizen records│   ├── AuthController.java

- `dot_thu_phi` - Fee collection periods│   ├── HoKhauController.java

- `thu_phi_ho_khau` - Household fee records│   ├── DotThuPhiController.java    # Mới

- `bien_dong` - Change history│   └── ThuPhiHoKhauController.java # Mới

├── dto/

---│   ├── request/                    # Mới

│   │   ├── DotThuPhiRequestDto.java

## 🔧 Development│   │   ├── ThuPhiHoKhauRequestDto.java

│   │   ├── HoKhauRequestDto.java

### Project Structure│   │   └── TaiKhoanRequestDto.java

│   └── response/                   # Mới

```│       ├── DotThuPhiResponseDto.java

backend/│       ├── ThuPhiHoKhauResponseDto.java

├── src/│       └── HoKhauResponseDto.java

│   ├── main/├── entity/

│   │   ├── java/com/example/QuanLyDanCu/│   ├── HoKhau.java

│   │   │   ├── controller/      # REST controllers│   ├── TaiKhoan.java

│   │   │   ├── service/          # Business logic│   ├── DotThuPhi.java              # Mới

│   │   │   ├── repository/       # Data access│   └── ThuPhiHoKhau.java           # Mới

│   │   │   ├── entity/           # JPA entities├── repository/

│   │   │   ├── dto/              # Data transfer objects│   ├── HoKhauRepository.java

│   │   │   ├── security/         # JWT & authentication│   ├── TaiKhoanRepository.java

│   │   │   ├── config/           # Spring configuration│   ├── DotThuPhiRepository.java    # Mới

│   │   │   └── enums/            # Enumerations│   └── ThuPhiHoKhauRepository.java # Mới

│   │   └── resources/├── service/

│   │       └── application.properties│   ├── AuthService.java

│   └── test/                     # Unit tests│   ├── HoKhauService.java

├── test/                         # Integration test scripts│   ├── DotThuPhiService.java       # Mới

├── docs/                         # Documentation│   └── ThuPhiHoKhauService.java    # Mới

├── quanlydancu.sql              # Database schema├── security/

├── Dockerfile                    # Docker configuration│   ├── JwtFilter.java

├── docker-compose.yml           # Docker Compose setup│   └── JwtUtil.java

└── pom.xml                       # Maven configuration└── exception/

```    └── GlobalExceptionHandler.java

```

### Building

## 📝 Validation Rules

```bash

# Clean and compile### DotThuPhiRequestDto

./mvnw clean compile- `tenDot`: Bắt buộc, không được để trống

- `loai`: Bắt buộc, không được để trống

# Package (skip tests)- `ngayBatDau`: Bắt buộc

./mvnw clean package -DskipTests- `ngayKetThuc`: Bắt buộc

- `dinhMuc`: Bắt buộc, phải là số dương

# Full build with tests

./mvnw clean package### ThuPhiHoKhauRequestDto

```- `hoKhauId`: Bắt buộc, phải là số dương

- `dotThuPhiId`: Bắt buộc, phải là số dương

---- `soTienDaThu`: Bắt buộc, phải >= 0

- `ngayThu`: Bắt buộc

## 🐛 Troubleshooting- `months`: Tùy chọn

- `ghiChu`: Tùy chọn

**Database connection issues:**

- Verify PostgreSQL is running: `docker ps` or `systemctl status postgresql`## 🔒 Phân quyền

- Check credentials in `application.properties`

- Ensure database `quanlydancu` exists- **ADMIN**: Toàn quyền truy cập

- **TOTRUONG**: Quản lý hộ khẩu và thu phí

**Port already in use:**- **KETOAN**: Xem dữ liệu

- Change port in `application.properties`: `server.port=8081`- **USER**: Quyền giới hạn

- Or stop the process using port 8080: `lsof -ti:8080 | xargs kill -9`

## 🐛 Troubleshooting

**Tests failing:**

- Ensure Docker containers are healthy: `docker compose ps`### Lỗi kết nối database

- Check backend logs: `docker logs quanlydancu-backend````

- Verify database schema is up to dateError: Connection refused

```

---**Giải pháp**: Kiểm tra PostgreSQL đang chạy và cấu hình trong `application.properties`



## 📝 API Examples### Swagger UI không hiển thị

```

### AuthenticationWhitelabel Error Page

```

```bash**Giải pháp**: Kiểm tra SecurityConfig đã permit `/swagger-ui/**` và `/v3/api-docs/**`

# Login

curl -X POST http://localhost:8080/api/auth/login \### JWT Token hết hạn

  -H "Content-Type: application/json" \```

  -d '{"username":"admin","password":"admin123"}'401 Unauthorized

```

# Response: {"token":"eyJhbGci..."}**Giải pháp**: Đăng nhập lại để lấy token mới

```

## 📄 License

### Create Household

Apache 2.0

```bash
curl -X POST http://localhost:8080/api/ho-khau \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soHoKhau": "HK001",
    "tenChuHo": "Nguyen Van A",
    "diaChiThuongTru": "123 Main St"
  }'
```

### Create Fee Period

```bash
# Mandatory fee
curl -X POST http://localhost:8080/api/dot-thu-phi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenDot": "Phí vệ sinh Q1/2025",
    "loai": "BAT_BUOC",
    "ngayBatDau": "2025-01-01",
    "ngayKetThuc": "2025-03-31",
    "dinhMuc": 6000
  }'

# Voluntary fee
curl -X POST http://localhost:8080/api/dot-thu-phi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenDot": "Ủng hộ Tết 2025",
    "loai": "TU_NGUYEN",
    "ngayBatDau": "2025-01-01",
    "ngayKetThuc": "2025-12-31"
  }'
```

---

## 📄 License

This project is developed for educational purposes.

---

## 👥 Contributors

Backend Development Team - Software Engineering Project

---

## 📞 Support

For issues or questions:
- Check the `/docs` folder for detailed documentation
- Review the API documentation at `/swagger-ui/index.html`
- Contact the development team
