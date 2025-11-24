import axiosInstance from './axiosConfig';

const populationApi = {
  // CRUD endpoints (aligned with backend BienDongController)
  getAll: (params) => axiosInstance.get('/bien-dong', { params }),
  getById: (id) => axiosInstance.get(`/bien-dong/${id}`),
  create: (data) => axiosInstance.post('/bien-dong', data),
  update: (id, data) => axiosInstance.put(`/bien-dong/${id}`, data),
  delete: (id) => axiosInstance.delete(`/bien-dong/${id}`)
  // Note: Statistics and filtering should be implemented client-side or requested from backend
};

export default populationApi;