# Quản Lý Dân Cư – Spring Boot + React (Vite)

Ứng dụng web quản lý dân cư cấp cơ sở: **hộ khẩu / nhân khẩu / biến động cư trú** và **thu phí theo đợt**, có **phân quyền theo vai trò**.

> Dự án môn học *Nhập môn Công nghệ phần mềm* (HUST). Trạng thái: **Completed**.

---

## 1) Demo chức năng

- **Quản lý hộ khẩu**
  - CRUD hộ khẩu, tìm kiếm
  - Chuyển hộ khẩu / chuyển chủ hộ
- **Quản lý nhân khẩu**
  - CRUD nhân khẩu
  - Tạm trú / tạm vắng / khai tử
  - Lưu **lịch sử biến động** để tra cứu
- **Thu phí & đóng góp theo đợt**
  - Tạo **đợt thu** (bắt buộc theo hộ/nhân khẩu hoặc tự nguyện)
  - Ghi nhận nộp phí theo từng hộ
  - Thống kê: đã nộp/chưa nộp, tổng tiền theo đợt
- **Phân quyền**
  - **Admin**: toàn quyền + quản lý tài khoản
  - **Tổ trưởng**: quản lý hộ khẩu/nhân khẩu (không tạo đợt thu)
  - **Kế toán**: tạo đợt thu + thu phí (không sửa/xóa hộ khẩu/nhân khẩu)

---

## 2) Vai trò & đóng góp (Team project)

Nhóm 8 – CNPM (HUST)

**Nguyễn Quang Đức – Team Lead**
- Đầu mối kỹ thuật & quản lý tiến độ
- Thiết kế kiến trúc
- Backend chính module **Thu phí hộ khẩu** (đợt thu, tính phí, ghi nhận nộp, thống kê)
- Tích hợp FE–BE, review code, xử lý lỗi

> (Chi tiết phân công & mô tả nghiệp vụ nằm trong báo cáo môn học)

---

## 3) Tech stack

- **Backend:** Spring Boot (Java 17), Maven
- **Frontend:** React + Vite (Node.js 20+)
- **Database:** PostgreSQL

---

## 4) Yêu cầu môi trường

- Java 17+
- Maven 3+
- Node.js 20+ & npm
- PostgreSQL (local)

---

## 5) Chuẩn bị database (local)

1) Tạo database:
```bash
createdb -U postgres quanlydancu
```

2) Import schema (legacy):
```bash
psql -U postgres -d quanlydancu -f backend/quanlydancu.sql
```

3) Cấu hình kết nối DB trong:
- `backend/src/main/resources/application.properties`

---

## 6) Run project (local)

### Backend

```bash
cd backend
mvn -DskipTests spring-boot:run
```

Backend: http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Frontend gọi API backend:
- http://localhost:8080/api

---

## 7) Tài liệu

- `backend/docs/BUSINESS_RULES.md`
- `backend/docs/API_REFERENCE.md`
- `backend/docs/ARCHITECTURE_OVERVIEW.md`

---

## 8) Kết quả & hướng phát triển

Hoàn thành các luồng nghiệp vụ chính: tạo hộ khẩu, quản lý nhân khẩu & biến động cư trú, thu phí theo đợt, phân quyền theo vai trò.

Hướng phát triển đề xuất:
- Mobile app (Google Play / App Store)
- Nhắc lịch đóng phí qua SMS/Email
- Bổ sung dashboard/biểu đồ phân tích chi tiết hơn

---

## 9) Screenshots / Demo video

- Link video demo: https://youtu.be/K1jkQHkyrYA?si=MQDU_grR2Wb7mKAj
