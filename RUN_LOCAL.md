# Hướng dẫn chạy dự án trên môi trường Local

## Yêu cầu hệ thống

- **JDK**: Version 17
- **Node.js**: Version 18 trở lên
- **Maven**: Version 3.6+ (hoặc sử dụng Maven wrapper đã có sẵn)

## 1. Chạy Backend (Spring Boot)

### Cách 1: Dùng Maven command
```bash
cd backend
mvn spring-boot:run
```

### Cách 2: Chạy qua IDE (IntelliJ IDEA / Eclipse)
- Mở project `backend` trong IDE
- Tìm file `QuanLyDanCuApplication.java`
- Click chuột phải → Run

### Kiểm tra
Backend sẽ chạy tại: **http://localhost:8080**

---

## 2. Chạy Frontend (React + Vite)

### Cài đặt dependencies
```bash
cd frontend
npm install
```

### Chạy development server
```bash
npm run dev
```

### Kiểm tra
Frontend sẽ chạy tại: **http://localhost:3000**

---

## Lưu ý quan trọng

⚠️ **Không sử dụng Docker** trong môi trường local này

📌 **Cần mở 2 terminal riêng biệt:**
- Terminal 1: Chạy Backend (port 8080)
- Terminal 2: Chạy Frontend (port 3000)

🔧 Đảm bảo Backend đã khởi động xong trước khi chạy Frontend để tránh lỗi kết nối API.

---

## Xử lý lỗi thường gặp

### Backend không chạy được
- Kiểm tra JDK version: `java -version` (phải là Java 17)
- Xóa folder `target` và build lại: `mvn clean install`

### Frontend không chạy được
- Kiểm tra Node version: `node -v`
- Xóa `node_modules` và cài lại: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

### Port bị chiếm
- Backend (8080): Tắt ứng dụng đang sử dụng port hoặc đổi port trong `application.properties`
- Frontend (3000): Vite sẽ tự động đề xuất port khác nếu 3000 bị chiếm
