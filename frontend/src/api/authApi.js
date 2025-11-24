import axiosInstance from './axiosConfig';

const authApi = {
  login: (payload) => axiosInstance.post('/auth/login', payload),
  logout: () => axiosInstance.post('/auth/logout'),
  register: (payload) => axiosInstance.post('/auth/register', payload)
};

export default authApi;