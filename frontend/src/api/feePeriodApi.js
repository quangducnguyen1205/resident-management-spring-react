import axiosInstance from './axiosConfig';

const feePeriodApi = {
  // CRUD endpoints (aligned with backend DotThuPhiController)
  getAll: () => axiosInstance.get('/dot-thu-phi'),
  getById: (id) => axiosInstance.get(`/dot-thu-phi/${id}`),
  create: (data) => axiosInstance.post('/dot-thu-phi', data),
  update: (id, data) => axiosInstance.put(`/dot-thu-phi/${id}`, data),
  delete: (id) => axiosInstance.delete(`/dot-thu-phi/${id}`)
  // Note: Get current period by filtering getAll() by date range client-side
};

export default feePeriodApi;