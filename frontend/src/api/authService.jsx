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
