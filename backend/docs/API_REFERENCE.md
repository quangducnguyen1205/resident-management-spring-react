# API Reference - QuanLyDanCu Backend v1.1

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Common Response Codes](#common-response-codes)
5. [Authentication APIs](#authentication-apis)
6. [Household (Hộ Khẩu) APIs](#household-hộ-khẩu-apis)
7. [Citizen (Nhân Khẩu) APIs](#citizen-nhân-khẩu-apis)
8. [Population Change (Biến Động) APIs](#population-change-biến-động-apis)
9. [Fee Period (Đợt Thu Phí) APIs](#fee-period-đợt-thu-phí-apis)
10. [Fee Collection (Thu Phí Hộ Khẩu) APIs](#fee-collection-thu-phí-hộ-khẩu-apis)

---

## Overview

This document provides a complete reference for all REST API endpoints in the QuanLyDanCu backend system. All endpoints (except authentication) require JWT authentication via the `Authorization` header.

### API Version
**Current Version:** v1.1  
**Last Updated:** October 31, 2025

---

## Base URL

```
http://localhost:8080
```

For production, replace with your actual domain.

---

## Authentication

### JWT Token Format

Include JWT token in request headers:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- Default: **24 hours** (86400000 ms)
- After expiration, user must login again

---

## Common Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded, no response body |
| 400 | Bad Request | Invalid input data or validation failed |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required role/permission |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Authentication APIs

### 1. Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Required Role:** None (Public)

**Request Body:**
```json
{
  "tenDangNhap": "newuser",
  "matKhau": "password123",
  "vaiTro": "ADMIN",
  "hoTen": "Nguyen Van A"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| tenDangNhap | String | ✅ | 3-50 characters, unique |
| matKhau | String | ✅ | Minimum 6 characters |
| vaiTro | String | ✅ | Must be: ADMIN, TOTRUONG, or KETOAN |
| hoTen | String | ✅ | 1-100 characters |

**Success Response (201):**
```json
"Đăng ký thành công"
```

**Error Response (400):**
```json
{
  "tenDangNhap": "Tên đăng nhập đã tồn tại"
}
```

---

### 2. Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Required Role:** None (Public)

**Request Body:**
```json
{
  "tenDangNhap": "admin",
  "matKhau": "admin123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY5ODcxMDQwMCwiZXhwIjoxNjk4Nzk2ODAwfQ.signature",
  "username": "admin",
  "role": "ADMIN"
}
```

**Error Response (400):**
```json
"Sai tên đăng nhập hoặc mật khẩu"
```

**Usage Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}'
```

---

## Household (Hộ Khẩu) APIs

### 1. Get All Households

Retrieve all households in the system.

**Endpoint:** `GET /api/ho-khau`

**Required Role:** Any authenticated user

**Request Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "soHoKhau": "HK001",
    "diaChiThuongTru": "123 Nguyen Trai, Ha Noi",
    "chuHo": "Nguyen Van A",
    "ngayLap": "2020-01-15",
    "ngayHuy": null,
    "ghiChu": "Hộ khẩu thường trú",
    "createdAt": "2025-01-01T08:00:00",
    "createdBy": 1
  }
]
```

---

### 2. Get Household by ID

Retrieve a specific household.

**Endpoint:** `GET /api/ho-khau/{id}`

**Required Role:** Any authenticated user

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Household ID |

**Success Response (200):**
```json
{
  "id": 1,
  "soHoKhau": "HK001",
  "diaChiThuongTru": "123 Nguyen Trai, Ha Noi",
  "chuHo": "Nguyen Van A",
  "ngayLap": "2020-01-15",
  "ngayHuy": null,
  "ghiChu": "Hộ khẩu thường trú",
  "createdAt": "2025-01-01T08:00:00",
  "createdBy": 1
}
```

**Error Response (404):**
```json
"Không tìm thấy hộ khẩu với ID: 99"
```

---

### 3. Create Household

Create a new household registration.

**Endpoint:** `POST /api/ho-khau`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "soHoKhau": "HK009",
  "diaChiThuongTru": "456 Le Loi, Ha Noi",
  "chuHo": "Tran Thi B",
  "ngayLap": "2025-10-31",
  "ghiChu": "Hộ khẩu mới đăng ký"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| soHoKhau | String | ✅ | Max 50 characters, unique |
| diaChiThuongTru | String | ✅ | Max 255 characters |
| chuHo | String | ✅ | Max 100 characters |
| ngayLap | Date | ✅ | Format: YYYY-MM-DD |
| ngayHuy | Date | ❌ | Format: YYYY-MM-DD |
| ghiChu | String | ❌ | Max 500 characters |

**Success Response (201):**
```json
{
  "id": 9,
  "soHoKhau": "HK009",
  "diaChiThuongTru": "456 Le Loi, Ha Noi",
  "chuHo": "Tran Thi B",
  "ngayLap": "2025-10-31",
  "ngayHuy": null,
  "ghiChu": "Hộ khẩu mới đăng ký",
  "createdAt": "2025-10-31T10:15:30",
  "createdBy": 2
}
```

**Error Response (403):**
```json
"Chỉ ADMIN hoặc TOTRUONG mới có quyền tạo hộ khẩu"
```

---

### 4. Update Household

Update existing household information.

**Endpoint:** `PUT /api/ho-khau/{id}`

**Required Role:** ADMIN or TOTRUONG

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Household ID to update |

**Request Body:** Same as Create Household

**Success Response (200):**
```json
{
  "id": 9,
  "soHoKhau": "HK009",
  "diaChiThuongTru": "789 Tran Hung Dao, Ha Noi",
  "chuHo": "Tran Thi B",
  "ngayLap": "2025-10-31",
  "ngayHuy": null,
  "ghiChu": "Đã cập nhật địa chỉ",
  "createdAt": "2025-10-31T10:15:30",
  "createdBy": 2
}
```

---

### 5. Delete Household

Delete a household record.

**Endpoint:** `DELETE /api/ho-khau/{id}`

**Required Role:** ADMIN or TOTRUONG

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Household ID to delete |

**Success Response (204):** No content

**Note:** This will also delete all associated citizens (cascade delete).

---

## Citizen (Nhân Khẩu) APIs

### 1. Get All Citizens

Retrieve all citizens with pagination support.

**Endpoint:** `GET /api/nhan-khau`

**Required Role:** Any authenticated user

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Integer | ❌ | 0 | Page number (0-indexed) |
| size | Integer | ❌ | 20 | Records per page |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "hoKhauId": 1,
    "hoTen": "Nguyen Van A",
    "ngaySinh": "1980-05-15",
    "gioiTinh": "Nam",
    "cccd": "001080012345",
    "quanHeChuHo": "Chủ hộ",
    "tamTruTu": null,
    "tamTruDen": null,
    "tamVangTu": null,
    "tamVangDen": null,
    "createdAt": "2025-01-01T08:00:00",
    "createdBy": 1
  }
]
```

---

### 2. Get Citizen by ID

Retrieve a specific citizen.

**Endpoint:** `GET /api/nhan-khau/{id}`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "id": 1,
  "hoKhauId": 1,
  "hoTen": "Nguyen Van A",
  "ngaySinh": "1980-05-15",
  "gioiTinh": "Nam",
  "cccd": "001080012345",
  "quanHeChuHo": "Chủ hộ",
  "tamTruTu": null,
  "tamTruDen": null,
  "tamVangTu": null,
  "tamVangDen": null,
  "createdAt": "2025-01-01T08:00:00",
  "createdBy": 1
}
```

---

### 3. Create Citizen

Add a new citizen to a household.

**Endpoint:** `POST /api/nhan-khau`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "hoKhauId": 1,
  "hoTen": "Nguyen Van C",
  "ngaySinh": "2010-03-20",
  "gioiTinh": "Nam",
  "cccd": "001100012345",
  "quanHeChuHo": "Con"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| hoKhauId | Long | ✅ | Must exist |
| hoTen | String | ✅ | Max 100 characters |
| ngaySinh | Date | ✅ | Format: YYYY-MM-DD |
| gioiTinh | String | ✅ | "Nam" or "Nữ" |
| cccd | String | ❌ | 12 digits, unique |
| quanHeChuHo | String | ❌ | Max 50 characters |

**Success Response (201):**
```json
{
  "id": 30,
  "hoKhauId": 1,
  "hoTen": "Nguyen Van C",
  "ngaySinh": "2010-03-20",
  "gioiTinh": "Nam",
  "cccd": "001100012345",
  "quanHeChuHo": "Con",
  "createdAt": "2025-10-31T11:00:00",
  "createdBy": 2
}
```

---

### 4. Update Citizen

Update citizen information.

**Endpoint:** `PUT /api/nhan-khau/{id}`

**Required Role:** ADMIN or TOTRUONG

**Request Body:** Same as Create Citizen

**Success Response (200):** Same structure as Create response

---

### 5. Delete Citizen

Remove a citizen from the system.

**Endpoint:** `DELETE /api/nhan-khau/{id}`

**Required Role:** ADMIN or TOTRUONG

**Success Response (204):** No content

---

### 6. Search Citizens by Name

Search for citizens by name keyword.

**Endpoint:** `GET /api/nhan-khau/search`

**Required Role:** Any authenticated user

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | String | ✅ | Search keyword (case-insensitive) |

**Example:** `GET /api/nhan-khau/search?q=Nguyen`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "hoTen": "Nguyen Van A",
    "ngaySinh": "1980-05-15",
    "gioiTinh": "Nam"
  },
  {
    "id": 2,
    "hoTen": "Nguyen Thi B",
    "ngaySinh": "1985-08-20",
    "gioiTinh": "Nữ"
  }
]
```

---

### 7. Gender Statistics

Get statistics by gender.

**Endpoint:** `GET /api/nhan-khau/stats/gender`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "total": 100,
  "male": 52,
  "female": 48,
  "malePercentage": 52.0,
  "femalePercentage": 48.0
}
```

---

### 8. Age Statistics

Get statistics by age group.

**Endpoint:** `GET /api/nhan-khau/stats/age`

**Required Role:** Any authenticated user

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| underAge | Integer | ❌ | 18 | Age threshold for children |
| retireAge | Integer | ❌ | 60 | Age threshold for retirement |

**Example:** `GET /api/nhan-khau/stats/age?underAge=18&retireAge=60`

**Success Response (200):**
```json
{
  "total": 100,
  "children": 20,
  "working": 65,
  "retired": 15,
  "childrenPercentage": 20.0,
  "workingPercentage": 65.0,
  "retiredPercentage": 15.0
}
```

---

### 9. Register Temporary Residence (Tạm Trú)

Register temporary residence for a citizen.

**Endpoint:** `PUT /api/nhan-khau/{id}/tamtru`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "tuNgay": "2025-11-01",
  "denNgay": "2026-10-31"
}
```

**Success Response (200):** Returns updated citizen with `tamTruTu` and `tamTruDen` fields set.

---

### 10. Cancel Temporary Residence

Cancel temporary residence registration.

**Endpoint:** `DELETE /api/nhan-khau/{id}/tamtru`

**Required Role:** ADMIN or TOTRUONG

**Success Response (204):** No content

---

### 11. Register Temporary Absence (Tạm Vắng)

Register temporary absence for a citizen.

**Endpoint:** `PUT /api/nhan-khau/{id}/tamvang`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "tuNgay": "2025-11-01",
  "denNgay": "2026-10-31"
}
```

**Success Response (200):** Returns updated citizen with `tamVangTu` and `tamVangDen` fields set.

**Note:** Citizens with long-term temporary absence (`tamVangDen >= today`) are excluded from annual fee calculations.

---

### 12. Cancel Temporary Absence

Cancel temporary absence registration.

**Endpoint:** `DELETE /api/nhan-khau/{id}/tamvang`

**Required Role:** ADMIN or TOTRUONG

**Success Response (204):** No content

---

### 13. Death Registration (Khai Tử)

Register a citizen's death.

**Endpoint:** `PUT /api/nhan-khau/{id}/khaitu`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "lyDo": "Bệnh tật"
}
```

**Success Response (200):** Returns updated citizen record (implementation-specific).

---

## Population Change (Biến Động) APIs

### 1. Get All Population Changes

Retrieve all population change records.

**Endpoint:** `GET /api/bien-dong`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
[
  {
    "id": 1,
    "nhanKhauId": 1,
    "loaiBienDong": "SINH",
    "ngayBienDong": "2025-01-15",
    "ghiChu": "Sinh con trai",
    "createdAt": "2025-01-16T09:00:00",
    "createdBy": 2
  }
]
```

**Population Change Types (loaiBienDong):**
- `SINH` - Birth
- `TU_VONG` - Death
- `DI_CU_DI` - Move out
- `DI_CU_DEN` - Move in
- `CHUYEN_DI` - Relocation
- `TAM_TRU` - Temporary residence
- `TAM_VANG` - Temporary absence

---

### 2. Get Population Change by ID

Retrieve a specific change record.

**Endpoint:** `GET /api/bien-dong/{id}`

**Required Role:** Any authenticated user

**Success Response (200):** Same structure as list item

---

### 3. Create Population Change

Record a new population change event.

**Endpoint:** `POST /api/bien-dong`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "nhanKhauId": 1,
  "loaiBienDong": "SINH",
  "ngayBienDong": "2025-10-31",
  "ghiChu": "Sinh con gái"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| nhanKhauId | Long | ✅ | Must exist |
| loaiBienDong | String | ✅ | Valid type (see above) |
| ngayBienDong | Date | ✅ | Format: YYYY-MM-DD |
| ghiChu | String | ❌ | Max 500 characters |

**Success Response (201):**
```json
{
  "id": 5,
  "nhanKhauId": 1,
  "loaiBienDong": "SINH",
  "ngayBienDong": "2025-10-31",
  "ghiChu": "Sinh con gái",
  "createdAt": "2025-10-31T11:30:00",
  "createdBy": 2
}
```

---

### 4. Update Population Change

Update an existing change record.

**Endpoint:** `PUT /api/bien-dong/{id}`

**Required Role:** ADMIN or TOTRUONG

**Request Body:** Same as Create

**Success Response (200):** Same structure as Create response

---

### 5. Delete Population Change

Remove a population change record.

**Endpoint:** `DELETE /api/bien-dong/{id}`

**Required Role:** ADMIN or TOTRUONG

**Success Response (204):** No content

---

## Fee Period (Đợt Thu Phí) APIs

### 1. Get All Fee Periods

Retrieve all fee collection periods.

**Endpoint:** `GET /api/dot-thu-phi`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
[
  {
    "id": 1,
    "tenDot": "Phí vệ sinh năm 2025",
    "loaiPhi": "BAT_BUOC",
    "dinhMuc": 6000.00,
    "ngayBatDau": "2025-01-01",
    "ngayKetThuc": "2025-12-31",
    "ghiChu": "Thu phí hàng năm",
    "createdAt": "2024-12-01T10:00:00",
    "createdBy": 1
  }
]
```

**Fee Types (loaiPhi):**
- `BAT_BUOC` - Mandatory fee (e.g., sanitation)
- `TU_NGUYEN` - Voluntary contribution

---

### 2. Get Fee Period by ID

Retrieve a specific fee period.

**Endpoint:** `GET /api/dot-thu-phi/{id}`

**Required Role:** Any authenticated user

**Success Response (200):** Same structure as list item

---

### 3. Create Fee Period

Create a new fee collection period.

**Endpoint:** `POST /api/dot-thu-phi`

**Required Role:** ADMIN or TOTRUONG

**Request Body:**
```json
{
  "tenDot": "Phí vệ sinh năm 2026",
  "loaiPhi": "BAT_BUOC",
  "dinhMuc": 6500.00,
  "ngayBatDau": "2026-01-01",
  "ngayKetThuc": "2026-12-31",
  "ghiChu": "Tăng 500 VND so với năm trước"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| tenDot | String | ✅ | Max 100 characters |
| loaiPhi | String | ✅ | BAT_BUOC or TU_NGUYEN |
| dinhMuc | Decimal | ✅ | Must be > 0 |
| ngayBatDau | Date | ✅ | Format: YYYY-MM-DD |
| ngayKetThuc | Date | ✅ | Format: YYYY-MM-DD, must be after ngayBatDau |
| ghiChu | String | ❌ | Max 500 characters |

**Success Response (201):**
```json
{
  "id": 7,
  "tenDot": "Phí vệ sinh năm 2026",
  "loaiPhi": "BAT_BUOC",
  "dinhMuc": 6500.00,
  "ngayBatDau": "2026-01-01",
  "ngayKetThuc": "2026-12-31",
  "ghiChu": "Tăng 500 VND so với năm trước",
  "createdAt": "2025-10-31T12:00:00",
  "createdBy": 1
}
```

---

### 4. Update Fee Period

Update an existing fee period.

**Endpoint:** `PUT /api/dot-thu-phi/{id}`

**Required Role:** ADMIN or TOTRUONG

**Request Body:** Same as Create

**Success Response (200):** Same structure as Create response

---

### 5. Delete Fee Period

Remove a fee period.

**Endpoint:** `DELETE /api/dot-thu-phi/{id}`

**Required Role:** ADMIN or TOTRUONG

**Success Response (200):**
```json
"Đã xóa đợt thu phí id = 7"
```

**Note:** Cannot delete if there are associated fee collection records.

---

## Fee Collection (Thu Phí Hộ Khẩu) APIs

### 1. Get All Fee Collections

Retrieve all fee collection records.

**Endpoint:** `GET /api/thu-phi-ho-khau`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
[
  {
    "id": 1,
    "hoKhauId": 1,
    "dotThuPhiId": 1,
    "soNguoi": 3,
    "tongPhi": 216000.00,
    "soTienDaThu": 216000.00,
    "trangThai": "DA_NOP",
    "periodDescription": "Cả năm 2025",
    "ngayThu": "2025-01-15",
    "ghiChu": "Phí vệ sinh năm 2025",
    "createdAt": "2025-01-16T08:00:00",
    "createdBy": 4
  }
]
```

**Payment Status (trangThai):**
- `CHUA_NOP` - Not paid (or partially paid)
- `DA_NOP` - Fully paid

---

### 2. Get Fee Collection by ID

Retrieve a specific fee collection record.

**Endpoint:** `GET /api/thu-phi-ho-khau/{id}`

**Required Role:** Any authenticated user

**Success Response (200):** Same structure as list item

---

### 3. Get Collections by Household

Get all fee collection records for a specific household.

**Endpoint:** `GET /api/thu-phi-ho-khau/ho-khau/{hoKhauId}`

**Required Role:** Any authenticated user

**Success Response (200):** Array of fee collection records

---

### 4. Get Collections by Fee Period

Get all fee collection records for a specific fee period.

**Endpoint:** `GET /api/thu-phi-ho-khau/dot-thu-phi/{dotThuPhiId}`

**Required Role:** Any authenticated user

**Success Response (200):** Array of fee collection records

---

### 5. Get Fee Collection Statistics

Get aggregate statistics for fee collections.

**Endpoint:** `GET /api/thu-phi-ho-khau/stats`

**Required Role:** Any authenticated user

**Success Response (200):**
```json
{
  "totalRecords": 14,
  "totalCollected": 2520000.00,
  "totalRequired": 2808000.00,
  "paidCount": 8,
  "unpaidCount": 6,
  "collectionRate": 89.74
}
```

---

### 6. Calculate Fee for Household

Calculate the annual fee for a specific household in a fee period.

**Endpoint:** `GET /api/thu-phi-ho-khau/calc`

**Required Role:** Any authenticated user

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hoKhauId | Long | ✅ | Household ID |
| dotThuPhiId | Long | ✅ | Fee period ID |

**Example:** `GET /api/thu-phi-ho-khau/calc?hoKhauId=1&dotThuPhiId=1`

**Success Response (200):**
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

**Calculation Formula:**
```
Annual Fee = Base Rate × 12 months × Eligible People

Where:
- Base Rate (dinhMuc): e.g., 6000 VND/person/month
- Eligible People: Household members NOT in long-term temporary absence
  (tamVangDen is NULL or < today)
```

---

### 7. Create Fee Collection

Create a new fee collection record.

**Endpoint:** `POST /api/thu-phi-ho-khau`

**Required Role:** KETOAN only

**Request Body:**
```json
{
  "hoKhauId": 1,
  "dotThuPhiId": 1,
  "soTienDaThu": 216000,
  "periodDescription": "Cả năm 2025",
  "ngayThu": "2025-01-15",
  "ghiChu": "Nộp đầy đủ"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| hoKhauId | Long | ✅ | Must exist |
| dotThuPhiId | Long | ✅ | Must exist |
| soTienDaThu | Decimal | ✅ | Must be ≥ 0 |
| periodDescription | String | ❌ | Max 100 characters |
| ngayThu | Date | ✅ | Format: YYYY-MM-DD |
| ghiChu | String | ❌ | Max 500 characters |

**Auto-Calculated Fields:**
- `soNguoi` - Number of eligible people (excludes temporarily absent)
- `tongPhi` - Total annual fee (6000 × 12 × soNguoi)
- `trangThai` - Payment status:
  - `DA_NOP` if `soTienDaThu >= tongPhi`
  - `CHUA_NOP` if `soTienDaThu < tongPhi`

**Success Response (201):**
```json
{
  "id": 15,
  "hoKhauId": 1,
  "dotThuPhiId": 1,
  "soNguoi": 3,
  "tongPhi": 216000.00,
  "soTienDaThu": 216000.00,
  "trangThai": "DA_NOP",
  "periodDescription": "Cả năm 2025",
  "ngayThu": "2025-01-15",
  "ghiChu": "Nộp đầy đủ",
  "createdAt": "2025-10-31T13:00:00",
  "createdBy": 4
}
```

**Error Response (403):**
```json
"Chỉ KETOAN mới được phép thực hiện thao tác này"
```

---

### 8. Update Fee Collection

Update an existing fee collection record.

**Endpoint:** `PUT /api/thu-phi-ho-khau/{id}`

**Required Role:** KETOAN only

**Request Body:** Same as Create

**Success Response (200):** Same structure as Create response

**Note:** `soNguoi`, `tongPhi`, and `trangThai` are recalculated automatically on update.

---

### 9. Delete Fee Collection

Remove a fee collection record.

**Endpoint:** `DELETE /api/thu-phi-ho-khau/{id}`

**Required Role:** KETOAN only

**Success Response (200):**
```json
"Đã xóa thu phí id = 15"
```

---

## Error Handling

### Validation Errors (400)

When request validation fails, the API returns field-level error messages:

```json
{
  "tenDot": "Tên đợt không được để trống",
  "dinhMuc": "Định mức phải lớn hơn 0",
  "ngayBatDau": "Ngày bắt đầu không được để trống"
}
```

### Enum Value Errors (400)

When an invalid enum value is provided:

```json
"Giá trị 'INVALID' không hợp lệ cho trường 'loaiPhi'. Chỉ chấp nhận: BAT_BUOC, TU_NGUYEN"
```

### Authentication Errors (401)

When JWT token is missing or invalid:

```json
"Unauthorized: JWT token is missing or invalid"
```

### Authorization Errors (403)

When user lacks required role:

```json
"Chỉ KETOAN mới được phép thực hiện thao tác này"
```

### Not Found Errors (404)

When resource doesn't exist:

```json
"Không tìm thấy hộ khẩu với ID: 99"
```

---

## Rate Limiting (Future Enhancement)

Currently, there is no rate limiting implemented. For production, consider:

- **Per User:** 100 requests/minute
- **Per IP:** 1000 requests/hour
- **Global:** 10,000 requests/minute

---

## API Testing

### Using Postman

1. Import the provided collection: `docs/QuanLyDanCu.postman_collection.json`
2. Set environment variable `{{baseUrl}}` = `http://localhost:8080`
3. Login to get JWT token
4. Set token in Authorization header for subsequent requests

### Using cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}' \
  | jq -r '.token')

# 2. Use token in requests
curl -X GET http://localhost:8080/api/ho-khau \
  -H "Authorization: Bearer $TOKEN"
```

### Using Swagger UI

1. Open http://localhost:8080/swagger-ui.html
2. Click "Authorize" button
3. Paste JWT token (without "Bearer " prefix)
4. Test endpoints interactively

---

## Pagination (Future Enhancement)

Currently, most endpoints return all records. For production, implement pagination:

**Request:**
```
GET /api/nhan-khau?page=0&size=20&sort=hoTen,asc
```

**Response:**
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0
}
```

---

## Changelog

### v1.1 (October 2025)
- ✅ Added annual fee calculation endpoint (`/calc`)
- ✅ Auto-calculation of `soNguoi`, `tongPhi`, `trangThai`
- ✅ Temporary absence exclusion in fee calculation
- ✅ KETOAN-only authorization for fee management
- ✅ Added `periodDescription` field
- ✅ Removed deprecated `months` field

### v1.0
- Initial release with core CRUD operations
- JWT authentication and authorization
- Basic fee collection without auto-calculation

---

## Support

For API issues or questions:
- Check interactive documentation: http://localhost:8080/swagger-ui.html
- Review business rules: [BUSINESS_RULES.md](./BUSINESS_RULES.md)
- Test with provided Postman collection

**Base URL:** http://localhost:8080  
**Swagger UI:** http://localhost:8080/swagger-ui.html  
**OpenAPI JSON:** http://localhost:8080/v3/api-docs
