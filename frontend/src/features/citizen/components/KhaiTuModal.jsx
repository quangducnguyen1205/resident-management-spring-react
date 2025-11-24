import React, { useState } from 'react';
import citizenApi from '../../../api/citizenApi';

const KhaiTuModal = ({ isOpen, onClose, citizen, onSuccess }) => {
  const [lyDo, setLyDo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!lyDo.trim()) {
      setError('Vui lòng nhập lý do tử vong');
      return;
    }

    if (lyDo.trim().length < 10) {
      setError('Lý do tử vong phải có ít nhất 10 ký tự');
      return;
    }

    // Extra confirmation
    const confirmMessage = `⚠️ CẢNH BÁO: Bạn đang khai tử cho:\n\n` +
      `Họ tên: ${citizen.hoTen}\n` +
      `CMND/CCCD: ${citizen.cmndCccd || 'Không có'}\n` +
      `Ngày sinh: ${new Date(citizen.ngaySinh).toLocaleDateString('vi-VN')}\n\n` +
      `Hành động này KHÔNG THỂ HOÀN TÁC!\n\n` +
      `Bạn có chắc chắn muốn tiếp tục?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      
      await citizenApi.updateKhaiTu(citizen.id, { lyDo: lyDo.trim() });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error declaring death:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Không thể khai tử. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-red-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">
              Khai tử
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning banner */}
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-2">
                  ⚠️ CẢNH BÁO: HÀNH ĐỘNG KHÔNG THỂ HOÀN TÁC
                </h3>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Khai tử là việc ghi nhận công dân đã tử vong</li>
                  <li>Sau khi khai tử, thông tin sẽ được đánh dấu vĩnh viễn</li>
                  <li>Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong></li>
                  <li>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Citizen info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Thông tin nhân khẩu</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Họ và tên:</span>
                <p className="font-semibold text-gray-900">{citizen.hoTen}</p>
              </div>
              <div>
                <span className="text-gray-600">Ngày sinh:</span>
                <p className="font-semibold text-gray-900">
                  {new Date(citizen.ngaySinh).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Giới tính:</span>
                <p className="font-semibold text-gray-900">{citizen.gioiTinh}</p>
              </div>
              <div>
                <span className="text-gray-600">CMND/CCCD:</span>
                <p className="font-semibold text-gray-900">{citizen.cmndCccd || 'Không có'}</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Reason input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do tử vong <span className="text-red-500">*</span>
            </label>
            <textarea
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              rows={4}
              required
              minLength={10}
              maxLength={500}
              placeholder="Nhập lý do tử vong (ví dụ: Bệnh tật, tai nạn, tuổi già...)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mô tả nguyên nhân tử vong (tối thiểu 10 ký tự, tối đa 500 ký tự)
            </p>
          </div>

          {/* Info box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Đảm bảo bạn có giấy tờ chứng minh tử vong hợp lệ</li>
              <li>Thông tin khai tử sẽ được lưu vào hệ thống vĩnh viễn</li>
              <li>Sau khi khai tử, nhân khẩu sẽ được đánh dấu là đã tử vong</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !lyDo.trim() || lyDo.trim().length < 10}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Xác nhận khai tử
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KhaiTuModal;
