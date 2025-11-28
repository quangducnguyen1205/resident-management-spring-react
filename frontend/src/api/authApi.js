import axiosInstance from './axiosConfig';

const unwrap = (promise) => promise.then((response) => response.data);

const buildLoginPayload = ({ username, password }) => ({
  username: username?.trim(),
  password
});

const REGISTER_FIELDS = ['username', 'password', 'role', 'hoTen', 'email', 'soDienThoai'];

const buildRegisterPayload = (payload = {}) => {
  const sanitized = {};

  REGISTER_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) {
      sanitized[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
    }
  });

  return sanitized;
};

const authApi = {
  login: (payload) => unwrap(axiosInstance.post('/auth/login', buildLoginPayload(payload))),
  register: (payload) => unwrap(axiosInstance.post('/auth/register', buildRegisterPayload(payload))),
  logout: () => Promise.resolve()
};

export default authApi;