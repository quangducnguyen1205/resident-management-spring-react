import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeePeriodForm } from '../components/FeePeriodForm';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const FeePeriodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // CRITICAL: When route is /fee-period/new, id is undefined (not 'new' string)
  // So isNew must check !id
  const isNew = !id;
  
  const {
    data: period,
    loading,
    error,
    handleApi
  } = useApiHandler(null);

  const fetchPeriod = async () => {
    console.log('FeePeriodDetail mounted with id:', id, 'isNew:', isNew);
    
    // If creating new, no need to fetch
    if (isNew) {
      return;
    }
    
    console.log('Fetching fee period with ID:', id);
    await handleApi(
      () => feePeriodApi.getById(id),
      'Không thể tải thông tin đợt thu phí'
    );
  };

  useEffect(() => {
    fetchPeriod();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      console.log('Submitting fee period data:', data, 'id:', id, 'isNew:', isNew);
      
      const apiCall = () =>
        isNew ? feePeriodApi.create(data) : feePeriodApi.update(id, data);
      
      const result = await handleApi(
        apiCall,
        'Không thể lưu đợt thu phí'
      );
      
      console.log('Backend response:', result);
      alert(isNew ? 'Tạo đợt thu phí thành công!' : 'Cập nhật đợt thu phí thành công!');
      navigate('/fee-period');
    } catch (err) {
      console.error('Error saving fee period:', err);
      alert('Lỗi: ' + (err.message || 'Không thể lưu đợt thu phí'));
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPeriod} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Thêm đợt thu phí mới' : 'Chi tiết đợt thu phí'}
        </h1>
        <button
          onClick={() => navigate('/fee-period')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <FeePeriodForm
          initialValues={period || {}}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default FeePeriodDetail;