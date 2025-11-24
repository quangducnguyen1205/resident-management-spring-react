import React, { useState } from 'react';
import TamTruForm from './TamTruForm';
import citizenApi from '../../../api/citizenApi';

const TamTruModal = ({ isOpen, onClose, citizen, onSuccess }) => {
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (data) => {
    try {
      setError('');
      // Convert dates to YYYY-MM-DD format for backend
      const payload = {
        ngayBatDau: data.ngayBatDau,
        ngayKetThuc: data.ngayKetThuc,
        lyDo: data.lyDo
      };
      
      await citizenApi.updateTamTru(citizen.id, payload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error registering temporary residence:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Không thể đăng ký tạm trú. Vui lòng thử lại.'
      );
    }
  };

  const handleCancel = async () => {
    if (!citizen.tamTruTu) {
      onClose();
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn hủy đăng ký tạm trú?')) {
      try {
        setError('');
        await citizenApi.deleteTamTru(citizen.id);
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } catch (err) {
        console.error('Error canceling temporary residence:', err);
        setError(
          err.response?.data?.message ||
          err.response?.data ||
          'Không thể hủy tạm trú. Vui lòng thử lại.'
        );
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Quản lý tạm trú
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {citizen.hoTen} - {citizen.cmndCccd || 'Chưa có CMND/CCCD'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Current status display */}
          {citizen.tamTruTu && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Đã đăng ký tạm trú
                  </h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <span className="font-medium">Từ ngày:</span> {formatDate(citizen.tamTruTu)}
                    </p>
                    <p>
                      <span className="font-medium">Đến ngày:</span> {formatDate(citizen.tamTruDen)}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Hủy đăng ký tạm trú
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông tin về tạm trú
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Tạm trú là việc công dân cư trú tại nơi khác ngoài nơi đăng ký thường trú trong thời gian nhất định</li>
              <li>Ngày bắt đầu phải là ngày hiện tại hoặc trong tương lai</li>
              <li>Ngày kết thúc phải sau ngày bắt đầu</li>
              <li>Lý do tạm trú cần mô tả rõ ràng (ví dụ: làm việc, học tập, điều trị)</li>
            </ul>
          </div>

          {/* Form */}
          <TamTruForm
            initialValues={
              citizen.tamTruTu
                ? {
                    ngayBatDau: citizen.tamTruTu?.split('T')[0],
                    ngayKetThuc: citizen.tamTruDen?.split('T')[0],
                    lyDo: ''
                  }
                : null
            }
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TamTruModal;
