import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CitizenForm } from '../components/CitizenForm';
import citizenApi from '../../../api/citizenApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import TamVangModal from '../components/TamVangModal';
import TamTruModal from '../components/TamTruModal';
import KhaiTuModal from '../components/KhaiTuModal';
import { deriveCitizenStatus } from '../utils/status';

const CITIZEN_REFRESH_EVENT = 'citizen:refresh';

const STATUS_BADGES = {
  THUONG_TRU: { label: 'Thường trú', color: 'bg-gray-100 text-gray-800' },
  TAM_TRU: { label: 'Tạm trú', color: 'bg-green-100 text-green-800' },
  TAM_VANG: { label: 'Tạm vắng', color: 'bg-yellow-100 text-yellow-800' },
  DA_KHAI_TU: { label: 'Đã khai tử', color: 'bg-red-100 text-red-800' }
};

const getStatusBadge = (status) => STATUS_BADGES[status] || { label: 'Chưa xác định', color: 'bg-gray-100 text-gray-800' };
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-');

const CitizenDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // State cho thông báo
  
  // Modal visibility state
  const [showTamVang, setShowTamVang] = useState(false);
  const [showTamTru, setShowTamTru] = useState(false);
  const [showKhaiTu, setShowKhaiTu] = useState(false);
  
  // Detect "new" mode từ pathname
  const isNew = location.pathname === '/citizen/new';
  
  const {
    data: citizen,
    loading,
    error,
    handleApi
  } = useApiHandler(null);

  const normalizedCitizen = useMemo(() => (
    citizen ? { ...citizen, trangThaiHienTai: deriveCitizenStatus(citizen) } : null
  ), [citizen]);

  const emitCitizenRefresh = useCallback(() => {
    window.dispatchEvent(new Event(CITIZEN_REFRESH_EVENT));
  }, []);

  const fetchCitizen = useCallback(async () => {
    if (isNew) return; // Khi tạo mới, không cần fetch
    await handleApi(
      () => citizenApi.getById(id),
      'Không thể tải thông tin nhân khẩu'
    );
  }, [handleApi, id, isNew]);

  const refreshCitizenAndBroadcast = useCallback(async () => {
    await fetchCitizen();
    emitCitizenRefresh();
  }, [emitCitizenRefresh, fetchCitizen]);

  useEffect(() => {
    fetchCitizen();
  }, [fetchCitizen]);

  const handleSubmit = async (formValues) => {
    try {
      const result = await handleApi(
        () => (isNew ? citizenApi.create(formValues) : citizenApi.update(id, formValues)),
        'Không thể lưu thông tin nhân khẩu'
      );

      if (!result.success) {
        const error = new Error(result.message || 'Không thể lưu thông tin nhân khẩu');
        error.status = result.status;
        throw error;
      }

      const successMessage = isNew ? 'Thêm nhân khẩu thành công!' : 'Cập nhật nhân khẩu thành công!';
      setToast({ type: 'success', message: successMessage });
      emitCitizenRefresh();

      if (isNew) {
        setTimeout(() => {
          navigate('/citizen');
        }, 2000);
      } else {
        await fetchCitizen();
      }

      return result.data;
    } catch (err) {
      console.error('Submit error:', err);
      const message = err.response?.data?.message || err.message || 'Lỗi khi lưu dữ liệu';
      setToast({ type: 'error', message });
      throw err;
    }
  };

  // Auto close toast sau 3 giây
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading && !isNew) return <Loader />;
  if (error && !isNew) return <ErrorMessage message={error} onRetry={fetchCitizen} />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <button
          onClick={() => navigate('/citizen')}
          className="hover:text-blue-600 transition-colors"
        >
          Quản lý nhân khẩu
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">
          {isNew ? 'Thêm nhân khẩu mới' : `Chi tiết - ${normalizedCitizen?.hoTen || 'Đang tải...'}`}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isNew ? 'Thêm nhân khẩu mới' : 'Chi tiết nhân khẩu'}
          </h1>
          {!isNew && normalizedCitizen && (
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID: {normalizedCitizen.id}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Hộ khẩu: {normalizedCitizen.hoKhauId ?? '-'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                Quan hệ: {normalizedCitizen.quanHeChuHo || '-'}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Trạng thái:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(normalizedCitizen.trangThaiHienTai).color}`}>
                  {getStatusBadge(normalizedCitizen.trangThaiHienTai).label}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Action buttons - Only show when viewing existing citizen */}
          {!isNew && normalizedCitizen && (
            <>
              <button
                onClick={() => setShowTamVang(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tạm vắng
              </button>
              <button
                onClick={() => setShowTamTru(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tạm trú
              </button>
              <button
                onClick={() => setShowKhaiTu(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Khai tử
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/citizen')}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách
          </button>
        </div>
      </div>

      {!isNew && normalizedCitizen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'CMND/CCCD', value: normalizedCitizen.cmndCccd || 'Chưa cấp' },
            { label: 'Ngày cấp', value: formatDate(normalizedCitizen.ngayCap) },
            { label: 'Nơi cấp', value: normalizedCitizen.cmndCccd ? (normalizedCitizen.noiCap || '-') : 'Chưa cấp' }
          ].map((item) => (
            <div key={item.label} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Form card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <CitizenForm 
          initialValues={normalizedCitizen}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Modals - Only render when citizen data is loaded */}
      {!isNew && normalizedCitizen && (
        <>
          <TamVangModal
            isOpen={showTamVang}
            onClose={() => setShowTamVang(false)}
            citizen={normalizedCitizen}
            onSuccess={refreshCitizenAndBroadcast}
          />

          <TamTruModal
            isOpen={showTamTru}
            onClose={() => setShowTamTru(false)}
            citizen={normalizedCitizen}
            onSuccess={refreshCitizenAndBroadcast}
          />

          <KhaiTuModal
            isOpen={showKhaiTu}
            onClose={() => setShowKhaiTu(false)}
            citizen={normalizedCitizen}
            onSuccess={refreshCitizenAndBroadcast}
          />
        </>
      )}
    </div>
  );
};

export default CitizenDetail;