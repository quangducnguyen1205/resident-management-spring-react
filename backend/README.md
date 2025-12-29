# Quản Lý Dân Cư - Backend (Spring Boot)

## Yêu cầu
- Java 17+
# Quản Lý Dân Cư - Backend (Spring Boot)

## Yêu cầu
- Java 17+
- Maven 3+
- PostgreSQL (local)

## Chuẩn bị database
1) Tạo database `quanlydancu`.

2) Import schema từ file `quanlydancu.sql`:
```bash
psql -U postgres -d quanlydancu -f quanlydancu.sql
```

3) Kiểm tra cấu hình trong `src/main/resources/application.properties` (URL/username/password).

## Chạy backend
```bash
mvn -DskipTests spring-boot:run
```

## API
- Base URL: `http://localhost:8080`
- API prefix: `/api`
- Swagger UI (nếu được bật): `http://localhost:8080/swagger-ui/index.html`

