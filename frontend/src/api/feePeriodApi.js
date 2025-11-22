import axiosInstance from './axiosConfig';

const feePeriodApi = {
  // Existing CRUD endpoints
  getAll: (params) => axiosInstance.get('/dot-thu-phi', { params }),
  getById: (id) => axiosInstance.get(`/dot-thu-phi/${id}`),
  create: (data) => axiosInstance.post('/dot-thu-phi', data),
  update: (id, data) => axiosInstance.put(`/dot-thu-phi/${id}`, data),
  delete: (id) => axiosInstance.delete(`/dot-thu-phi/${id}`),

  // New endpoints for period management
  getCurrentPeriod: () => axiosInstance.get('/dot-thu-phi/current'),
  getStats: () => axiosInstance.get('/dot-thu-phi/stats'),
  updateStatus: (id, status) => axiosInstance.patch(`/dot-thu-phi/${id}/status`, { status })
};

export default feePeriodApi;