import { useState, useCallback } from 'react';

const useApiHandler = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApi = useCallback(async (apiCall, errorMessage = 'Đã có lỗi xảy ra') => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      setData(response.data);

      return { success: true, data: response.data };

    } catch (err) {
      const status = err.response?.status;

      let message;
      if (typeof err.response?.data === 'string') {
        message = err.response.data.replace(/^"|"$/g, "");
      } else {
        message = err.response?.data?.message || err.message || errorMessage;
      }

      // ⭐⭐ Validation error — DO NOT set global error ⭐⭐
      if (status === 400) {
        return { success: false, status: 400, message };
      }

      // ❗ Non-400 errors (server, network, 401…) → set global error
      setError(message);

      return { success: false, status, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, setData, setError, handleApi };
};

export default useApiHandler;