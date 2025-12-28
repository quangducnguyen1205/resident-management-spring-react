import axios from "axios";

// Tạo axios instance với baseURL trỏ đến backend Spring Boot
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Tự động gắn JWT token vào header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi chung (ví dụ: token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu lỗi 401 (Unauthorized) → token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      // Xóa thông tin đăng nhập
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      
      // Redirect về trang login (chỉ khi không phải đang ở trang login)
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
