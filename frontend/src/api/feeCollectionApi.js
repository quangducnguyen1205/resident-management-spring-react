import axiosInstance from './axiosConfig';

const feeCollectionApi = {
  // CRUD endpoints (aligned with backend ThuPhiHoKhauController)
  getAll: (params) => axiosInstance.get('/thu-phi-ho-khau', { params }),
  getById: (id) => axiosInstance.get(`/thu-phi-ho-khau/${id}`),
  create: (data) => axiosInstance.post('/thu-phi-ho-khau', data),
  update: (id, data) => axiosInstance.put(`/thu-phi-ho-khau/${id}`, data),
  delete: (id) => axiosInstance.delete(`/thu-phi-ho-khau/${id}`),

  // Statistics and query endpoints
  getStats: () => axiosInstance.get('/thu-phi-ho-khau/stats'),
  calculateFee: (hoKhauId, dotThuPhiId) => 
    axiosInstance.get('/thu-phi-ho-khau/calc', { params: { hoKhauId, dotThuPhiId } }),
  
  // Query by relationships
  getByHousehold: (householdId) => axiosInstance.get(`/thu-phi-ho-khau/ho-khau/${householdId}`),
  getByPeriod: (periodId) => axiosInstance.get(`/thu-phi-ho-khau/dot-thu-phi/${periodId}`)
  // Note: Filter unpaid households client-side using trangThai field from getAll()
};

export default feeCollectionApi;