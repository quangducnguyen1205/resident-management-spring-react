import apiClient from "./apiClient";

/**
 * Lấy danh sách tài khoản (chỉ ADMIN)
 * GET /api/tai-khoan
 * @returns {Promise<Array>} Danh sách TaiKhoanResponseDto
 */
export const getAllTaiKhoan = async () => {
  const response = await apiClient.get("/tai-khoan");
  return response.data;
};

/**
 * Tạo tài khoản mới (chỉ ADMIN)
 * POST /api/tai-khoan
 * @param {string} username 
 * @param {string} password 
 * @param {string} role - "TOTRUONG" hoặc "KETOAN"
 * @param {string} hoTen - Họ tên (optional)
 * @param {string} email - Email (optional)
 * @param {string} soDienThoai - Số điện thoại (optional)
 * @returns {Promise<any>}
 */
export const createTaiKhoan = async (username, password, role, hoTen = "", email = "", soDienThoai = "") => {
  const response = await apiClient.post("/tai-khoan", {
    username,
    password,
    role,
    hoTen: hoTen || undefined,
    email: email || undefined,
    soDienThoai: soDienThoai || undefined,
  });
  return response.data;
};

/**
 * Xóa tài khoản (chỉ ADMIN, không được xóa chính mình hoặc ADMIN khác)
 * DELETE /api/tai-khoan/{id}
 * @param {number} id 
 * @returns {Promise<any>}
 */
export const deleteTaiKhoan = async (id) => {
  const response = await apiClient.delete(`/tai-khoan/${id}`);
  return response.data;
};
