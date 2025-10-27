---
File:    uc_thu_phi_description.md
Tác giả: Đức
Ngày:    14/10/2025
Version: 1.0
---

# Tuần 1: Use Cases - Chức Năng Thu Phí

## Danh Sách Use Case

---

### **UC_ViewFees: Xem danh sách các khoản thu**

-   **ID:** `UC_ViewFees`
-   **Tên:** Xem danh sách các khoản thu hiện có
-   **Actor:** `Admin`, `Collector`
-   **Mô tả:** Actor xem danh sách tất cả các loại phí đang được áp dụng trong hệ thống cùng với mức phí tương ứng.
-   **Tiền điều kiện:** Actor đã đăng nhập vào hệ thống với vai trò hợp lệ.
-   **Luồng chính:**
    1.  Actor chọn mục "Quản lý phí" hoặc tương đương.
    2.  Hệ thống hiển thị danh sách các khoản phí, bao gồm: `fee_id`, Tên khoản phí, Mức phí (nếu có), Mô tả.
-   **Luồng thay thế/lỗi:**
    -   Không có khoản phí nào trong hệ thống: Hiển thị thông báo "Chưa có khoản phí nào được tạo".
-   **Hậu điều kiện:** Actor nắm được thông tin về các khoản phí.
-   **Dữ liệu đầu vào:** Không có.
-   **Dữ liệu đầu ra:** Danh sách các object phí (mỗi object chứa `fee_id`, `name`, `amount_per_person_per_month`, `description`).
-   **Ghi chú:** Đây là chức năng cơ bản để lấy thông tin.

---

### **UC_RecordPayment: Ghi nhận thanh toán cho hộ dân**

-   **ID:** `UC_RecordPayment`
-   **Tên:** Ghi nhận thanh toán phí vệ sinh hoặc đóng góp
-   **Actor:** `Collector`
-   **Mô tả:** `Collector` ghi nhận một giao dịch thanh toán từ một hộ dân cho một hoặc nhiều tháng, hoặc một khoản đóng góp tự nguyện.
-   **Tiền điều kiện:**
    -   `Collector` đã đăng nhập.
    -   Hộ dân (`household_id`) đã tồn tại trong hệ thống.
    -   Khoản phí (`fee_id`) đã được định nghĩa.
-   **Luồng chính (Ví dụ: Thu phí vệ sinh 2 tháng):**
    1.  `Collector` tìm kiếm và chọn hộ dân (`household_id`: "B102", `num_of_people`: 4).
    2.  `Collector` chọn loại phí là "Phí Vệ Sinh" (`fee_id`: "ve_sinh").
    3.  `Collector` chọn các tháng cần nộp: Tháng 10 và Tháng 11. (`months`: `[10, 11]`).
    4.  Hệ thống tự động tính toán số tiền: `amount = 4 * 6000 * 2 = 48000`.
    5.  `Collector` xác nhận số tiền và nhấn "Lưu".
    6.  Hệ thống tạo một bản ghi `payment` mới và cập nhật trạng thái đã nộp cho hộ "B102" trong tháng 10, 11.
    7.  Hệ thống hiển thị thông báo thành công.
-   **Luồng thay thế/lỗi:**
    -   **4a. Nhập số tiền thủ công:** Nếu `Collector` nhập thẳng số tiền `amount`, hệ thống có thể bỏ qua bước tính toán tự động nhưng cần cảnh báo.
    -   **6a. Lỗi kết nối DB:** Hệ thống không thể lưu. Hiển thị thông báo lỗi và yêu cầu thử lại.
    -   **6b. Trùng lặp thanh toán:** Nếu hộ dân đã nộp phí cho tháng đó, hệ thống cảnh báo "Hộ dân đã thanh toán cho tháng X. Bạn có muốn ghi đè không?".
-   **Hậu điều kiện:** Một bản ghi `payment` mới được tạo. Trạng thái nợ của hộ dân được cập nhật.
-   **Dữ liệu đầu vào:** `household_id`, `fee_id`, `months` (array of integers), `collector_id`, `date` (tự động lấy giờ hệ thống), `amount` (có thể tự tính hoặc nhập tay).
-   **Dữ liệu đầu ra:** `payment_id` của giao dịch mới, thông báo thành công.
-   **Ghi chú:** Trường `months` nên lưu dưới dạng JSON array `[10, 11]` trong DB để dễ dàng truy vấn.

---

### **UC_EditFee: Cập nhật giá trị/mô tả khoản thu**

-   **ID:** `UC_EditFee`
-   **Tên:** Cập nhật thông tin khoản thu
-   **Actor:** `Admin`
-   **Mô tả:** `Admin` thay đổi mức phí hoặc mô tả của một khoản thu đã có (ví dụ: tăng phí vệ sinh từ 6.000 lên 7.000).
-   **Tiền điều kiện:** `Admin` đã đăng nhập. Khoản phí cần sửa đã tồn tại.
-   **Luồng chính:**
    1.  `Admin` vào trang "Quản lý phí".
    2.  `Admin` chọn khoản phí cần sửa và nhấn "Chỉnh sửa".
    3.  Hệ thống hiển thị form với thông tin hiện tại.
    4.  `Admin` thay đổi giá trị (ví dụ: `amount_per_person_per_month` = 7000).
    5.  `Admin` nhấn "Lưu".
    6.  Hệ thống cập nhật thông tin khoản phí trong DB.
-   **Luồng thay thế/lỗi:**
    -   **4a. Dữ liệu không hợp lệ:** Nhập mức phí là số âm. Hệ thống báo lỗi.
-   **Hậu điều kiện:** Thông tin của `fee_id` được cập nhật. Các lần thu phí mới sẽ áp dụng mức giá mới.
-   **Dữ liệu đầu vào:** `fee_id`, `new_amount`, `new_description`.
-   **Dữ liệu đầu ra:** Thông báo cập nhật thành công.
-   **Ghi chú:** Cần có cơ chế ghi log lại lịch sử thay đổi giá phí.

---

### **UC_Report: Thống kê thu phí**

-   **ID:** `UC_Report`
-   **Tên:** Xem báo cáo và thống kê thu phí
-   **Actor:** `Admin`, `Collector`
-   **Mô tả:** Xem báo cáo tổng hợp về tình hình thu phí, ví dụ tổng số tiền đã thu trong tháng, danh sách các hộ chưa nộp phí.
-   **Tiền điều kiện:** Actor đã đăng nhập.
-   **Luồng chính (Xem hộ chưa nộp tháng 10):**
    1.  Actor vào mục "Báo cáo".
    2.  Actor chọn loại báo cáo "Danh sách hộ chưa nộp".
    3.  Actor chọn bộ lọc "Tháng 10" và "Phí Vệ Sinh".
    4.  Hệ thống truy vấn tất cả các hộ (`households`) và lọc ra những hộ không có bản ghi `payment` tương ứng với `fee_id`="ve_sinh" và `months` chứa "10".
    5.  Hệ thống hiển thị danh sách các hộ chưa nộp.
-   **Luồng thay thế/lỗi:**
    -   Không có dữ liệu phù hợp: Hiển thị thông báo "Không tìm thấy kết quả".
-   **Hậu điều kiện:** Actor có được thông tin cần thiết để theo dõi và đôn đốc.
-   **Dữ liệu đầu vào:** `report_type` (e.g., 'total_revenue', 'unpaid_households'), `filters` (e.g., `month: 10`, `year: 2025`, `fee_id: 've_sinh'`).
-   **Dữ liệu đầu ra:** Dữ liệu báo cáo (số liệu tổng hợp hoặc danh sách các hộ).
-   **Ghi chú:** Chức năng này đòi hỏi query DB phức tạp, cần tối ưu hóa hiệu năng.

## User Stories

1.  **As a** Collector, **I want** to see a list of households that haven't paid for the current month, **so that** I can plan my collection route.
2.  **As a** Collector, **I want** to record a payment for multiple months in a single transaction, **so that** I can save time when a resident pays in advance.
3.  **As a** Collector, **I want** the system to automatically calculate the sanitation fee, **so that** I don't make manual calculation errors.
4.  **As an** Admin, **I want** to view a summary report of total fees collected per month, **so that** I can track revenue and financial status.
5.  **As an** Admin, **I want** to update the fee amount for all households, **so that** I can apply new regulations easily.
6.  **As a** Collector, **I want** to record a voluntary contribution with a free-text amount, **so that** I can handle donations flexibly.
7.  **As an** Admin, **I want** to filter the list of unpaid households by specific fee type, **so that** I can differentiate between mandatory fees and other contributions.
8.  **As a** Collector, **I want** to search for a household by its ID or owner's name, **so that** I can quickly find and record their payment.

## Next Steps (Week 2 Input)

1.  **ERD Final:** Sơ đồ quan hệ thực thể cho database (Định).
2.  **API Endpoints List:** Danh sách các API cho các use case trên (e.g., `POST /payments`, `GET /fees`, `GET /reports/unpaid`) (Đức Anh).
3.  **Mockup/UI Design:** Giao diện cho màn hình ghi nhận thanh toán và báo cáo (Thái).