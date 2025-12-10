import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả nhân khẩu
 * GET /api/nhan-khau
 * @returns {Promise<Array<NhanKhauResponseDto>>}
 */
export const getAllNhanKhau = async () => {
  const response = await apiClient.get("/nhan-khau");
  return response.data;
};

/**
 * Lấy chi tiết nhân khẩu theo ID
 * GET /api/nhan-khau/{id}
 * @param {number} id - ID nhân khẩu
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const getNhanKhauById = async (id) => {
  const response = await apiClient.get(`/nhan-khau/${id}`);
  return response.data;
};

/**
 * Tìm kiếm nhân khẩu theo từ khóa (tên hoặc CMND/CCCD)
 * GET /api/nhan-khau/search?q=...
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise<Array<NhanKhauResponseDto>>}
 */
export const searchNhanKhau = async (keyword) => {
  const response = await apiClient.get("/nhan-khau/search", {
    params: { q: keyword },
  });
  return response.data;
};

/**
 * Tạo nhân khẩu mới (ADMIN, TOTRUONG)
 * POST /api/nhan-khau
 * @param {Object} data - NhanKhauRequestDto
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const createNhanKhau = async (data) => {
  const response = await apiClient.post("/nhan-khau", data);
  return response.data;
};

/**
 * Cập nhật nhân khẩu (ADMIN, TOTRUONG) - partial update
 * PUT /api/nhan-khau/{id}
 * @param {number} id - ID nhân khẩu
 * @param {Object} data - NhanKhauUpdateDto
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const updateNhanKhau = async (id, data) => {
  const response = await apiClient.put(`/nhan-khau/${id}`, data);
  return response.data;
};

/**
 * Xóa nhân khẩu (ADMIN, TOTRUONG)
 * DELETE /api/nhan-khau/{id}
 * @param {number} id - ID nhân khẩu
 * @returns {Promise<void>}
 */
export const deleteNhanKhau = async (id) => {
  const response = await apiClient.delete(`/nhan-khau/${id}`);
  return response.data;
};

/**
 * Đăng ký tạm trú cho nhân khẩu (ADMIN, TOTRUONG)
 * PUT /api/nhan-khau/{id}/tamtru
 * @param {number} id - ID nhân khẩu
 * @param {Object} data - DangKyTamTruTamVangRequestDto {ngayBatDau, ngayKetThuc, lyDo}
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const registerTamTru = async (id, data) => {
  const response = await apiClient.put(`/nhan-khau/${id}/tamtru`, data);
  return response.data;
};

/**
 * Hủy đăng ký tạm trú (ADMIN, TOTRUONG)
 * DELETE /api/nhan-khau/{id}/tamtru
 * @param {number} id - ID nhân khẩu
 * @returns {Promise<void>}
 */
export const cancelTamTru = async (id) => {
  const response = await apiClient.delete(`/nhan-khau/${id}/tamtru`);
  return response.data;
};

/**
 * Đăng ký tạm vắng cho nhân khẩu (ADMIN, TOTRUONG)
 * PUT /api/nhan-khau/{id}/tamvang
 * @param {number} id - ID nhân khẩu
 * @param {Object} data - DangKyTamTruTamVangRequestDto {ngayBatDau, ngayKetThuc, lyDo}
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const registerTamVang = async (id, data) => {
  const response = await apiClient.put(`/nhan-khau/${id}/tamvang`, data);
  return response.data;
};

/**
 * Hủy đăng ký tạm vắng (ADMIN, TOTRUONG)
 * DELETE /api/nhan-khau/{id}/tamvang
 * @param {number} id - ID nhân khẩu
 * @returns {Promise<void>}
 */
export const cancelTamVang = async (id) => {
  const response = await apiClient.delete(`/nhan-khau/${id}/tamvang`);
  return response.data;
};

/**
 * Khai tử nhân khẩu (ADMIN, TOTRUONG)
 * PUT /api/nhan-khau/{id}/khaitu
 * @param {number} id - ID nhân khẩu
 * @param {Object} data - KhaiTuRequestDto {lyDo}
 * @returns {Promise<NhanKhauResponseDto>}
 */
export const registerKhaiTu = async (id, data) => {
  const response = await apiClient.put(`/nhan-khau/${id}/khaitu`, data);
  return response.data;
};

/**
 * Thống kê nhân khẩu theo giới tính
 * GET /api/nhan-khau/stats/gender
 * @returns {Promise<{total: number, byGender: {Nam: number, Nữ: number, ...}}>}
 */
export const getGenderStats = async () => {
  const response = await apiClient.get("/nhan-khau/stats/gender");
  return response.data;
};

/**
 * Thống kê nhân khẩu theo độ tuổi
 * GET /api/nhan-khau/stats/age
 * @returns {Promise<{total: number, diHoc: {label: string, soNguoi: number}, diLam: {label: string, soNguoi: number}, veHuu: {label: string, soNguoi: number}}>}
 */
export const getAgeStats = async () => {
  const response = await apiClient.get("/nhan-khau/stats/age");
  return response.data;
};
