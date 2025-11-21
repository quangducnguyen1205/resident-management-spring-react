import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ user object trong localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
    
    // DEBUG: Log request
    if (config.method === 'post' || config.method === 'put') {
      console.log(`${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // DEBUG: Log error response chi tiết
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.response?.config?.url,
      method: error.response?.config?.method,
      requestData: error.response?.config?.data,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      errorMessage: error.message
    });
    
    if (error.response?.status === 400) {
      console.error('❌ 400 Bad Request Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;