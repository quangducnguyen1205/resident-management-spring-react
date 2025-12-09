import apiClient from "./apiClient";

/**
 * Đăng nhập
 * POST /api/auth/login
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export const loginApi = async (username, password) => {
  const response = await apiClient.post("/auth/login", {
    username,
    password,
  });
  return response.data; // { token, username, role }
};

/**
 * Đăng ký tài khoản mới (chỉ ADMIN được gọi)
 * POST /api/auth/register
 * @param {string} username 
 * @param {string} password 
 * @param {string} role - "TOTRUONG" hoặc "KETOAN"
 * @returns {Promise<any>}
 */
export const registerApi = async (username, password, role) => {
  const response = await apiClient.post("/auth/register", {
    username,
    password,
    role,
  });
  return response.data;
};
