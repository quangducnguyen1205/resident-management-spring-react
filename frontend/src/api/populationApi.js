import axiosInstance from './axiosConfig';

const populationApi = {
  // Existing CRUD endpoints
  getAll: (params) => axiosInstance.get('/bien-dong', { params }),
  getById: (id) => axiosInstance.get(`/bien-dong/${id}`),
  create: (data) => axiosInstance.post('/bien-dong', data),
  update: (id, data) => axiosInstance.put(`/bien-dong/${id}`, data),
  delete: (id) => axiosInstance.delete(`/bien-dong/${id}`),

  // New endpoints for statistics and filters
  getStats: () => axiosInstance.get('/bien-dong/stats'),
  getByType: (type) => axiosInstance.get(`/bien-dong/loai/${type}`),
  getByDateRange: (startDate, endDate) => axiosInstance.get('/bien-dong/thoi-gian', {
    params: { startDate, endDate }
  })
};

export default populationApi;