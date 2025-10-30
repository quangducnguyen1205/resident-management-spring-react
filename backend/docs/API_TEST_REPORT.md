# API Integration Test Report

**Generated:** 2025-10-29 12:33:31  
**Test Suite Version:** 4.0.0  
**Total Tests:** 26  
**Passed:** 26 ✅  
**Failed:** 0 ❌  
**Success Rate:** 100.00%

---

## Test Results

| Status | Module | Endpoint | HTTP Code | Description |
|--------|--------|----------|-----------|-------------|
| ✅ PASS | Auth | POST /api/auth/login | 200 |
| ✅ PASS | Auth  |  POST /api/auth/register | 201 |
| ✅ PASS | HoKhau  |  GET /api/ho-khau | 200 |
| ✅ PASS | HoKhau  |  GET /api/ho-khau/1 | 200 |
| ✅ PASS | HoKhau  |  POST /api/ho-khau | 201 |
| ✅ PASS | HoKhau  |  PUT /api/ho-khau/14 | 200 |
| ✅ PASS | NhanKhau  |  GET /api/nhan-khau?page=0&size=10 | 200 |
| ✅ PASS | NhanKhau  |  GET /api/nhan-khau/search?q=Nguyen | 200 |
| ✅ PASS | NhanKhau  |  GET /api/nhan-khau/stats/gender | 200 |
| ✅ PASS | NhanKhau  |  GET /api/nhan-khau/stats/age?underAge=18&retireAge=60 | 200 |
| ✅ PASS | NhanKhau  |  POST /api/nhan-khau | 201 |
| ✅ PASS | BienDong  |  GET /api/bien-dong | 200 |
| ✅ PASS | BienDong  |  POST /api/bien-dong | 201 |
| ✅ PASS | BienDong  |  GET /api/bien-dong/11 | 200 |
| ✅ PASS | DotThuPhi  |  GET /api/dot-thu-phi | 200 |
| ✅ PASS | DotThuPhi  |  POST /api/dot-thu-phi | 201 |
| ✅ PASS | DotThuPhi  |  GET /api/dot-thu-phi/12 | 200 |
| ✅ PASS | DotThuPhi  |  PUT /api/dot-thu-phi/12 | 200 |
| ✅ PASS | ThuPhiHoKhau  |  GET /api/thu-phi-ho-khau | 200 |
| ✅ PASS | ThuPhiHoKhau  |  GET /api/thu-phi-ho-khau/stats | 200 |
| ✅ PASS | ThuPhiHoKhau  |  GET /api/thu-phi-ho-khau/calc?hoKhauId=1&dotThuPhiId=2 | 200 |
| ✅ PASS | ThuPhiHoKhau  |  GET /api/thu-phi-ho-khau/calc?hoKhauId=4&dotThuPhiId=2 | 200 |
| ✅ PASS | ThuPhiHoKhau  |  POST /api/thu-phi-ho-khau | 201 |
| ✅ PASS | ThuPhiHoKhau  |  GET /api/thu-phi-ho-khau/4 | 200 |
| ✅ PASS | Swagger  |  GET /swagger-ui/index.html | 200 |
| ✅ PASS | OpenAPI  |  GET /v3/api-docs | 200 |

---

## Test Environment

- **Backend URL:** http://localhost:8080
- **Database:** PostgreSQL 15 (Docker)
- **Seed Data:** Loaded from `test/seed-data/test-seed.sql`
- **Docker Containers:** 
  - `quanlydancu-postgres` (PostgreSQL)
  - `quanlydancu-backend` (Spring Boot)

---

## Summary

🎉 **All tests passed!** The system is stable and ready for production.

---

**Report Location:** `./test/../docs/API_TEST_REPORT.md`
