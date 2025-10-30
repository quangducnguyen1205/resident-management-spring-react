---
File: summary_week1.md
Author: Đức
Date: 2025-10-14
Version: 1.0
---

# Tóm tắt công việc Tuần 1 - Task Thu phí & Đóng góp

---

## 1. Mục tiêu tuần 1

- Hoàn thành bộ tài liệu quy tắc nghiệp vụ và use cases cho module "Thu phí & Đóng góp".
- Thống nhất tên các trường dữ liệu chính để toàn bộ team sử dụng đồng bộ.
- Tạo checklist và các tài liệu mẫu để chuẩn hóa quy trình làm việc.

## 2. Deliverables (Sản phẩm đã hoàn thành)

Các tài liệu đã được khởi tạo và đẩy lên repo tại thư mục `docs/week1/thu_phi/`:

1.  **Quy tắc nghiệp vụ:** `/docs/week1/thu_phi/thu_phi_business_rules.md`
2.  **Mô tả Use Cases:** `/docs/week1/thu_phi/uc_thu_phi_description.md`
3.  **File tóm tắt này:** `/docs/week1/thu_phi/summary_week1_duoc.md`

## 3. Issues / Blockers cần giải quyết

1.  **Issue #1: Quy tắc tính phí cho người tạm vắng.**
    -   *Mô tả:* Cần làm rõ chính sách có miễn giảm cho người tạm vắng dài hạn hay không.
    -   *Phụ trách:* **Đức (leader)** cần hỏi lại yêu cầu.
2.  **Issue #2: Thống nhất Primary Key.**
    -   *Mô tả:* Quyết định dùng `UUID` hay `AUTO_INCREMENT INTEGER` cho các ID chính (`household_id`, `payment_id`).
    -   *Phụ trách:* **Định, Đức Anh** thảo luận và chốt.
3.  **Issue #3: Lưu trữ `months`.**
    -   *Mô tả:* Chọn phương án lưu các tháng đã nộp: dạng `JSON array` (`[10, 11]`) hay tạo bảng `payment_details` quan hệ nhiều-nhiều.
    -   *Phụ trách:* **Định, Đức Anh** đưa ra đề xuất.


---