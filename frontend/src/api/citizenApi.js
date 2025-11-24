import axiosInstance from './axiosConfig';

const citizenApi = {
  // Basic CRUD endpoints
  getAll: (params) => axiosInstance.get('/nhan-khau', { params }),
  getById: (id) => axiosInstance.get(`/nhan-khau/${id}`),
  create: (data) => axiosInstance.post('/nhan-khau', data),
  update: (id, data) => axiosInstance.put(`/nhan-khau/${id}`, data),
  delete: (id) => axiosInstance.delete(`/nhan-khau/${id}`),

  // Search endpoint
  search: (params) => axiosInstance.get('/nhan-khau/search', { params }),

  // Statistics endpoints
  getGenderStats: () => axiosInstance.get('/nhan-khau/stats/gender'),
  getAgeStats: (params) => axiosInstance.get('/nhan-khau/stats/age', { params }),

  // Tạm vắng (Temporary absence) endpoints
  updateTamVang: (id, data) => axiosInstance.put(`/nhan-khau/${id}/tamvang`, data),
  deleteTamVang: (id) => axiosInstance.delete(`/nhan-khau/${id}/tamvang`),

  // Tạm trú (Temporary residence) endpoints
  updateTamTru: (id, data) => axiosInstance.put(`/nhan-khau/${id}/tamtru`, data),
  deleteTamTru: (id) => axiosInstance.delete(`/nhan-khau/${id}/tamtru`),

  // Khai tử (Death declaration) endpoint
  updateKhaiTu: (id, data) => axiosInstance.put(`/nhan-khau/${id}/khaitu`, data)
};

export default citizenApi;