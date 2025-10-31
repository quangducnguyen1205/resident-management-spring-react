# QuanLyDanCu Backend# Quản Lý Dân Cư - Backend API



REST API backend for the Citizen Management System (Quản Lý Dân Cư) built with Spring Boot.REST API cho hệ thống quản lý dân cư với Spring Boot.



---## 🚀 Tính năng



## 📋 Overview- ✅ Quản lý Hộ khẩu

- ✅ Quản lý Tài khoản

A comprehensive backend system for managing citizen records, households, fee collection, and administrative tasks for residential communities.- ✅ **Thu phí và đóng góp** (Mới)

  - Quản lý đợt thu phí

**Key Features:**  - Ghi nhận thu phí từng hộ khẩu

- 🏠 Household management (Hộ khẩu)- ✅ Xác thực JWT

- 👥 Citizen records management (Nhân khẩu)- ✅ Validation requests với Jakarta Validation

- 💰 Fee collection system with mandatory and voluntary contributions- ✅ API Documentation với Swagger UI

- 📊 Statistical reporting

- 🔐 JWT-based authentication and role-based access control## 📋 Yêu cầu

- 📝 Change history tracking (Biến động)

- 🔄 Event-driven synchronization for automatic fee recalculation- Java 17+

- Maven 3.6+

---- PostgreSQL 15

- Docker & Docker Compose (optional)

## 🛠️ Tech Stack

## 🛠️ Cài đặt

- **Framework:** Spring Boot 3.3.5

- **Language:** Java 17### Cách 1: Chạy với Docker Compose (Chỉ Database)

- **Database:** PostgreSQL 16

- **Build Tool:** Maven 3.9+```bash

- **Security:** Spring Security + JWT# Khởi động PostgreSQL

- **API Documentation:** Swagger/OpenAPI 3docker-compose up db -d

- **Containerization:** Docker & Docker Compose

# Chạy backend từ IntelliJ IDEA hoặc terminal

---./mvnw spring-boot:run

```

## 🚀 Getting Started

### Cách 2: Chạy toàn bộ với Docker Compose

### Prerequisites

```bash

- Java 17 or higher# Khởi động cả backend và database

- Maven 3.9+docker-compose up -d

- Docker & Docker Compose (recommended)```

- PostgreSQL 16 (if running without Docker)

### Cách 3: Cài đặt thủ công

### Option 1: Run with Docker (Recommended)

1. Cài đặt PostgreSQL và tạo database:

**Start all services:**```sql

```bashCREATE DATABASE QuanLyDanCu;

docker compose up -d```

```

2. Chạy script SQL:

**Access the application:**```bash

- API: http://localhost:8080psql -U postgres -d QuanLyDanCu -f quanlydancu.sql

- Swagger UI: http://localhost:8080/swagger-ui/index.html```

- Adminer (DB GUI): http://localhost:8081

3. Cấu hình `application.properties` nếu cần

**Stop services:**

```bash4. Chạy ứng dụng:

docker compose down```bash

```./mvnw spring-boot:run

```

### Option 2: Run Backend Locally with Docker Database

## 📚 API Documentation

**Start only the database:**

```bashSau khi khởi động ứng dụng, truy cập Swagger UI tại:

docker compose up db -d

``````

http://localhost:8080/swagger-ui.html

**Run the backend:**```

```bash

./mvnw spring-boot:runOpenAPI JSON schema:

``````

http://localhost:8080/v3/api-docs

Or run from IntelliJ IDEA:```

1. Open the project in IntelliJ IDEA

2. Right-click `QuanLyDanCuApplication.java`## 🔐 Authentication

3. Select "Run" or "Debug"

Hầu hết các endpoints yêu cầu JWT token. 

### Option 3: Full Manual Setup

1. **Đăng nhập** để lấy token:

**1. Install PostgreSQL 16**```bash

POST /api/auth/login

**2. Create database:**{

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
