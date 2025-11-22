import axiosInstance from './axiosConfig';

const feeCollectionApi = {
  // Existing CRUD endpoints
  getAll: (params) => axiosInstance.get('/thu-phi-ho-khau', { params }),
  getById: (id) => axiosInstance.get(`/thu-phi-ho-khau/${id}`),
  create: (data) => axiosInstance.post('/thu-phi-ho-khau', data),
  update: (id, data) => axiosInstance.put(`/thu-phi-ho-khau/${id}`, data),
  delete: (id) => axiosInstance.delete(`/thu-phi-ho-khau/${id}`),

  // Calculate fee for a household in a specific period
  calculateFee: (data) => axiosInstance.get('/thu-phi-ho-khau/calc', { params: data }),

  // New endpoints for household-specific and statistics
  getByHousehold: (householdId) => axiosInstance.get(`/thu-phi-ho-khau/ho-khau/${householdId}`),
  getStats: () => axiosInstance.get('/thu-phi-ho-khau/stats'),
  getCollectionRate: () => axiosInstance.get('/thu-phi-ho-khau/stats/rate'),
  getCollectionByPeriod: (periodId) => axiosInstance.get(`/thu-phi-ho-khau/dot-thu/${periodId}`),
  getUnpaidHouseholds: () => axiosInstance.get('/thu-phi-ho-khau/chua-nop')
};

export default feeCollectionApi;