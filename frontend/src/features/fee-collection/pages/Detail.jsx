import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FeeCollectionForm } from '../components/FeeCollectionForm';
import feeCollectionApi from '../../../api/feeCollectionApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';

// Toast Alert Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-800' : 'bg-green-100 border-green-400 text-green-800';
  const icon = type === 'error' ? '❌' : '✅';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg z-50 max-w-md`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-semibold">{type === 'error' ? 'Lỗi' : 'Thành công'}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const FeeCollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  
  // Check if user has accountant role (Kế toán)
  const hasAccountantRole = user?.role === 'KETOAN';
  
  // Detect "new" mode từ pathname
  const isNew = location.pathname === '/fee-collection/new';
  
  const {
    data: collection,
    loading,
    error,
    handleApi
  } = useApiHandler(null);

  const fetchCollection = async () => {
    if (isNew) return;  // Khi tạo mới, không fetch
    if (!id) return;    // Nếu không có id, return
    
    await handleApi(
      () => feeCollectionApi.getById(id),
      'Không thể tải thông tin thu phí'
    );
  };

  useEffect(() => {
    fetchCollection();
  }, [id, isNew]);

  const handleSubmit = async (data) => {
    try {
      const result = await handleApi(
        () => isNew ? feeCollectionApi.create(data) : feeCollectionApi.update(id, data),
        'Không thể lưu thu phí'
      );

      setToast({
        type: 'success',
        message: isNew ? '✅ Thêm thu phí thành công!' : '✅ Cập nhật thu phí thành công!'
      });

      setTimeout(() => {
        navigate('/fee-collection');
      }, 2000);
    } catch (err) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || err.message;

      // Handle authorization errors
      if (status === 403 || errorMessage.includes('quyền') || errorMessage.includes('kế toán')) {
        setToast({
          type: 'error',
          message: '❌ Bạn không có quyền truy cập! Chỉ kế toán viên mới có thể thực hiện thao tác này.'
        });
      } else if (status === 400) {
        setToast({
          type: 'error',
          message: `❌ Thông tin không hợp lệ: ${errorMessage}`
        });
      } else {
        setToast({
          type: 'error',
          message: `❌ Lỗi: ${errorMessage}`
        });
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCollection} />;

  // Check permission for fee-collection
  if (!hasAccountantRole) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 font-semibold"
        >
          ← Quay lại
        </button>
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Không có quyền truy cập</h3>
              <p className="text-red-700">
                Chỉ nhân viên <strong>Kế toán</strong> mới có quyền thực hiện các thao tác trên mục <strong>Thu Phí Hộ Khẩu</strong>.
              </p>
              <p className="text-red-600 text-sm mt-2">
                Vui lòng liên hệ quản trị viên nếu bạn cần cấp quyền truy cập.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isNew ? '➕ Thêm khoản thu phí mới' : '📝 Chi tiết khoản thu phí'}
          </h1>
          <button
            onClick={() => navigate('/fee-collection')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Quay lại
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <FeeCollectionForm
            initialValues={collection || {}}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default FeeCollectionDetail;