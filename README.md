# Quản Lý Dân Cư – Spring Boot + React (Vite)

Ứng dụng web quản lý dân cư cho tổ dân phố / chung cư, gồm:

- Quản lý **hộ khẩu, nhân khẩu, biến động**
- Quản lý **đợt thu phí** (bắt buộc / tự nguyện)
- Ghi nhận **thu phí hộ khẩu** theo từng đợt
- Quản lý tài khoản, phân quyền theo vai trò (ADMIN / TỔ TRƯỞNG / KẾ TOÁN)

Backend viết bằng **Spring Boot**, frontend là **React + Vite**.  
**Mặc định cả nhóm chạy project trên local (Java + Node + PostgreSQL).**  
Docker chỉ dùng **tuỳ chọn** cho một số máy dev nếu cần.

---

## 1. Cấu trúc project

```text
cnpm-spring-react/
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/example/QuanLyDanCu
│   ├── src/main/resources
│   ├── docs/                 # Tài liệu chi tiết
│   │   ├── BUSINESS_RULES.md
│   │   ├── API_REFERENCE.md
│   │   └── ARCHITECTURE_OVERVIEW.md
│   └── README.md             # Hướng dẫn riêng cho backend
│
├── Frontendquanlydancu/      # React admin frontend (Vite)
│   ├── src/│
└── README.md                 # File này
```

## Công nghệ sử dụng

### Backend
- Java 17
- Spring Boot 3 (Web, Security, Validation)
- Spring Data JPA, Hibernate
- PostgreSQL
- JWT Authentication

### Frontend
- React + Vite
- React Router DOM
- Axios
- Chart.js + react-chartjs-2
- CSS thuần theo từng page
---

## Chạy project trên local

### Yêu cầu:

- Java 17+
- Maven 3+
- Node.js 20+ và npm
- PostgreSQL
### Chuẩn bị database:
1.	Tạo database quanlydancu trong PostgreSQL.
2.	Import file:
```
backend/quanlydancu.sql
```
3.	Kiểm tra cấu hình DB trong:
```
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/quanlydancu
spring.datasource.username=postgres
spring.datasource.password=123456

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

### Start backend
```
cd backend
mvn spring-boot:run
# hoặc ./mvnw spring-boot:run nếu dùng wrapper
```
Backend chạy tại: http://localhost:8080.

### Start frontend
```
cd Frontendquanlydancu
npm install
npm run dev
```
Frontend dev server: http://localhost:5173.

## Phân quyền & tài khoản mẫu

### Hệ thống dùng 3 vai trò:
- ADMIN
	- 	Full CRUD tất cả module
	- 	Quản lý tài khoản
- TOTRUONG
    - Toàn quyền trên Hộ khẩu / Nhân khẩu
    - Chỉ được xem các module thu phí
- KETOAN
    - Chỉ được xem Hộ khẩu / Nhân khẩu
    - Full CRUD các module thu phí (Đợt thu phí, Thu phí hộ khẩu)

### Tài khoản mẫu (username/password) mô tả chi tiết trong:
- backend/README.md
- Hoặc xem seed data trong backend/quanlydancu.sql.

## Tài liệu tham khảo
``
backend/docs/BUSINESS_RULES.md
``
→ Quy tắc nghiệp vụ, logic tính phí, trạng thái nhân khẩu, các loại biến động…
``
backend/docs/API_REFERENCE.md
``
→ Danh sách endpoint REST, request/response, ma trận phân quyền.
``
backend/docs/ARCHITECTURE_OVERVIEW.md
``
→ Kiến trúc tổng thể, ERD database, mô tả bảng.