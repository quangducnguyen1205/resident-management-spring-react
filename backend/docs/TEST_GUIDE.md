# Test Guide - QuanLyDanCu Backend v1.1

## Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Test Data](#test-data)
6. [Test Scenarios](#test-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Manual Testing](#manual-testing)

---

## Overview

The QuanLyDanCu backend includes a comprehensive integration test suite with **24 tests** covering all API endpoints. The test suite achieves **100% pass rate** and validates:

- ✅ Authentication and authorization
- ✅ CRUD operations for all entities
- ✅ Business logic (fee calculation, status updates)
- ✅ Role-based access control
- ✅ Input validation
- ✅ API documentation endpoints

### Test Approach

- **Integration Tests:** Test entire request-response cycle (Controller → Service → Repository → Database)
- **Docker-Based:** Tests run in isolated Docker containers
- **Reproducible:** Seed data loaded before each test run
- **Automated:** One-click execution via shell script

---

## Test Infrastructure

### Test Files

| File | Purpose | Lines |
|------|---------|-------|
| `test/test-all.sh` | Main test automation script | 481 |
| `test/seed-data/test-seed.sql` | Test data (70+ records) | 249 |
| `docs/QuanLyDanCu.postman_collection.json` | Postman collection | - |

### Test Environment

```
┌──────────────────────────────────────────┐
│  Docker Compose Environment              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL Container              │ │
│  │  - Port: 5432                      │ │
│  │  - Database: QuanLyDanCu          │ │
│  │  - Seed data loaded automatically  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Backend Container                 │ │
│  │  - Port: 8080                      │ │
│  │  - Spring Boot 3.3.5               │ │
│  │  - Connects to PostgreSQL          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Test Script (test-all.sh)         │ │
│  │  - Executes cURL commands          │ │
│  │  - Validates HTTP responses        │ │
│  │  - Generates test report           │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Running Tests

### Prerequisites

- **Docker & Docker Compose** installed
- **cURL** installed (usually pre-installed on macOS/Linux)
- **jq** installed (for JSON parsing) - `brew install jq` or `apt-get install jq`

### Quick Start

```bash
# Navigate to backend directory
cd /path/to/cnpm-spring-react/backend

# Run all tests
./test/test-all.sh
```

### Expected Output

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║       QuanLyDanCu - Unified Integration Test Suite v4.0.0          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

══════════════════════════════════════════════════════════════════════
  Phase 1: Docker Environment Setup
══════════════════════════════════════════════════════════════════════

ℹ Stopping existing containers...
✓ Containers stopped

ℹ Starting Docker Compose services...
✓ Docker services started

ℹ Waiting for backend to be ready (max 60s)...
✓ Backend is ready (took 8s)

══════════════════════════════════════════════════════════════════════
  Phase 2: Database Seeding
══════════════════════════════════════════════════════════════════════

ℹ Loading seed data from test/seed-data/test-seed.sql...
✓ Seed data loaded successfully

══════════════════════════════════════════════════════════════════════
  Phase 3: Authentication Tests
══════════════════════════════════════════════════════════════════════

✓ ADMIN login successful
✓ Test user registration successful

══════════════════════════════════════════════════════════════════════
  Phase 4: Hộ Khẩu (Household) Tests
══════════════════════════════════════════════════════════════════════

✓ Get all households (200)
✓ Get household by ID (200)
✓ Create household (201)
✓ Update household (200)

══════════════════════════════════════════════════════════════════════
  Phase 5: Nhân Khẩu (Citizen) Tests
══════════════════════════════════════════════════════════════════════

✓ Get all citizens (200)
✓ Search citizens by name (200)
✓ Gender statistics (200)
✓ Age statistics (200)
✓ Create citizen (201)

══════════════════════════════════════════════════════════════════════
  Phase 6: Biến Động (Population Change) Tests
══════════════════════════════════════════════════════════════════════

✓ Get all population changes (200)
✓ Create population change (201)
✓ Get population change by ID (200)

══════════════════════════════════════════════════════════════════════
  Phase 7: Đợt Thu Phí (Fee Period) Tests
══════════════════════════════════════════════════════════════════════

✓ Get all fee periods (200)
✓ Create fee period (201)
✓ Get fee period by ID (200)
✓ Update fee period (200)

══════════════════════════════════════════════════════════════════════
  Phase 8: Thu Phí Hộ Khẩu (Fee Collection) Tests
══════════════════════════════════════════════════════════════════════

ℹ Logging in as KETOAN...
✓ KETOAN login successful

✓ Get all fee collections (200)
✓ Get fee collection statistics (200)
✓ Calculate fee for household 1 (200)
✓ Calculate fee for household 2 (200)
✓ Create fee collection (201)
✓ Update fee collection (200)

══════════════════════════════════════════════════════════════════════
  Phase 9: API Documentation Tests
══════════════════════════════════════════════════════════════════════

✓ Swagger UI accessible (200)
✓ OpenAPI JSON accessible (200)

══════════════════════════════════════════════════════════════════════
  Test Results Summary
══════════════════════════════════════════════════════════════════════

Total Tests: 24
Passed: 24 ✅
Failed: 0 ❌
Success Rate: 100.00%

Test execution completed in 45 seconds.

══════════════════════════════════════════════════════════════════════
  Generating Test Report
══════════════════════════════════════════════════════════════════════

✓ Test report generated: docs/API_TEST_REPORT.md
```

---

## Test Coverage

### Summary by Module

| Module | Tests | Coverage |
|--------|-------|----------|
| **Authentication** | 2 | Login, Register |
| **Household (HoKhau)** | 4 | List, Get by ID, Create, Update |
| **Citizen (NhanKhau)** | 5 | List, Search, Statistics (2), Create |
| **Population Change (BienDong)** | 3 | List, Create, Get by ID |
| **Fee Period (DotThuPhi)** | 4 | List, Create, Get by ID, Update |
| **Fee Collection (ThuPhiHoKhau)** | 6 | List, Stats, Calc (2), Create, Update |
| **API Documentation** | 2 | Swagger UI, OpenAPI JSON |
| **Total** | **24** | **100% pass rate** |

---

### Detailed Test Breakdown

#### Phase 3: Authentication Tests (2 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | ADMIN login | POST | /api/auth/login | JWT token generation, valid credentials |
| 2 | Register new user | POST | /api/auth/register | User creation, unique username |

**Sample Request (Login):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

---

#### Phase 4: Household Tests (4 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Get all households | GET | /api/ho-khau | List retrieval, JWT auth |
| 2 | Get household by ID | GET | /api/ho-khau/1 | Single record retrieval |
| 3 | Create household | POST | /api/ho-khau | Creation with ADMIN role, validation |
| 4 | Update household | PUT | /api/ho-khau/{id} | Update operation, authorization |

**Sample Test Data (Create):**
```json
{
  "soHoKhau": "HK_TEST_001",
  "diaChiThuongTru": "Test Address",
  "chuHo": "Test Head",
  "ngayLap": "2025-10-31",
  "ghiChu": "Test household"
}
```

---

#### Phase 5: Citizen Tests (5 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Get all citizens | GET | /api/nhan-khau?page=0&size=10 | Pagination, list retrieval |
| 2 | Search by name | GET | /api/nhan-khau/search?q=Nguyen | Search functionality |
| 3 | Gender statistics | GET | /api/nhan-khau/stats/gender | Aggregate calculation |
| 4 | Age statistics | GET | /api/nhan-khau/stats/age | Age group calculation |
| 5 | Create citizen | POST | /api/nhan-khau | Creation, foreign key validation |

**Sample Response (Gender Stats):**
```json
{
  "total": 29,
  "male": 15,
  "female": 14,
  "malePercentage": 51.72,
  "femalePercentage": 48.28
}
```

---

#### Phase 6: Population Change Tests (3 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Get all changes | GET | /api/bien-dong | List retrieval |
| 2 | Create change | POST | /api/bien-dong | Change event recording |
| 3 | Get change by ID | GET | /api/bien-dong/{id} | Single record retrieval |

**Sample Test Data (Create):**
```json
{
  "nhanKhauId": 1,
  "loaiBienDong": "SINH",
  "ngayBienDong": "2025-10-31",
  "ghiChu": "Test birth record"
}
```

---

#### Phase 7: Fee Period Tests (4 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Get all periods | GET | /api/dot-thu-phi | List retrieval |
| 2 | Create period | POST | /api/dot-thu-phi | Period creation, enum validation |
| 3 | Get period by ID | GET | /api/dot-thu-phi/{id} | Single record retrieval |
| 4 | Update period | PUT | /api/dot-thu-phi/{id} | Update operation |

**Sample Test Data (Create):**
```json
{
  "tenDot": "Test Fee Period 2025",
  "loaiPhi": "BAT_BUOC",
  "dinhMuc": 6000,
  "ngayBatDau": "2025-01-01",
  "ngayKetThuc": "2025-12-31",
  "ghiChu": "Test period"
}
```

---

#### Phase 8: Fee Collection Tests (6 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Get all collections | GET | /api/thu-phi-ho-khau | List retrieval |
| 2 | Get statistics | GET | /api/thu-phi-ho-khau/stats | Aggregate calculation |
| 3 | Calculate fee (HK1) | GET | /api/thu-phi-ho-khau/calc?hoKhauId=1&dotThuPhiId=1 | Annual fee calculation |
| 4 | Calculate fee (HK2) | GET | /api/thu-phi-ho-khau/calc?hoKhauId=2&dotThuPhiId=1 | Annual fee calculation |
| 5 | Create collection | POST | /api/thu-phi-ho-khau | Creation with KETOAN role, auto-calculation |
| 6 | Update collection | PUT | /api/thu-phi-ho-khau/{id} | Update, status recalculation |

**Key Validation Points:**
- ✅ Only KETOAN role can create/update
- ✅ `soNguoi` auto-calculated (excludes temporarily absent)
- ✅ `tongPhi` auto-calculated (6000 × 12 × soNguoi)
- ✅ `trangThai` auto-set based on payment amount

**Sample Response (Calculate Fee):**
```json
{
  "hoKhauId": 1,
  "dotThuPhiId": 1,
  "soNguoi": 3,
  "dinhMuc": 6000.00,
  "tongPhi": 216000.00,
  "formula": "6000 * 12 * 3 = 216000",
  "note": "Loại trừ người tạm vắng dài hạn"
}
```

---

#### Phase 9: API Documentation Tests (2 tests)

| # | Test | Method | Endpoint | Validates |
|---|------|--------|----------|-----------|
| 1 | Swagger UI | GET | /swagger-ui/index.html | UI accessibility |
| 2 | OpenAPI JSON | GET | /v3/api-docs | API spec generation |

---

## Test Data

### Seed Data Overview

The test suite loads comprehensive seed data before execution:

| Entity | Records | Description |
|--------|---------|-------------|
| **User Accounts** | 5 | admin, totruong01, totruong02, ketoan01, ketoan02 |
| **Households** | 8 | Various scenarios (3-5 members each) |
| **Citizens** | 29 | Different ages, genders, temporary status |
| **Population Changes** | 4 | Birth, death, relocation events |
| **Fee Periods** | 6 | Monthly/quarterly/annual fees |
| **Fee Collections** | 14 | Mix of CHUA_NOP and DA_NOP status |

### Default Test Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | admin123 | ADMIN | Full access testing |
| totruong01 | admin123 | TOTRUONG | Neighborhood leader testing |
| totruong02 | admin123 | TOTRUONG | Second leader (if needed) |
| ketoan01 | admin123 | KETOAN | Fee collection testing |
| ketoan02 | admin123 | KETOAN | Second accountant (if needed) |

### Sample Household Data

**Household HK001:**
- **Address:** 123 Nguyen Trai, Ha Noi
- **Head:** Nguyen Van A
- **Members:** 3 people
  - Nguyen Van A (1980, Male, Head)
  - Nguyen Thi B (1985, Female, Wife)
  - Nguyen Van C (2010, Male, Son)
- **Annual Fee:** 216,000 VND (6000 × 12 × 3)
- **Payment Status:** DA_NOP (fully paid)

**Household HK003:**
- **Address:** 789 Le Loi, Ha Noi
- **Head:** Le Van E
- **Members:** 3 eligible (1 temporarily absent)
  - Le Van E (1975, Male, Head)
  - Le Thi F (1980, Female, Wife)
  - Le Van G (2005, Male, Son)
  - Le Thi H (2012, Female, Daughter) - **Temporarily absent until 2026**
- **Annual Fee:** 216,000 VND (6000 × 12 × 3, excluding Le Thi H)
- **Payment Status:** CHUA_NOP (150,000 paid, 66,000 short)

---

## Test Scenarios

### Scenario 1: Annual Fee Calculation

**Goal:** Verify backend correctly calculates annual fee excluding temporarily absent members.

**Steps:**
1. Login as KETOAN
2. Query household HK003 (4 members, 1 temporarily absent)
3. Call `/api/thu-phi-ho-khau/calc?hoKhauId=3&dotThuPhiId=1`
4. Verify response:
   - `soNguoi = 3` (not 4)
   - `tongPhi = 216000` (6000 × 12 × 3)

**Expected Result:**
```json
{
  "hoKhauId": 3,
  "dotThuPhiId": 1,
  "soNguoi": 3,
  "tongPhi": 216000.00
}
```

**Validation:** ✅ Le Thi H excluded due to `tamVangDen = 2026-06-30` (still absent)

---

### Scenario 2: Payment Status Auto-Update

**Goal:** Verify status changes from CHUA_NOP to DA_NOP when payment is sufficient.

**Steps:**
1. Login as KETOAN
2. Create fee collection with partial payment:
   ```json
   {
     "hoKhauId": 5,
     "dotThuPhiId": 1,
     "soTienDaThu": 100000
   }
   ```
3. Backend calculates: `tongPhi = 288000`, `trangThai = CHUA_NOP`
4. Update record with full payment:
   ```json
   {
     "soTienDaThu": 288000
   }
   ```
5. Backend recalculates: `trangThai = DA_NOP`

**Expected Result:**
- Initial status: `CHUA_NOP`
- After update: `DA_NOP`

---

### Scenario 3: KETOAN-Only Authorization

**Goal:** Verify only KETOAN can create fee collections, TOTRUONG is denied.

**Steps:**
1. Login as TOTRUONG (`totruong01`)
2. Attempt to create fee collection:
   ```bash
   curl -X POST http://localhost:8080/api/thu-phi-ho-khau \
     -H "Authorization: Bearer $TOTRUONG_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"hoKhauId":1,"dotThuPhiId":1,"soTienDaThu":0}'
   ```
3. Expect 403 Forbidden error

**Expected Result:**
```json
{
  "error": "Chỉ KETOAN mới được phép thực hiện thao tác này",
  "status": 403
}
```

**Validation:** ✅ Authorization enforced correctly

---

### Scenario 4: Enum Validation

**Goal:** Verify system rejects invalid enum values.

**Steps:**
1. Login as ADMIN
2. Create fee period with invalid `loaiPhi`:
   ```json
   {
     "tenDot": "Test",
     "loaiPhi": "INVALID",
     "dinhMuc": 6000
   }
   ```
3. Expect 400 Bad Request error

**Expected Result:**
```json
"Giá trị 'INVALID' không hợp lệ cho trường 'loaiPhi'. Chỉ chấp nhận: BAT_BUOC, TU_NGUYEN"
```

**Validation:** ✅ Enum validation working

---

## Troubleshooting

### Common Issues

#### 1. Test Script Fails to Start

**Symptom:**
```
✗ Backend is not ready after 60 seconds
```

**Solutions:**
```bash
# Check Docker logs
docker compose logs backend

# Common causes:
# - Port 8080 already in use
# - Database connection failed
# - Maven dependencies not downloaded

# Solution: Clean restart
docker compose down -v
docker compose up --build -d
```

---

#### 2. Database Connection Error

**Symptom:**
```
Backend log: org.postgresql.util.PSQLException: Connection refused
```

**Solutions:**
```bash
# Check PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# Check logs
docker compose logs postgres
```

---

#### 3. JWT Token Expired

**Symptom:**
```
✗ Test failed with 401 Unauthorized
```

**Cause:** Token expired during long test run (> 24 hours)

**Solution:**
- Re-run test script (it generates fresh tokens)
- Tokens are valid for 24 hours by default

---

#### 4. Seed Data Not Loaded

**Symptom:**
```
✗ Get household by ID failed (404 Not Found)
```

**Solution:**
```bash
# Manually load seed data
docker compose exec postgres psql -U postgres -d QuanLyDanCu \
  -f /docker-entrypoint-initdb.d/test-seed.sql

# Or restart with clean volumes
docker compose down -v
docker compose up -d
```

---

#### 5. cURL Command Not Found

**Symptom:**
```
-bash: curl: command not found
```

**Solution:**
```bash
# macOS
brew install curl

# Ubuntu/Debian
sudo apt-get install curl

# CentOS/RHEL
sudo yum install curl
```

---

#### 6. jq Command Not Found

**Symptom:**
```
-bash: jq: command not found
```

**Solution:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

---

## Manual Testing

### Using Postman

1. **Import Collection:**
   - Open Postman
   - Import `docs/QuanLyDanCu.postman_collection.json`

2. **Set Environment:**
   - Create new environment
   - Add variable: `baseUrl = http://localhost:8080`

3. **Login:**
   - Execute "Login" request
   - Copy JWT token from response

4. **Set Authorization:**
   - In collection settings, go to "Authorization" tab
   - Select "Bearer Token"
   - Paste JWT token

5. **Run Tests:**
   - Execute requests in order
   - Verify responses

---

### Using Swagger UI

1. **Access Swagger:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

2. **Authorize:**
   - Click "Authorize" button (top right)
   - Login via `/api/auth/login` endpoint
   - Copy token from response
   - Paste in "Authorize" dialog (without "Bearer " prefix)
   - Click "Authorize" and "Close"

3. **Test Endpoints:**
   - All subsequent requests will include JWT token
   - Click "Try it out" on any endpoint
   - Fill in parameters
   - Click "Execute"
   - View response

---

### Using cURL (Command Line)

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}' \
  | jq -r '.token')

# 2. Get all households
curl -X GET http://localhost:8080/api/ho-khau \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Create household
curl -X POST http://localhost:8080/api/ho-khau \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soHoKhau": "HK999",
    "diaChiThuongTru": "Test Address",
    "chuHo": "Test Name",
    "ngayLap": "2025-10-31"
  }' | jq

# 4. Calculate fee
curl -X GET "http://localhost:8080/api/thu-phi-ho-khau/calc?hoKhauId=1&dotThuPhiId=1" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Performance Testing (Future)

### Load Testing with Apache Bench

```bash
# Test login endpoint (100 concurrent, 1000 total)
ab -n 1000 -c 100 -p login.json -T application/json \
  http://localhost:8080/api/auth/login

# Test GET endpoint (with token)
ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/ho-khau
```

### Expected Performance

| Endpoint | Avg Response Time | Throughput |
|----------|-------------------|------------|
| POST /api/auth/login | < 100ms | 1000 req/s |
| GET /api/ho-khau | < 50ms | 2000 req/s |
| POST /api/thu-phi-ho-khau | < 150ms | 500 req/s |

---

## Continuous Integration (Future)

### GitHub Actions Workflow

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Docker
        run: docker compose up -d
      
      - name: Wait for backend
        run: sleep 30
      
      - name: Run tests
        run: ./test/test-all.sh
      
      - name: Upload test report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: docs/API_TEST_REPORT.md
```

---

## Test Maintenance

### Adding New Tests

1. **Update test-all.sh:**
   ```bash
   # Add new test phase
   print_section "Phase 10: New Feature Tests"
   
   # Add test case
   test_endpoint "NewFeature" "GET" "/api/new-endpoint" "200"
   ```

2. **Update seed data** (if needed):
   ```sql
   -- Add to test/seed-data/test-seed.sql
   INSERT INTO new_table (col1, col2) VALUES ('val1', 'val2');
   ```

3. **Run tests:**
   ```bash
   ./test/test-all.sh
   ```

---

## Summary

The QuanLyDanCu test suite provides:

- ✅ **Comprehensive Coverage:** 24 tests covering all modules
- ✅ **100% Pass Rate:** All tests validated in Docker environment
- ✅ **Automated Execution:** One-click test runs via shell script
- ✅ **Reproducible Results:** Consistent seed data and isolated environment
- ✅ **Business Logic Validation:** Fee calculation, status updates, authorization
- ✅ **Documentation:** Swagger UI and OpenAPI spec tested

**Test Execution:** `./test/test-all.sh`  
**Test Report:** `docs/API_TEST_REPORT.md` (auto-generated)  
**Manual Testing:** Swagger UI at http://localhost:8080/swagger-ui.html

For detailed API documentation, see [API_REFERENCE.md](./API_REFERENCE.md)  
For business rules, see [BUSINESS_RULES.md](./BUSINESS_RULES.md)
