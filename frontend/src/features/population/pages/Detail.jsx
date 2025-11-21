import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PopulationForm } from '../components/PopulationForm';
import populationApi from '../../../api/populationApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const PopulationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: change,
    loading,
    error,
    handleApi
  } = useApiHandler(null);

  const fetchChange = async () => {
    if (id === 'new') return;
    await handleApi(
      () => populationApi.getById(id),
      'Không thể tải thông tin biến động'
    );
  };

  useEffect(() => {
    fetchChange();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await handleApi(
        () => id === 'new' ? populationApi.create(data) : populationApi.update(id, data),
        'Không thể lưu biến động'
      );
      navigate('/population');
    } catch (err) {}
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchChange} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id === 'new' ? 'Thêm biến động mới' : 'Chi tiết biến động'}
        </h1>
        <button
          onClick={() => navigate('/population')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <PopulationForm
          initialValues={change || {}}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default PopulationDetail;