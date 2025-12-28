import apiClient from "./apiClient";

/**
 * Lấy danh sách log biến động (chỉ đọc)
 * GET /api/bien-dong
 */
export const getAllBienDong = async () => {
  const response = await apiClient.get("/bien-dong");
  return response.data;
};

/**
 * Lấy chi tiết biến động
 * GET /api/bien-dong/{id}
 */
export const getBienDongById = async (id) => {
  const response = await apiClient.get(`/bien-dong/${id}`);
  return response.data;
};
