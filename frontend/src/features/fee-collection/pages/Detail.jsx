import React, { useEffect, useState, useMemo } from 'react';
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

  const bgColor =
    type === 'error'
      ? 'bg-red-100 border-red-400 text-red-800'
      : 'bg-green-100 border-green-400 text-green-800';
  const icon = type === 'error' ? '❌' : '✅';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg z-50 max-w-md`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-semibold">
            {type === 'error' ? 'Lỗi' : 'Thành công'}
          </p>
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
  const [submitting, setSubmitting] = useState(false);

  // Kế toán mới được dùng
  const hasAccountantRole = user?.role === 'KETOAN';

  // /fee-collection/new => chế độ tạo mới
  const isNew = location.pathname === '/fee-collection/new';

  const {
    data: collection,
    loading,
    error,
    handleApi,
  } = useApiHandler(null);

  // Chỉ dùng useApiHandler để FETCH dữ liệu khi EDIT
  const fetchCollection = async () => {
    if (isNew) return;
    if (!id) return;

    await handleApi(
      () => feeCollectionApi.getById(id),
      'Không thể tải thông tin thu phí'
    );
  };

  useEffect(() => {
    fetchCollection();
  }, [id, isNew]);

  // initialValues ổn định cho Form (tránh đổi reference lung tung)
  const stableInitialValues = useMemo(() => {
    if (isNew) return {};
    return collection || {};
  }, [isNew, collection]);

  // SUBMIT: gọi API trực tiếp, KHÔNG dùng useApiHandler để tránh đụng vào loading/error toàn cục
  const handleSubmit = async (data, setFormError) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      let response;
      if (isNew) {
        response = await feeCollectionApi.create(data);
      } else {
        response = await feeCollectionApi.update(id, data);
      }

      // Nếu BE trả về lỗi dạng 2xx nhưng có flag fail (trường hợp hiếm)
      // thì bạn có thể check ở đây (tùy contract API)
      // Ví dụ: if (response.data?.error) { ... }

      // Thành công: show toast + điều hướng sau 1.5s
      setToast({
        type: 'success',
        message: isNew
          ? '✅ Thêm thu phí thành công!'
          : '✅ Cập nhật thu phí thành công!',
      });

      setTimeout(() => {
        navigate('/fee-collection');
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        err.message ||
        'Không thể lưu thu phí';

      // LỖI VALIDATION (400) => hiển thị ngay dưới field, KHÔNG reset form, KHÔNG chuyển trang
      if (status === 400) {
        // Ở đây mình giả định lỗi liên quan đến ngày thu
        // Nếu sau này BE trả thêm lỗi field khác (vd: soTienDaThu)
        // bạn có thể parse message và gọi setFormError tương ứng
        setFormError('ngayThu', {
          type: 'server',
          message,
        });

        // Scroll đến field + focus
        setTimeout(() => {
          const field = document.querySelector('input[name="ngayThu"]');
          if (field) {
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
          }
        }, 100);

        setSubmitting(false);
        return;
      }

      // Các lỗi khác (401/403/500/network) => toast error, form vẫn giữ nguyên
      setToast({
        type: 'error',
        message: `❌ ${message}`,
      });

      setSubmitting(false);
      return;
    }
  };

  // Chỉ hiển thị Loader khi đang load dữ liệu ban đầu ở EDIT mode
  const isFetchingDetail = !isNew && loading && !collection;
  if (isFetchingDetail) return <Loader />;

  // Lỗi fetch ở EDIT mode => show ErrorMessage
  if (!isNew && error) {
    return <ErrorMessage message={error} onRetry={fetchCollection} />;
  }

  // Không có quyền
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
              <h3 className="text-lg font-bold text-red-800 mb-2">
                Không có quyền truy cập
              </h3>
              <p className="text-red-700">
                Chỉ nhân viên <strong>Kế toán</strong> mới có quyền thực hiện
                các thao tác trên mục <strong>Thu Phí Hộ Khẩu</strong>.
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
            initialValues={stableInitialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </>
  );
};

export default FeeCollectionDetail;