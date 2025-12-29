# Quản Lý Dân Cư – Spring Boot + React (Vite)

Ứng dụng web quản lý dân cư (hộ khẩu/nhân khẩu/biến động) và thu phí theo đợt.

## Yêu cầu
- Java 17+
- Maven 3+
- Node.js 20+ và npm
- PostgreSQL (local)

## Chuẩn bị cơ sở dữ liệu
1) Tạo database:
```bash
createdb -U postgres quanlydancu
```

2) Import schema (legacy):
```bash
psql -U postgres -d quanlydancu -f backend/quanlydancu.sql
```

3) Cấu hình kết nối DB nằm trong `backend/src/main/resources/application.properties`.

## Chạy backend (local)
```bash
cd backend
mvn -DskipTests spring-boot:run
```
Backend mặc định chạy tại `http://localhost:8080`.

## Chạy frontend (local)
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server mặc định: `http://localhost:5173`.

Frontend gọi API backend tại `http://localhost:8080/api`.

## Tài liệu tham khảo
- `backend/docs/BUSINESS_RULES.md`
- `backend/docs/API_REFERENCE.md`
- `backend/docs/ARCHITECTURE_OVERVIEW.md`