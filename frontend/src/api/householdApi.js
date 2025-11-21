import axiosInstance from './axiosConfig';

const householdApi = {
  getAll: (params) => axiosInstance.get('/ho-khau', { params }),
  getById: (id) => axiosInstance.get(`/ho-khau/${id}`),
  create: (data) => axiosInstance.post('/ho-khau', data),
  update: (id, data) => axiosInstance.put(`/ho-khau/${id}`, data),
  delete: (id) => axiosInstance.delete(`/ho-khau/${id}`),
  // Additional household-specific endpoints can be added here
  addMember: (id, data) => axiosInstance.post(`/ho-khau/${id}/members`, data),
  removeMember: (id, memberId) => axiosInstance.delete(`/ho-khau/${id}/members/${memberId}`)
};

export default householdApi;