# Fix: Dashboard Fee Stats API Response Mapping
**Date:** November 12, 2025
**Status:** ✅ Fixed
**Version:** 1.0

---

## 🎯 Vấn đề

Dashboard không mapping đúng dữ liệu từ API response mới của Fee Stats endpoint.

### ❌ Cũ - Mapping Sai
```javascript
// Old code - Giả định API trả về totalRequired, paidCount, unpaidCount
feeCollectionStats.push(
  { name: 'Đã thu', value: rawFeeStats.totalCollected || 0 },
  { name: 'Chưa thu', value: (rawFeeStats.totalRequired || 0) - (rawFeeStats.totalCollected || 0) }
);
feeCollectionStats.collectionRate = rawFeeStats.collectionRate || 0;
feeCollectionStats.householdsPaid = rawFeeStats.paidCount || 0;
feeCollectionStats.householdsUnpaid = rawFeeStats.unpaidCount || 0;
```

### ✅ Mới - Mapping Đúng
```javascript
// New code - Map đúng theo API response mới
{
  "totalRecords": 1,
  "totalCollected": 3000000,
  "totalHouseholds": 1,
  "paidRecords": 1,
  "unpaidRecords": 0
}
```

---

## 🔧 Giải Pháp

### File Thay Đổi
- **src/features/auth/pages/Dashboard.jsx** (Lines 60-78)

### Code Thay Đổi

**Từ:**
```javascript
const rawFeeStats = feeData?.data || feeData;
const feeCollectionStats = [];

if (rawFeeStats) {
  feeCollectionStats.push(
    { name: 'Đã thu', value: rawFeeStats.totalCollected || 0 },
    { name: 'Chưa thu', value: (rawFeeStats.totalRequired || 0) - (rawFeeStats.totalCollected || 0) }
  );
  // Thêm các thuộc tính bổ sung
  feeCollectionStats.totalCollected = rawFeeStats.totalCollected || 0;
  feeCollectionStats.collectionRate = rawFeeStats.collectionRate || 0;
  feeCollectionStats.householdsPaid = rawFeeStats.paidCount || 0;
  feeCollectionStats.householdsUnpaid = rawFeeStats.unpaidCount || 0;
}
```

**Thành:**
```javascript
const rawFeeStats = feeData?.data || feeData;
const feeCollectionStats = [];

if (rawFeeStats) {
  const totalCollected = rawFeeStats.totalCollected || 0;
  const totalHouseholds = rawFeeStats.totalHouseholds || 0;
  const paidRecords = rawFeeStats.paidRecords || 0;
  const unpaidRecords = rawFeeStats.unpaidRecords || 0;
  
  // Chart data: Đã thu vs Chưa thu (số hộ)
  feeCollectionStats.push(
    { name: 'Đã thu', value: paidRecords },
    { name: 'Chưa thu', value: unpaidRecords }
  );
  
  // Stats properties
  feeCollectionStats.totalCollected = totalCollected;
  feeCollectionStats.totalHouseholds = totalHouseholds;
  feeCollectionStats.collectionRate = totalHouseholds > 0 
    ? Math.round((paidRecords / totalHouseholds) * 100) 
    : 0;
  feeCollectionStats.householdsPaid = paidRecords;
  feeCollectionStats.householdsUnpaid = unpaidRecords;
}
```

---

## 📊 API Response Format

### Backend Returns:
```json
{
  "totalRecords": 1,          // Tổng số bản ghi thu phí
  "totalCollected": 3000000,  // Tổng tiền đã thu (₫)
  "totalHouseholds": 1,       // Tổng số hộ
  "paidRecords": 1,           // Số hộ đã nộp phí
  "unpaidRecords": 0          // Số hộ chưa nộp phí
}
```

### Frontend Mapping:
| Backend Field | Frontend Prop | Mục đích |
|---|---|---|
| `totalCollected` | `totalCollected` | Tổng tiền đã thu (hiển thị summary card) |
| `totalHouseholds` | `totalHouseholds` | Tổng hộ (dùng tính tỷ lệ) |
| `paidRecords` | `householdsPaid` | Chart data + stats |
| `unpaidRecords` | `householdsUnpaid` | Chart data + stats |
| - | `collectionRate` | Tính: (paidRecords / totalHouseholds) × 100 |

---

## 📈 Chart Data Logic

### Trước (Sai):
```javascript
// Chart hiển thị tiền (₫)
{ name: 'Đã thu', value: 3000000 },      // ← Tiền
{ name: 'Chưa thu', value: 1000000 }     // ← Tiền
```

### Sau (Đúng):
```javascript
// Chart hiển thị số hộ
{ name: 'Đã thu', value: 1 },            // ← Hộ đã nộp
{ name: 'Chưa thu', value: 0 }           // ← Hộ chưa nộp
```

### Dashboard Summary Card:
```
┌─────────────────────────────────┐
│ Tổng tiền đã thu                │
│ 3.000.000 ₫                     │
│ Tỷ lệ thu: 100%                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Hộ đã nộp / Chưa nộp            │
│ 1 / 0                           │
└─────────────────────────────────┘
```

---

## 🎯 Tỷ Lệ Thu Phí

### Công Thức:
```
Tỷ lệ thu (%) = (Số hộ đã nộp / Tổng hộ) × 100
             = (paidRecords / totalHouseholds) × 100
```

### Ví Dụ:
```
Tổng hộ: 10
Hộ đã nộp: 7
Hộ chưa nộp: 3

Tỷ lệ = (7 / 10) × 100 = 70%
```

---

## ✅ Testing

- [x] Dashboard fetch stats từ API đúng
- [x] FeeStats component nhận đúng dữ liệu
- [x] Chart hiển thị số hộ đã thu/chưa thu
- [x] Tỷ lệ tính toán chính xác
- [x] Summary cards hiển thị đúng
- [x] No console errors

---

## 📝 Notes

- **Chart data:** Hiển thị **số hộ** (paidRecords / unpaidRecords), không phải tiền
- **Summary card:** Hiển thị **tổng tiền đã thu** (totalCollected)
- **Tỷ lệ:** Tính từ `paidRecords / totalHouseholds`, không phải API response
- Safe fallback: Nếu `totalHouseholds` = 0, `collectionRate` = 0

---

**Last Updated:** November 12, 2025
**Status:** ✅ Complete & Tested
