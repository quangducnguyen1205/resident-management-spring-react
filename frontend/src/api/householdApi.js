import axiosInstance from './axiosConfig';

const householdApi = {
  getAll: (params) => axiosInstance.get('/ho-khau', { params }),
  getById: (id) => axiosInstance.get(`/ho-khau/${id}`),
  create: (data) => axiosInstance.post('/ho-khau', data),
  update: (id, data) => axiosInstance.put(`/ho-khau/${id}`, data),
  delete: (id) => axiosInstance.delete(`/ho-khau/${id}`)
  // Note: Member management is done through citizen (nhan-khau) API
};

export default householdApi;