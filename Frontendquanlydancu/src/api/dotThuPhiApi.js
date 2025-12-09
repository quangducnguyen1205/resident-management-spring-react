import apiClient from "./apiClient";

/**
 * Lấy danh sách đợt thu phí (tất cả role đều xem được)
 * GET /api/dot-thu-phi
 */
export const getAllDotThuPhi = async () => {
  const response = await apiClient.get("/dot-thu-phi");
  return response.data;
};

/**
 * Lấy chi tiết đợt thu phí
 * GET /api/dot-thu-phi/{id}
 */
export const getDotThuPhiById = async (id) => {
  const response = await apiClient.get(`/dot-thu-phi/${id}`);
  return response.data;
};

/**
 * Tạo đợt thu phí mới (ADMIN, KETOAN)
 * POST /api/dot-thu-phi
 */
export const createDotThuPhi = async (data) => {
  const response = await apiClient.post("/dot-thu-phi", data);
  return response.data;
};

/**
 * Xóa đợt thu phí (ADMIN, KETOAN)
 * DELETE /api/dot-thu-phi/{id}
 */
export const deleteDotThuPhi = async (id) => {
  const response = await apiClient.delete(`/dot-thu-phi/${id}`);
  return response.data;
};
