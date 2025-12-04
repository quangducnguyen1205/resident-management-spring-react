import axiosInstance from './axiosConfig';

const unwrap = (promise) => promise.then((response) => response.data);

const HOUSEHOLD_FIELDS = ['soHoKhau', 'tenChuHo', 'diaChi'];

const buildHouseholdPayload = (payload = {}) => {
  const sanitized = {};

  HOUSEHOLD_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      const value = payload[field];
      sanitized[field] = typeof value === 'string' ? value.trim() : value;
    }
  });

  return sanitized;
};

const householdApi = {
  getAll: (params) => unwrap(axiosInstance.get('/ho-khau', { params })),
  getById: (id) => unwrap(axiosInstance.get(`/ho-khau/${id}`)),
  create: (data) => unwrap(axiosInstance.post('/ho-khau', buildHouseholdPayload(data))),
  update: (id, data) => unwrap(axiosInstance.put(`/ho-khau/${id}`, buildHouseholdPayload(data))),
  delete: (id) => unwrap(axiosInstance.delete(`/ho-khau/${id}`))
};

export default householdApi;