import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CitizenForm } from '../components/CitizenForm';
import citizenApi from '../../../api/citizenApi';
import householdApi from '../../../api/householdApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import TamVangModal from '../components/TamVangModal';
import TamTruModal from '../components/TamTruModal';
import KhaiTuModal from '../components/KhaiTuModal';

const CitizenDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // State cho thông báo
  const [householdOptions, setHouseholdOptions] = useState([]); // Danh sách hộ khẩu
  
  // Modal visibility state
  const [showTamVang, setShowTamVang] = useState(false);
  const [showTamTru, setShowTamTru] = useState(false);
  const [showKhaiTu, setShowKhaiTu] = useState(false);
  
  // Detect "new" mode từ pathname
  const isNew = location.pathname === '/citizen/new';
  
  // DEBUG: Log param và pathname
  console.log('CitizenDetail mounted with id:', id, 'pathname:', location.pathname);
  console.log('isNew:', isNew);
  
  const {
    data: citizen,
    loading,
    error,
    handleApi
  } = useApiHandler(null);

  const fetchCitizen = async () => {
    if (isNew) return; // Khi tạo mới, không cần fetch
    await handleApi(
      () => citizenApi.getById(id),
      'Không thể tải thông tin nhân khẩu'
    );
  };

  const fetchHouseholds = async () => {
    try {
      const response = await householdApi.getAll();
      const households = Array.isArray(response.data) ? response.data : response.data?.data || [];
      // Transform thành options format - using chuHo (household head name) as label
      const options = households.map(h => ({
        value: h.id,
        label: h.chuHo || `Hộ ${h.maHoKhau || h.id}`
      }));
      setHouseholdOptions(options);
      console.log('Loaded household options:', options);
    } catch (err) {
      console.error('Lỗi tải danh sách hộ khẩu:', err);
    }
  };

  useEffect(() => {
    fetchCitizen();
    fetchHouseholds(); // Load household list khi component mount
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      // Dùng isNew thay vì (id === 'new')
      await handleApi(
        () => isNew ? citizenApi.create(data) : citizenApi.update(id, data),
        'Không thể lưu thông tin nhân khẩu'
      );
      
      // Hiển thị thông báo thành công
      const message = isNew ? 'Thêm nhân khẩu thành công!' : 'Cập nhật nhân khẩu thành công!';
      setToast({
        type: 'success',
        message: message
      });
      
      // Tự động quay lại sau 2 giây
      setTimeout(() => {
        navigate('/citizen');
      }, 2000);
    } catch (err) {
      // Log chi tiết lỗi từ backend
      console.error('Submit error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Hiển thị thông báo lỗi
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi lưu dữ liệu'
      });
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
          {isNew ? 'Thêm nhân khẩu mới' : `Chi tiết - ${citizen?.hoTen || 'Đang tải...'}`}
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
          {!isNew && citizen && (
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID: {citizen.id}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                CMND/CCCD: {citizen.cmndCccd || '-'}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Action buttons - Only show when viewing existing citizen */}
          {!isNew && citizen && (
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
      
      {/* Form card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <CitizenForm 
          initialValues={citizen}
          onSubmit={handleSubmit}
          householdOptions={householdOptions}
        />
      </div>

      {/* Modals - Only render when citizen data is loaded */}
      {!isNew && citizen && (
        <>
          <TamVangModal
            isOpen={showTamVang}
            onClose={() => setShowTamVang(false)}
            citizen={citizen}
            onSuccess={fetchCitizen}
          />

          <TamTruModal
            isOpen={showTamTru}
            onClose={() => setShowTamTru(false)}
            citizen={citizen}
            onSuccess={fetchCitizen}
          />

          <KhaiTuModal
            isOpen={showKhaiTu}
            onClose={() => setShowKhaiTu(false)}
            citizen={citizen}
            onSuccess={fetchCitizen}
          />
        </>
      )}
    </div>
  );
};

export default CitizenDetail;