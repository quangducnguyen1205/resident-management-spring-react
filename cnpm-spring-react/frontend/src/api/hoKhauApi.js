import apiClient from "./apiClient";

/**
 * Lấy danh sách hộ khẩu
 * GET /api/ho-khau
 */
export const getAllHoKhau = async () => {
  const response = await apiClient.get("/ho-khau");
  return response.data;
};

/**
 * Lấy chi tiết hộ khẩu (kèm danh sách nhân khẩu)
 * GET /api/ho-khau/{id}
 */
export const getHoKhauById = async (id) => {
  const response = await apiClient.get(`/ho-khau/${id}`);
  return response.data;
};

/**
 * Tạo hộ khẩu mới (ADMIN, TOTRUONG)
 * POST /api/ho-khau
 */
export const createHoKhau = async (data) => {
  const response = await apiClient.post("/ho-khau", data);
  return response.data;
};

/**
 * Cập nhật hộ khẩu (ADMIN, TOTRUONG)
 * PUT /api/ho-khau/{id}
 */
export const updateHoKhau = async (id, data) => {
  const response = await apiClient.put(`/ho-khau/${id}`, data);
  return response.data;
};

/**
 * Xóa hộ khẩu (ADMIN, TOTRUONG)
 * DELETE /api/ho-khau/{id}
 */
export const deleteHoKhau = async (id) => {
  const response = await apiClient.delete(`/ho-khau/${id}`);
  return response.data;
};
