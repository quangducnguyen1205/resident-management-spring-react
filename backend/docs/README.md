# QuanLyDanCu Backend - Population Management System v1.1

## 📋 Overview

**QuanLyDanCu** is a comprehensive population management system backend built with Spring Boot 3.3.5. The system provides REST APIs for managing household registrations, citizens, population changes, and fee collection with role-based access control and JWT authentication.

### Key Features

- 🏠 **Household Management** - Register and manage household information
- 👥 **Citizen Management** - Track individual citizen data, temporary residence/absence
- 📊 **Population Changes** - Record births, deaths, relocations, and other demographic changes
- 💰 **Fee Collection System** - Annual sanitation fee collection with automatic calculation
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access (ADMIN, TOTRUONG, KETOAN)
- 📖 **API Documentation** - Interactive Swagger UI for API exploration
- ✅ **Comprehensive Testing** - 24 integration tests with 100% pass rate

---

## 🏗️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Spring Boot | 3.3.5 |
| **Language** | Java | 17 |
| **Database** | PostgreSQL | 15 |
| **ORM** | Spring Data JPA / Hibernate | 6.x |
| **Security** | Spring Security + JWT | - |
| **Validation** | Jakarta Validation | - |
| **Documentation** | SpringDoc OpenAPI | 2.6.0 |
| **Build Tool** | Maven | 3.6+ |
| **Containerization** | Docker & Docker Compose | - |

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/QuanLyDanCu/
│   │   │   ├── QuanLyDanCuApplication.java    # Main application entry
│   │   │   ├── config/                         # Security configuration
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/                     # REST controllers (6)
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── HoKhauController.java
│   │   │   │   ├── NhanKhauController.java
│   │   │   │   ├── BienDongController.java
│   │   │   │   ├── DotThuPhiController.java
│   │   │   │   └── ThuPhiHoKhauController.java
│   │   │   ├── dto/                            # Request/Response DTOs
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── entity/                         # JPA entities (6)
│   │   │   │   ├── TaiKhoan.java
│   │   │   │   ├── HoKhau.java
│   │   │   │   ├── NhanKhau.java
│   │   │   │   ├── BienDong.java
│   │   │   │   ├── DotThuPhi.java
│   │   │   │   └── ThuPhiHoKhau.java
│   │   │   ├── enums/                          # Enum types
│   │   │   │   ├── LoaiThuPhi.java            # BAT_BUOC, TU_NGUYEN
│   │   │   │   └── TrangThaiThuPhi.java       # CHUA_NOP, DA_NOP
│   │   │   ├── exception/                      # Exception handling
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── repository/                     # Data access layer
│   │   │   ├── security/                       # JWT utilities
│   │   │   │   ├── JwtUtil.java
│   │   │   │   └── JwtFilter.java
│   │   │   └── service/                        # Business logic
│   │   └── resources/
│   │       └── application.properties          # Configuration
│   └── test/
├── docs/                                       # Documentation (this folder)
├── test/                                       # Integration tests
│   ├── test-all.sh                            # Test automation script
│   └── seed-data/
│       └── test-seed.sql                      # Test data
├── Dockerfile                                  # Container build
├── pom.xml                                    # Maven dependencies
└── quanlydancu.sql                            # Database schema

```

---

## 🚀 Quick Start

### Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Docker & Docker Compose** (recommended)
- **PostgreSQL 15** (if running without Docker)

### Option 1: Run with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose from the parent directory:

```bash
# Navigate to project root (parent of backend/)
cd /path/to/cnpm-spring-react

# Start PostgreSQL, backend, and Adminer
docker compose up -d

# Check logs
docker compose logs -f backend

# Backend will be available at: http://localhost:8080
# Adminer (DB GUI) at: http://localhost:8081
```

**Services Started:**
- `postgres` - PostgreSQL database on port 5432
- `backend` - Spring Boot application on port 8080
- `adminer` - Database management UI on port 8081

### Option 2: Run Backend Locally with Docker Database

```bash
# Start only PostgreSQL
cd /path/to/cnpm-spring-react
docker compose up postgres -d

# Run backend from IDE or terminal
cd backend
./mvnw spring-boot:run
```

### Option 3: Manual Setup (No Docker)

1. **Install PostgreSQL 15** and create database:
   ```sql
   CREATE DATABASE QuanLyDanCu;
   ```

2. **Run database schema**:
   ```bash
   cd backend
   psql -U postgres -d QuanLyDanCu -f quanlydancu.sql
   ```

3. **Configure database connection** in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/QuanLyDanCu
   spring.datasource.username=postgres
   spring.datasource.password=123
   ```

4. **Build and run**:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

---

## 🔧 Configuration

### Application Properties

Located in `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
spring.application.name=QuanLyDanCu

# Database Configuration
spring.datasource.url=jdbc:postgresql://postgres:5432/QuanLyDanCu
spring.datasource.username=postgres
spring.datasource.password=123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your-secret-key-here
jwt.expiration=86400000

# Swagger UI
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### Environment Variables (Docker)

When using Docker Compose, override via environment variables:

```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/QuanLyDanCu
  - SPRING_DATASOURCE_USERNAME=postgres
  - SPRING_DATASOURCE_PASSWORD=123
  - JWT_SECRET=your-production-secret-key
```

---

## 📖 API Documentation

### Accessing Swagger UI

Once the backend is running, access interactive API documentation at:

**URL:** http://localhost:8080/swagger-ui.html

**OpenAPI JSON:** http://localhost:8080/v3/api-docs

### Quick Authentication Example

1. **Register a new account**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "tenDangNhap": "testuser",
       "matKhau": "password123",
       "vaiTro": "ADMIN",
       "hoTen": "Test User"
     }'
   ```

2. **Login to get JWT token**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "tenDangNhap": "testuser",
       "matKhau": "password123"
     }'
   ```

   Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiJ9...",
     "username": "testuser",
     "role": "ADMIN"
   }
   ```

3. **Use token in subsequent requests**:
   ```bash
   curl -X GET http://localhost:8080/api/ho-khau \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
   ```

### Using Swagger UI with Authentication

1. Open Swagger UI: http://localhost:8080/swagger-ui.html
2. Click **"Authorize"** button (top right)
3. Enter your JWT token (without "Bearer " prefix)
4. Click **"Authorize"** and **"Close"**
5. All subsequent API calls will include the token

---

## 🧪 Testing

### Running Integration Tests

The project includes a comprehensive test suite with 24 integration tests:

```bash
# Navigate to backend directory
cd backend

# Run all tests with Docker
./test/test-all.sh
```

**Expected Output:**
```
══════════════════════════════════════════════════════════════════════
  Test Results Summary
══════════════════════════════════════════════════════════════════════

Total Tests: 24
Passed: 24 ✅
Failed: 0 ❌
Success Rate: 100.00%
```

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Authentication | 2 | Login, Register |
| Household (HoKhau) | 4 | CRUD operations |
| Citizen (NhanKhau) | 5 | CRUD + Statistics |
| Population Changes (BienDong) | 3 | CRUD operations |
| Fee Periods (DotThuPhi) | 4 | CRUD operations |
| Fee Collection (ThuPhiHoKhau) | 6 | CRUD + Calculation |
| **Total** | **24** | **100% pass rate** |

For detailed testing guide, see: [TEST_GUIDE.md](./TEST_GUIDE.md)

---

## 🔐 Security & Roles

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System Administrator | Full access to all operations |
| **TOTRUONG** | Neighborhood Leader | Manage households, citizens, population changes, fee periods |
| **KETOAN** | Accountant | Manage fee collection records only |

### Authentication Flow

1. User registers via `/api/auth/register` (public)
2. User logs in via `/api/auth/login` to receive JWT token
3. JWT token must be included in `Authorization: Bearer <token>` header
4. Backend validates token and extracts user role
5. Role-based access control enforced by `@PreAuthorize` annotations

### Default Test Accounts

When using test seed data (`test/seed-data/test-seed.sql`):

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | ADMIN | Full admin access |
| totruong01 | admin123 | TOTRUONG | Neighborhood leader #1 |
| totruong02 | admin123 | TOTRUONG | Neighborhood leader #2 |
| ketoan01 | admin123 | KETOAN | Accountant #1 |
| ketoan02 | admin123 | KETOAN | Accountant #2 |

---

## 🗄️ Database Schema

The system uses PostgreSQL with 6 main tables:

1. **tai_khoan** - User accounts with roles
2. **ho_khau** - Household registrations
3. **nhan_khau** - Individual citizens
4. **bien_dong** - Population change records
5. **dot_thu_phi** - Fee collection periods
6. **thu_phi_ho_khau** - Fee payment records

For detailed schema documentation, see: [ARCHITECTURE.md](./ARCHITECTURE.md)

To initialize the database:

```bash
# Using Docker
docker compose exec postgres psql -U postgres -d QuanLyDanCu -f /docker-entrypoint-initdb.d/quanlydancu.sql

# Or manually
psql -U postgres -d QuanLyDanCu -f quanlydancu.sql
```

---

## 📊 System Architecture

```
┌─────────────┐
│   Client    │  (Browser, Mobile App, Postman)
└─────┬───────┘
      │ HTTP/REST + JSON
      │
┌─────▼────────────────────────────────────────┐
│         Spring Boot Backend                  │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Security Filter Chain              │    │
│  │  • CORS Filter                      │    │
│  │  • JWT Filter (Authentication)      │    │
│  │  • Authorization Filter             │    │
│  └────────┬───────────────────────────┘    │
│           │                                  │
│  ┌────────▼───────────────────────────┐    │
│  │     Controllers (REST APIs)         │    │
│  │  • AuthController                   │    │
│  │  • HoKhauController                 │    │
│  │  • NhanKhauController               │    │
│  │  • BienDongController               │    │
│  │  • DotThuPhiController              │    │
│  │  • ThuPhiHoKhauController           │    │
│  └────────┬───────────────────────────┘    │
│           │                                  │
│  ┌────────▼───────────────────────────┐    │
│  │      Services (Business Logic)      │    │
│  │  • Input validation                 │    │
│  │  • Role-based authorization         │    │
│  │  • Fee calculation (annual)         │    │
│  │  • Status auto-update               │    │
│  └────────┬───────────────────────────┘    │
│           │                                  │
│  ┌────────▼───────────────────────────┐    │
│  │  Repositories (Data Access)         │    │
│  │  • Spring Data JPA                  │    │
│  │  • Custom query methods             │    │
│  └────────┬───────────────────────────┘    │
└───────────┼──────────────────────────────────┘
            │
┌───────────▼───────────────────────────┐
│      PostgreSQL Database              │
│  • 6 main tables                      │
│  • Referential integrity              │
│  • CHECK constraints                  │
└───────────────────────────────────────┘
```

For detailed architecture documentation, see: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, entity relationships, and data flow |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API endpoint reference with examples |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Business logic rules (especially fee collection) |
| [TEST_GUIDE.md](./TEST_GUIDE.md) | Testing guide and coverage details |
| [QuanLyDanCu.postman_collection.json](./QuanLyDanCu.postman_collection.json) | Postman collection for API testing |

---

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use (8080)**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

**2. Database connection refused**
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres
```

**3. JWT token invalid**
- Ensure token hasn't expired (default: 24 hours)
- Check token is included in `Authorization: Bearer <token>` header
- Verify JWT secret matches between environments

**4. Maven build fails**
```bash
# Clean and rebuild
./mvnw clean install -DskipTests

# If dependencies fail, try:
./mvnw clean install -U
```

**5. Swagger UI not loading**
- Ensure backend is running on port 8080
- Check SpringDoc dependency is in pom.xml
- Access directly: http://localhost:8080/swagger-ui/index.html

---

## 🔄 Version History

### v1.1 (Current - October 2025)
- ✅ **Annual fee collection system** implemented
- ✅ Automatic fee calculation based on household size
- ✅ KETOAN-only authorization for fee management
- ✅ Payment status tracking (CHUA_NOP/DA_NOP)
- ✅ Temporary absence exclusion in fee calculation
- ✅ Comprehensive integration testing (24 tests, 100% pass rate)
- ✅ Complete documentation overhaul

### v1.0
- Initial release with core population management features
- JWT authentication and role-based authorization
- Swagger API documentation

---

## 👥 Development Team

**Project:** QuanLyDanCu - Population Management System  
**Institution:** Software Engineering Course Project  
**Date:** October 2025

---

## 📝 License

This project is developed for educational purposes as part of a university software engineering course.

---

## 🆘 Support

For issues, questions, or contributions:
- Review the [API_REFERENCE.md](./API_REFERENCE.md) for endpoint details
- Check [TEST_GUIDE.md](./TEST_GUIDE.md) for testing procedures
- Read [BUSINESS_RULES.md](./BUSINESS_RULES.md) for business logic

**Backend URL:** http://localhost:8080  
**Swagger UI:** http://localhost:8080/swagger-ui.html  
**Database GUI (Adminer):** http://localhost:8081
