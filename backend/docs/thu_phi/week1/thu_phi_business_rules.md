---
File: thu_phi_business_rules.md
Author: Đức
Date: 2025-10-14
Version: 1.0
---

# Quy tắc nghiệp vụ (Business Rules) - Module Thu phí & Đóng góp

---

## 1. Mục tiêu chung

Tài liệu này định nghĩa các quy tắc, luồng xử lý và cấu trúc dữ liệu cơ bản cho nghiệp vụ thu các khoản phí và đóng góp của các hộ dân trong khu dân cư. Mục tiêu là đảm bảo tất cả thành viên team hiểu đúng và thống nhất về logic của module.

## 2. Actors (Đối tượng tham gia)

- **Collector (Người thu phí):** Tổ trưởng, kế toán hoặc người được giao nhiệm vụ. Actor chính thực hiện các hoạt động thu tiền.
- **Admin:** Người quản lý hệ thống, có quyền cấu hình các khoản phí.
- **Resident (Người dân):** Đối tượng nộp phí (không trực tiếp tương tác với hệ thống).

## 3. Danh sách các khoản thu chính

| Tên khoản thu | Công thức / Quy tắc | Ghi chú |
| :--- | :--- | :--- |
| **Phí vệ sinh** | `6.000 VND / tháng / 1 nhân khẩu` | Bắt buộc, thu định kỳ hàng tháng. |
| **Phí đóng góp** | Tự nguyện | Không bắt buộc, có thể phát sinh theo đợt. |
| **Phí dịch vụ** | (Tùy chọn) | Các khoản phí khác nếu có (bảo trì, an ninh...). |

## 4. Quy tắc tính phí vệ sinh

Đây là khoản phí có công thức tính toán cụ thể và cần xử lý các trường hợp đặc biệt.

- **Input:**
    - `household_id`: Mã định danh hộ khẩu.
    - `num_of_people`: Số nhân khẩu tại thời điểm tính phí.
    - `months`: Số tháng cần nộp (VD: 2 tháng).
- **Công thức:**
    ```
    total_amount = num_of_people * 6000 * months
    ```
- **Ví dụ:** Hộ A (`household_id`: "A001") có 3 nhân khẩu (`num_of_people`: 3) nộp phí vệ sinh cho 2 tháng (`months`: 2).
    - **Tổng tiền:** `3 * 6000 * 2 = 36,000 VND`.

- **Các trường hợp đặc biệt (Edge Cases):**
    1.  **Nhân khẩu mới sinh/chuyển đến:** Chỉ tính phí từ tháng tiếp theo sau ngày đăng ký.
    2.  **Nhân khẩu tạm vắng dài hạn:** Vẫn tính phí trừ khi có quy định miễn giảm riêng.
    3.  **Hộ chuyển đi:** Tính phí đến hết tháng cuối cùng trước khi chuyển đi.

## 5. Luồng thu tiền (Step-by-step)

1.  **Lập danh sách thu:** Hệ thống tạo một đợt thu phí mới, liệt kê các hộ khẩu và số tiền dự kiến phải nộp.
2.  **Ghi nhận thanh toán:** Người thu phí (Collector) đến gặp hộ dân, nhập số tiền thực tế và số tháng nộp vào hệ thống cho `household_id` tương ứng.
3.  **Cập nhật trạng thái:** Hệ thống ghi nhận `payment_id`, `amount`, `date`, `collector_id` và cập nhật trạng thái "Đã nộp" cho hộ khẩu trong đợt thu đó.
4.  **Báo cáo & Thống kê:** Hệ thống cho phép xem báo cáo tổng thu, danh sách hộ đã nộp/chưa nộp.

## 6. Trường dữ liệu cần thiết

| Tên trường | Kiểu gợi ý (DB) | Mô tả |
| :--- | :--- | :--- |
| `household_id` | `VARCHAR(255)` / `UUID` | Mã định danh duy nhất cho mỗi hộ khẩu. |
| `num_of_people` | `INTEGER` | Số nhân khẩu của hộ tại thời điểm thu. |
| `fee_id` | `VARCHAR(255)` / `UUID` | Mã định danh cho loại phí (VD: "VS", "DG"). |
| `payment_id` | `VARCHAR(255)` / `UUID` | Mã định danh duy nhất cho mỗi lần thanh toán. |
| `amount` | `BIGINT` / `DECIMAL` | Số tiền thanh toán (đơn vị: VND). |
| `months` | `JSON` / `TEXT` | Lưu các tháng thanh toán (VD: `[10, 11, 12]`). |
| `date` | `TIMESTAMP` / `DATETIME` | Thời điểm ghi nhận thanh toán. |
| `collector_id` | `VARCHAR(255)` / `UUID` | ID của người thực hiện thu tiền. |

## 7. Ràng buộc & Ngoại lệ

- **Ràng buộc:**
    - `amount` phải là số dương (`> 0`).
    - `months` phải là các giá trị hợp lệ (1-12) và không được trùng với các tháng đã nộp trước đó.
    - `household_id` và `fee_id` phải tồn tại trong hệ thống.
- **Ngoại lệ:**
    - **Nộp nhiều tháng:** Hệ thống phải cho phép ghi nhận thanh toán cho một hoặc nhiều tháng cùng lúc.
    - **Đóng góp tự do:** Đối với `fee_id` là đóng góp, `amount` do người dùng nhập tự do, không cần tính toán theo công thức.

## 8. Checklist & Next Steps

### Checklist (To-do)

- [x] Draft v1.0 tài liệu quy tắc nghiệp vụ.
- [ ] **(Team)** Review và góp ý về các quy tắc tính phí.
- [ ] **(Đức)** Finalize tài liệu sau khi nhận feedback.

### Next steps (Week 2 input)

1.  **ERD Final:** Sơ đồ quan hệ thực thể (ERD) chi tiết cho module thu phí.
2.  **API Endpoints List:** Danh sách các API endpoint cần thiết (VD: `POST /payments`, `GET /fees`).
3.  **Database Types:** Chốt kiểu dữ liệu cuối cùng cho các trường trong DB.