import api from './axiosConfig';

const accountApi = {
  getAll: () => api.get('/tai-khoan'),
  delete: (id) => api.delete(`/tai-khoan/${id}`)
};

export default accountApi;
