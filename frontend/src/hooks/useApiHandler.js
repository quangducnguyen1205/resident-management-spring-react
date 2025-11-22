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
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || errorMessage;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    setData,
    setError,
    handleApi
  };
};

export default useApiHandler;