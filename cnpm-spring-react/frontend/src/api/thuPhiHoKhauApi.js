import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả bản ghi thu phí hộ khẩu
 * GET /api/thu-phi-ho-khau
 * @returns {Promise<Array<ThuPhiHoKhauResponseDto>>}
 */
export const getAllThuPhiHoKhau = async () => {
  const response = await apiClient.get("/thu-phi-ho-khau");
  return response.data;
};

/**
 * Thống kê tổng quan về thu phí hộ khẩu
 * GET /api/thu-phi-ho-khau/stats
 * @returns {Promise<{totalRecords: number, totalExpectedFee: number, totalHouseholds: number, paidRecords: number, unpaidRecords: number}>}
 */
export const getThuPhiStats = async () => {
  const response = await apiClient.get("/thu-phi-ho-khau/stats");
  return response.data;
};

/**
 * Tính số tiền phải nộp cho một hộ khẩu trong một đợt thu phí
 * GET /api/thu-phi-ho-khau/calculate?hoKhauId=&dotThuPhiId=
 * Công thức: định_mức_tháng * số_tháng * số_người
 * @param {number} hoKhauId - ID hộ khẩu
 * @param {number} dotThuPhiId - ID đợt thu phí
 * @returns {Promise<Object>} Thông tin tính phí
 */
export const calculateThuPhi = async (hoKhauId, dotThuPhiId) => {
  const response = await apiClient.get("/thu-phi-ho-khau/calculate", {
    params: { hoKhauId, dotThuPhiId },
  });
  return response.data;
};

/**
 * Tổng quan thu phí cho một đợt cụ thể
 * GET /api/thu-phi-ho-khau/overview?dotThuPhiId=
 * Trả về: danh sách hộ khẩu, trạng thái thu phí, tổng tiền đợt
 * @param {number} dotThuPhiId - ID đợt thu phí
 * @returns {Promise<{tongSoHo: number, daThu: number, chuaThu: number, tongTien: number, ...}>}
 */
export const getThuPhiOverview = async (dotThuPhiId) => {
  const response = await apiClient.get("/thu-phi-ho-khau/overview", {
    params: { dotThuPhiId },
  });
  return response.data;
};

/**
 * Lấy lịch sử thu phí theo hộ khẩu
 * GET /api/thu-phi-ho-khau/ho-khau/{hoKhauId}
 * @param {number} hoKhauId - ID hộ khẩu
 * @returns {Promise<Array<ThuPhiHoKhauResponseDto>>}
 */
export const getThuPhiByHoKhau = async (hoKhauId) => {
  const response = await apiClient.get(`/thu-phi-ho-khau/ho-khau/${hoKhauId}`);
  return response.data;
};

/**
 * Lấy danh sách thu phí theo đợt thu phí
 * GET /api/thu-phi-ho-khau/dot-thu-phi/{dotThuPhiId}
 * @param {number} dotThuPhiId - ID đợt thu phí
 * @returns {Promise<Array<ThuPhiHoKhauResponseDto>>}
 */
export const getThuPhiByDot = async (dotThuPhiId) => {
  const response = await apiClient.get(`/thu-phi-ho-khau/dot-thu-phi/${dotThuPhiId}`);
  return response.data;
};

/**
 * Tạo bản ghi thu phí mới (ADMIN, KETOAN)
 * POST /api/thu-phi-ho-khau
 * Phí bắt buộc: tự tính số người và tổng phí
 * Phí tự nguyện: yêu cầu cung cấp trường tongPhi trong payload
 * @param {Object} data - ThuPhiHoKhauRequestDto {hoKhauId, dotThuPhiId, ngayThu, ghiChu, tongPhi?}
 * @returns {Promise<ThuPhiHoKhauResponseDto>}
 */
export const createThuPhiHoKhau = async (data) => {
  const response = await apiClient.post("/thu-phi-ho-khau", data);
  return response.data;
};

/**
 * Cập nhật bản ghi thu phí (ADMIN, KETOAN)
 * PUT /api/thu-phi-ho-khau/{id}
 * Chỉ hỗ trợ chỉnh sửa: ngày thu và ghi chú
 * @param {number} id - ID thu phí
 * @param {Object} data - ThuPhiHoKhauRequestDto {ngayThu, ghiChu}
 * @returns {Promise<ThuPhiHoKhauResponseDto>}
 */
export const updateThuPhiHoKhau = async (id, data) => {
  const response = await apiClient.put(`/thu-phi-ho-khau/${id}`, data);
  return response.data;
};

/**
 * Xóa bản ghi thu phí (ADMIN, KETOAN)
 * DELETE /api/thu-phi-ho-khau/{id}
 * @param {number} id - ID thu phí
 * @returns {Promise<string>} Thông báo xóa thành công
 */
export const deleteThuPhiHoKhau = async (id) => {
  const response = await apiClient.delete(`/thu-phi-ho-khau/${id}`);
  return response.data;
};
