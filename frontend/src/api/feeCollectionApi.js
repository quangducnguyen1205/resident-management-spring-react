import axiosInstance from './axiosConfig';

/**
 * Fee Collection API Client (2025 Refactored Version)
 * 
 * BREAKING CHANGES:
 * - Removed soTienDaThu field (backend no longer accepts it)
 * - Removed periodDescription field
 * - New calculate endpoint returns dynamic month calculation
 * - One payment per household per period (uniqueness enforced)
 */
const feeCollectionApi = {
  // CRUD endpoints (aligned with backend ThuPhiHoKhauController)
  getAll: (params) => axiosInstance.get('/thu-phi-ho-khau', { params }),
  getById: (id) => axiosInstance.get(`/thu-phi-ho-khau/${id}`),
  
  /**
   * Create new payment record (full payment only, no partial payments)
   * @param {Object} data - { hoKhauId, dotThuPhiId, ngayThu, ghiChu }
   * @returns Backend auto-calculates: soNguoi, tongPhi, trangThai
   */
  create: (data) => axiosInstance.post('/thu-phi-ho-khau', data),
  
  /**
   * Update existing payment record (only ngayThu and ghiChu can be updated)
   * @param {number} id - Record ID
   * @param {Object} data - { ngayThu?, ghiChu? }
   */
  update: (id, data) => axiosInstance.put(`/thu-phi-ho-khau/${id}`, data),
  
  delete: (id) => axiosInstance.delete(`/thu-phi-ho-khau/${id}`),

  // Statistics and query endpoints
  getStats: () => axiosInstance.get('/thu-phi-ho-khau/stats'),
  
  /**
   * Calculate fee for household in a specific period
   * MUST BE CALLED before displaying form to show calculated amount
   * @param {number} hoKhauId - Household ID
   * @param {number} dotThuPhiId - Fee period ID
   * @returns {Object} { memberCount, monthlyFeePerPerson, months, totalFee, formula, soHoKhau, tenChuHo, tenDot, periodStart, periodEnd }
   */
  calculateFee: (hoKhauId, dotThuPhiId) => 
    axiosInstance.get('/thu-phi-ho-khau/calculate', { params: { hoKhauId, dotThuPhiId } }),
  
  // Query by relationships
  getByHousehold: (householdId) => axiosInstance.get(`/thu-phi-ho-khau/ho-khau/${householdId}`),
  getByPeriod: (periodId) => axiosInstance.get(`/thu-phi-ho-khau/dot-thu-phi/${periodId}`)
};

export default feeCollectionApi;