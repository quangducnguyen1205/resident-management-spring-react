import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FeeCollectionForm } from '../components/FeeCollectionForm';
import feeCollectionApi from '../../../api/feeCollectionApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';

const TYPE_LABEL = {
  BAT_BUOC: 'Bắt buộc',
  TU_NGUYEN: 'Tự nguyện'
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

/**
 * FeeCollectionDetail Page - Refactored 2025
 * 
 * KEY CHANGES:
 * - Removed soTienDaThu from submission payload
 * - Inline error display (no full-page navigation on 400 errors)
 * - Form stays on same page when backend returns validation errors
 * - Success toast then navigate after 1.5s
 * - Only ngayThu and ghiChu can be edited (backend enforces)
 */

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

  const hasAccountantRole = user?.role === 'KETOAN';
  const isNew = location.pathname === '/fee-collection/new';

  const {
    data: collection,
    loading,
    error,
    handleApi,
  } = useApiHandler(null);

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

  const stableInitialValues = useMemo(() => {
    if (isNew || !collection) return {};
    const contribution = collection.tongPhiTuNguyen ?? collection.tongPhi;
    return { ...collection, tongPhi: contribution };
  }, [isNew, collection]);

  /**
   * Handle form submission
   * - NEW MODE: Submit { hoKhauId, dotThuPhiId, ngayThu, ghiChu }
   * - EDIT MODE: Submit { ngayThu, ghiChu } only
   * - Backend calculates soNguoi, tongPhi, trangThai automatically
   * - On 400 error: show inline error, DO NOT navigate away
   * - On success: show toast, navigate after 1.5s
   */
  const handleSubmit = async (payload, setFormError) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      let response;
      if (isNew) {
        response = await feeCollectionApi.create(payload);
      } else {
        response = await feeCollectionApi.update(id, {
          ngayThu: payload.ngayThu,
          ghiChu: payload.ghiChu || ''
        });
      }

      // Success
      setToast({
        type: 'success',
        message: isNew
          ? '✅ Ghi nhận thu phí thành công!'
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

      // VALIDATION ERROR (400) - Show inline, DO NOT navigate
      if (status === 400) {
        // Check if error is related to uniqueness constraint
        if (message.includes('đã tồn tại') || message.includes('duplicate')) {
          setFormError('root', {
            type: 'server',
            message: `⚠️ ${message}`,
          });
        } else if (message.includes('ngày thu') || message.includes('payment date')) {
          setFormError('ngayThu', {
            type: 'server',
            message,
          });
          
          setTimeout(() => {
            const field = document.querySelector('input[name="ngayThu"]');
            if (field) {
              field.scrollIntoView({ behavior: 'smooth', block: 'center' });
              field.focus();
            }
          }, 100);
        } else {
          // Generic validation error
          setFormError('root', {
            type: 'server',
            message,
          });
        }

        setSubmitting(false);
        return;
      }

      // OTHER ERRORS (401/403/500/network) - Show toast, keep form
      setToast({
        type: 'error',
        message: `❌ ${message}`,
      });

      setSubmitting(false);
      return;
    }
  };

  const isFetchingDetail = !isNew && loading && !collection;
  if (isFetchingDetail) return <Loader />;

  if (!isNew && error) {
    return <ErrorMessage message={error} onRetry={fetchCollection} />;
  }

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
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? '➕ Ghi nhận thu phí mới' : '📝 Cập nhật thu phí'}
            </h1>
            {!isNew && collection && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Số hộ khẩu: <strong>{collection.soHoKhau}</strong></span>
                <span>Đợt thu: <strong>{collection.tenDot}</strong></span>
                <span>Loại: <strong>{TYPE_LABEL[collection.loaiThuPhi] || 'Không xác định'}</strong></span>
                <span>Số tiền: <strong>{formatCurrency((collection.loaiThuPhi === 'TU_NGUYEN' ? collection.tongPhiTuNguyen : collection.tongPhi) || 0)} ₫</strong></span>
                <span className="inline-flex items-center gap-2">
                  Trạng thái:
                  <StatusBadge status={collection.trangThai} />
                </span>
              </div>
            )}
          </div>
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