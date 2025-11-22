// src/api/authService.js
/*import axios from "axios";

const API_URL = "https://your-api.com/api";

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      return response.data; // { token: "..." }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Sai tài khoản hoặc mật khẩu");
      } else {
        throw new Error("Không thể kết nối đến máy chủ");
      }
    }
  },

  logout: async () => {
    // Có thể gọi API /logout nếu backend hỗ trợ
    return true;
  },
};

export default authService;*/



// src/services/authService.js
// login bằng mock API
/*
const API_URL = "http://localhost:3001/users";

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}?email=${email}&password=${password}`);
    const data = await res.json();

    if (data.length > 0) {
      // Đúng tài khoản
      return { token: data[0].token, user: data[0] };
    } else {
      throw new Error("Email hoặc mật khẩu không đúng");
    }
  },
};
export default authService;
*/

/*
const API_URL = "http://localhost:3001/users";

export const authService = {
  login: async (email, password) => {
    try {
      // timeout 10s để tránh chờ vô hạn khi server tắt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const url = `${API_URL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Lỗi từ máy chủ (${res.status})`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        return { token: data[0].token, user: data[0] };
      } else {
        throw new Error("Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Yêu cầu vượt quá thời gian chờ. Vui lòng thử lại.");
      }
      if (err instanceof TypeError) {
        // fetch sẽ ném TypeError khi không thể kết nối (Failed to fetch)
        throw new Error("Không thể kết nối đến máy chủ. Kiểm tra xem API có đang chạy và cổng đúng không.");
      }
      throw err;
    }
  },
};
export default authService;
*/
import authApi from '../../../api/authApi';

export const authService = {
  login: async (username, password) => {
    try {
      // Backend returns { token, username, role }
      const response = await authApi.login({ username, password });
      const { token, username: user, role } = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      
      return { token, user, role };
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Sai tài khoản hoặc mật khẩu');
      }
      throw new Error('Không thể kết nối đến máy chủ');
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      return false;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
