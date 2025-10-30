# Business Rules - QuanLyDanCu Backend v1.1

## Table of Contents

1. [Overview](#overview)
2. [Fee Collection Business Rules](#fee-collection-business-rules)
3. [Population Management Rules](#population-management-rules)
4. [Authorization Rules](#authorization-rules)
5. [Validation Rules](#validation-rules)
6. [Data Integrity Rules](#data-integrity-rules)

---

## Overview

This document defines the core business logic implemented in the QuanLyDanCu backend system. These rules govern how the system calculates fees, manages population data, and enforces access control.

---

## Fee Collection Business Rules

### 1. Annual Sanitation Fee Calculation

**Context:** The primary fee type is **mandatory sanitation fee** (`BAT_BUOC`), collected annually from each household.

#### 1.1 Calculation Formula

```
Annual Fee = Base Rate × 12 months × Number of Eligible People

Where:
- Base Rate (định mức): Set in fee period (e.g., 6000 VND/person/month)
- Number of Eligible People: Household members NOT in long-term temporary absence
```

#### 1.2 Example Calculation

**Scenario:**
- Household: HK001
- Fee Period: "Phí vệ sinh năm 2025"
- Base Rate: 6,000 VND/person/month
- Household members: 4 people
  - Person A: Permanent resident
  - Person B: Permanent resident
  - Person C: Temporary absence until 2024-12-31 (returned)
  - Person D: Temporary absence until 2026-06-30 (still absent)

**Calculation:**
```
Eligible people = 3 (A, B, C)  // D is excluded (tamVangDen >= today)
Annual fee = 6,000 × 12 × 3 = 216,000 VND
```

**Implementation (ThuPhiHoKhauService.java):**
```java
List<NhanKhau> allMembers = nhanKhauRepo.findByHoKhauId(hoKhauId);

// Filter out people in long-term temporary absence
long eligibleCount = allMembers.stream()
    .filter(m -> m.getTamVangDen() == null || 
                 m.getTamVangDen().isBefore(LocalDate.now()))
    .count();

// Calculate annual fee
BigDecimal tongPhi = dotThuPhi.getDinhMuc()  // 6000
    .multiply(BigDecimal.valueOf(12))         // 12 months
    .multiply(BigDecimal.valueOf(eligibleCount)); // 3 people
// Result: 216,000 VND
```

---

### 2. Temporary Absence Exclusion Rule

**Rule:** Citizens registered for **long-term temporary absence** (tạm vắng) are excluded from fee calculations.

#### 2.1 Eligibility Criteria

A citizen is **excluded** from fee calculation if:
```
tamVangDen != NULL AND tamVangDen >= Current Date
```

A citizen is **included** in fee calculation if:
```
tamVangDen == NULL OR tamVangDen < Current Date
```

#### 2.2 Business Rationale

- **Temporary residence (tạm trú):** People temporarily living in the household → **INCLUDED** in fee calculation
- **Temporary absence (tạm vắng):** People temporarily away from household → **EXCLUDED** if absence extends beyond current date

#### 2.3 Example Scenarios

| Citizen | tamVangTu | tamVangDen | Current Date | Included in Fee? | Reason |
|---------|-----------|------------|--------------|------------------|--------|
| Nguyen Van A | NULL | NULL | 2025-10-31 | ✅ Yes | Permanent resident |
| Tran Thi B | 2025-01-01 | 2025-06-30 | 2025-10-31 | ✅ Yes | Absence period ended |
| Le Van C | 2025-01-01 | 2026-12-31 | 2025-10-31 | ❌ No | Still in long-term absence |
| Pham Thi D | 2025-01-01 | NULL | 2025-10-31 | ✅ Yes | No end date = returned |

---

### 3. Payment Status Auto-Update Rule

**Rule:** Payment status (`trangThai`) is automatically calculated based on payment amount vs. required amount.

#### 3.1 Status Logic

```
IF soTienDaThu >= tongPhi THEN
    trangThai = DA_NOP (Fully paid)
ELSE
    trangThai = CHUA_NOP (Not paid or partially paid)
END IF
```

#### 3.2 Example Scenarios

| tongPhi (Required) | soTienDaThu (Paid) | trangThai | Display Status |
|-------------------|-------------------|-----------|----------------|
| 216,000 | 0 | CHUA_NOP | Chưa nộp |
| 216,000 | 100,000 | CHUA_NOP | Nộp thiếu (46%) |
| 216,000 | 216,000 | DA_NOP | Đã nộp đủ |
| 216,000 | 250,000 | DA_NOP | Đã nộp thừa |

#### 3.3 Implementation

**On Create:**
```java
TrangThaiThuPhi trangThai = (dto.getSoTienDaThu()
    .compareTo(tongPhi) >= 0) 
    ? TrangThaiThuPhi.DA_NOP 
    : TrangThaiThuPhi.CHUA_NOP;
```

**On Update:**
Status is recalculated automatically when `soTienDaThu` changes.

---

### 4. Fee Period Types

#### 4.1 Mandatory Fees (BAT_BUOC)

- **Examples:** Sanitation, security, building management
- **Collection:** Annual or periodic (defined by `ngayBatDau` and `ngayKetThuc`)
- **Enforcement:** Required for all households

#### 4.2 Voluntary Contributions (TU_NGUYEN)

- **Examples:** Festival funds, charity, community improvement projects
- **Collection:** One-time or periodic
- **Enforcement:** Optional for households

#### 4.3 Period Definition

```
Fee Period = {
    tenDot: "Phí vệ sinh năm 2025",
    loaiPhi: "BAT_BUOC",
    dinhMuc: 6000.00,  // VND per person per month
    ngayBatDau: "2025-01-01",
    ngayKetThuc: "2025-12-31"
}
```

---

### 5. Multiple Payments Rule

**Rule:** A household can have multiple payment records for the same fee period (e.g., installment payments).

#### 5.1 Example: Installment Payment

**Household HK001, Fee Period 1 (216,000 VND required):**

| Payment # | Date | Amount Paid | Status | Note |
|-----------|------|-------------|--------|------|
| 1 | 2025-01-15 | 100,000 | CHUA_NOP | Partial payment |
| 2 | 2025-06-15 | 116,000 | DA_NOP | Final payment |

**Total Paid:** 216,000 VND → Status updated to `DA_NOP`

#### 5.2 Data Model Support

- Each payment record is independent (`thu_phi_ho_khau` table)
- Frontend can aggregate payments per household + period
- Backend doesn't enforce uniqueness on `(hoKhauId, dotThuPhiId)` combination

---

## Population Management Rules

### 1. Household Member Relationship

**Rule:** Each citizen (`nhan_khau`) must belong to exactly one household (`ho_khau`).

#### 1.1 Relationship Structure

```
HoKhau (1) ─────< NhanKhau (N)

Constraint: nhan_khau.ho_khau_id NOT NULL REFERENCES ho_khau(id)
Cascade: ON DELETE CASCADE (deleting household deletes all members)
```

#### 1.2 Household Head (Chủ Hộ)

- One citizen per household should have `quanHeChuHo = "Chủ hộ"`
- Field `chuHo` in `ho_khau` table stores head's name (denormalized for quick access)

---

### 2. Population Change Recording

**Rule:** All significant demographic events must be recorded in `bien_dong` table.

#### 2.1 Change Types

| Type | Vietnamese | When to Record |
|------|-----------|----------------|
| SINH | Sinh | Birth of new citizen |
| TU_VONG | Tử vong | Death of citizen |
| DI_CU_DI | Di cư đi | Citizen moves out permanently |
| DI_CU_DEN | Di cư đến | Citizen moves in permanently |
| CHUYEN_DI | Chuyển đi | Relocation within city |
| TAM_TRU | Tạm trú | Start of temporary residence |
| TAM_VANG | Tạm vắng | Start of temporary absence |

#### 2.2 Recording Rules

- **Each change event creates one `BienDong` record**
- Link to citizen: `nhanKhauId`
- Date of event: `ngayBienDong`
- Optional note: `ghiChu`

---

### 3. Temporary Residence/Absence Rules

#### 3.1 Temporary Residence (Tạm Trú)

**Purpose:** Track people temporarily living in the household (e.g., students, workers).

**Fields:**
- `tamTruTu` - Start date of temporary residence
- `tamTruDen` - End date of temporary residence

**Business Impact:**
- **Included** in household member count
- **Included** in fee calculation (if not temporarily absent)

#### 3.2 Temporary Absence (Tạm Vắng)

**Purpose:** Track people temporarily away from the household (e.g., studying abroad, working in another city).

**Fields:**
- `tamVangTu` - Start date of absence
- `tamVangDen` - End date of absence

**Business Impact:**
- **Excluded** from fee calculation if `tamVangDen >= today`
- Still counted as household member for statistical purposes

---

### 4. Death Registration (Khai Tử)

**Rule:** When a citizen dies:

1. Create `BienDong` record with type `TU_VONG`
2. Set `ngayBienDong` to death date
3. Optionally: Mark citizen record (implementation-specific)
4. **Do not delete** citizen record (maintain historical data)

---

## Authorization Rules

### 1. Role-Based Access Control (RBAC)

#### 1.1 Role Hierarchy

```
ADMIN (Administrator)
  ├── Full access to all operations
  └── Can create new user accounts

TOTRUONG (Neighborhood Leader)
  ├── Manage households, citizens, population changes
  ├── Manage fee periods
  └── Cannot manage fee collection records

KETOAN (Accountant)
  ├── Manage fee collection records only
  └── Cannot create households or citizens
```

#### 1.2 Permission Matrix

| Operation | ADMIN | TOTRUONG | KETOAN |
|-----------|-------|----------|--------|
| **User Management** |
| POST /api/auth/register | ✅ | ❌ | ❌ |
| **Household Management** |
| POST/PUT/DELETE /api/ho-khau | ✅ | ✅ | ❌ |
| GET /api/ho-khau | ✅ | ✅ | ✅ |
| **Citizen Management** |
| POST/PUT/DELETE /api/nhan-khau | ✅ | ✅ | ❌ |
| GET /api/nhan-khau | ✅ | ✅ | ✅ |
| **Population Changes** |
| POST/PUT/DELETE /api/bien-dong | ✅ | ✅ | ❌ |
| GET /api/bien-dong | ✅ | ✅ | ✅ |
| **Fee Periods** |
| POST/PUT/DELETE /api/dot-thu-phi | ✅ | ✅ | ❌ |
| GET /api/dot-thu-phi | ✅ | ✅ | ✅ |
| **Fee Collection** |
| POST/PUT/DELETE /api/thu-phi-ho-khau | ✅ | ❌ | ✅ |
| GET /api/thu-phi-ho-khau | ✅ | ✅ | ✅ |

---

### 2. KETOAN-Only Fee Management Rule

**Rule:** Only users with role `KETOAN` can create, update, or delete fee collection records.

#### 2.1 Business Rationale

- **Financial Accountability:** Restricts financial operations to trained accountants
- **Audit Trail:** Ensures all fee collections are traceable to authorized personnel
- **Separation of Duties:** Neighborhood leaders manage people/households, accountants manage finances

#### 2.2 Implementation

```java
// In ThuPhiHoKhauService
private void checkPermission(Authentication auth) {
    String role = auth.getAuthorities().iterator().next().getAuthority();
    if (!role.equals("KETOAN")) {
        throw new RuntimeException("Chỉ KETOAN mới được phép thực hiện thao tác này");
    }
}
```

#### 2.3 Error Response

When TOTRUONG attempts to create fee collection:
```json
{
  "error": "Chỉ KETOAN mới được phép thực hiện thao tác này",
  "status": 403
}
```

---

### 3. Read-Only Access for All Roles

**Rule:** All authenticated users (ADMIN, TOTRUONG, KETOAN) can **read** all data via GET endpoints.

**Rationale:** Transparency in population and financial data for all authorized personnel.

---

## Validation Rules

### 1. Input Validation

All request DTOs are validated using Jakarta Validation annotations.

#### 1.1 Common Validation Rules

| Rule | Annotation | Example |
|------|-----------|---------|
| Not Null | `@NotNull` | `@NotNull(message = "ID không được để trống")` |
| Not Blank | `@NotBlank` | `@NotBlank(message = "Tên không được để trống")` |
| Size | `@Size(min, max)` | `@Size(max = 100, message = "Tối đa 100 ký tự")` |
| Positive | `@Positive` | `@Positive(message = "Phải lớn hơn 0")` |
| Positive or Zero | `@PositiveOrZero` | `@PositiveOrZero(message = "Phải >= 0")` |

#### 1.2 Example: ThuPhiHoKhauRequestDto

```java
public class ThuPhiHoKhauRequestDto {
    @NotNull(message = "Hộ khẩu ID không được để trống")
    private Long hoKhauId;

    @NotNull(message = "Đợt thu phí ID không được để trống")
    private Long dotThuPhiId;

    @PositiveOrZero(message = "Số tiền đã thu phải >= 0")
    private BigDecimal soTienDaThu;

    @Size(max = 100, message = "Mô tả kỳ thu không quá 100 ký tự")
    private String periodDescription;

    @NotNull(message = "Ngày thu không được để trống")
    private LocalDate ngayThu;
}
```

---

### 2. Enum Validation

**Rule:** Enum fields only accept predefined values.

#### 2.1 Fee Type Enum (LoaiThuPhi)

```java
public enum LoaiThuPhi {
    BAT_BUOC,   // Mandatory
    TU_NGUYEN   // Voluntary
}
```

**Invalid Value Error:**
```json
"Giá trị 'OPTIONAL' không hợp lệ cho trường 'loaiPhi'. Chỉ chấp nhận: BAT_BUOC, TU_NGUYEN"
```

#### 2.2 Payment Status Enum (TrangThaiThuPhi)

```java
public enum TrangThaiThuPhi {
    CHUA_NOP,  // Not paid
    DA_NOP     // Fully paid
}
```

**Note:** Frontend should never send `trangThai` - it's auto-calculated by backend.

---

### 3. Business Logic Validation

#### 3.1 Foreign Key Existence

Before creating a fee collection record:
```java
HoKhau hoKhau = hoKhauRepo.findById(dto.getHoKhauId())
    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu"));

DotThuPhi dotThuPhi = dotThuPhiRepo.findById(dto.getDotThuPhiId())
    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt thu phí"));
```

#### 3.2 Date Range Validation

For fee periods:
```
ngayKetThuc must be > ngayBatDau
```

For temporary residence/absence:
```
denNgay must be > tuNgay (if both provided)
```

---

## Data Integrity Rules

### 1. Unique Constraints

| Table | Field | Constraint |
|-------|-------|------------|
| tai_khoan | ten_dang_nhap | UNIQUE |
| ho_khau | so_ho_khau | UNIQUE |
| nhan_khau | cccd | UNIQUE (if not NULL) |

### 2. Referential Integrity

All foreign keys have `REFERENCES` constraints:

```sql
nhan_khau.ho_khau_id REFERENCES ho_khau(id) ON DELETE CASCADE
bien_dong.nhan_khau_id REFERENCES nhan_khau(id) ON DELETE CASCADE
thu_phi_ho_khau.ho_khau_id REFERENCES ho_khau(id) ON DELETE CASCADE
thu_phi_ho_khau.dot_thu_phi_id REFERENCES dot_thu_phi(id) ON DELETE CASCADE
```

### 3. Cascade Delete Rules

**When deleting a household (`ho_khau`):**
- ✅ All citizens (`nhan_khau`) in household are deleted
- ✅ All fee collection records (`thu_phi_ho_khau`) are deleted
- ✅ All population changes (`bien_dong`) via citizen are deleted

**Rationale:** Maintain data consistency, prevent orphaned records.

---

### 4. Check Constraints

#### 4.1 Fee Type Constraint

```sql
ALTER TABLE dot_thu_phi
ADD CONSTRAINT check_loai_phi 
CHECK (loai_phi IN ('BAT_BUOC', 'TU_NGUYEN'));
```

#### 4.2 Payment Status Constraint

```sql
ALTER TABLE thu_phi_ho_khau
ADD CONSTRAINT check_trang_thai
CHECK (trang_thai IN ('CHUA_NOP', 'DA_NOP'));
```

---

## Audit Trail

### 1. Created By / Created At

All entities store:
- `created_by` - User ID who created the record
- `created_at` - Timestamp of creation

### 2. Updated At (Fee Collection Only)

`thu_phi_ho_khau` table includes:
- `updated_at` - Timestamp of last update

**Future Enhancement:** Add `updated_by` field to track who modified records.

---

## Business Rule Changes in v1.1

### Changes from v1.0

| Rule | v1.0 | v1.1 | Rationale |
|------|------|------|-----------|
| **Fee Collection Period** | Monthly | Annual | Simplify collection, align with real-world practice |
| **Fee Calculation** | Manual entry | Auto-calculated | Reduce errors, ensure consistency |
| **Temporary Absence** | Ignored | Excluded from fee | Fair fee calculation |
| **Payment Status** | Manual entry | Auto-updated | Real-time status tracking |
| **Fee Management Role** | ADMIN/TOTRUONG | KETOAN only | Financial accountability |

### Migration Impact

- Existing records with `months` field → deprecated
- New records use `periodDescription` (free text, e.g., "Cả năm 2025")
- `soNguoi` and `tongPhi` recalculated for all records on update

---

## Future Business Rules (Planned)

### 1. Fee Discount Rules

**Planned:** Discounts for low-income households, elderly-only households, etc.

**Example:**
```
IF household has only members aged >= 65 THEN
    Apply 50% discount
END IF
```

### 2. Late Payment Penalty

**Planned:** Penalty for payments after deadline.

**Example:**
```
IF ngayThu > dotThuPhi.ngayKetThuc + 30 days THEN
    Add 5% penalty to tongPhi
END IF
```

### 3. Bulk Payment Import

**Planned:** Import payments from Excel file (batch processing).

### 4. Payment Reminders

**Planned:** Auto-send reminders to households with `CHUA_NOP` status.

---

## Conclusion

These business rules ensure the QuanLyDanCu system:

- ✅ Accurately calculates annual fees based on household composition
- ✅ Fairly excludes temporarily absent members from fee calculations
- ✅ Automatically updates payment status for real-time tracking
- ✅ Enforces role-based authorization for financial accountability
- ✅ Maintains data integrity through validation and constraints

**Key Principle:** "Automate calculation, validate input, enforce authorization" - reducing manual errors and ensuring compliance.

For implementation details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints
- [TEST_GUIDE.md](./TEST_GUIDE.md) - Testing procedures
