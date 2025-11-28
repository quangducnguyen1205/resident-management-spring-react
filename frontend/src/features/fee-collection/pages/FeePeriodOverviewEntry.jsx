import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dotThuPhiApi, { LOAI_THU_PHI } from '../../../api/dotThuPhiApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const LOAI_LABELS = {
  BAT_BUOC: 'Bắt buộc',
  TU_NGUYEN: 'Tự nguyện'
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-');
const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

const FeePeriodOverviewEntry = () => {
  const navigate = useNavigate();
  const {
    data: feePeriods,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  useEffect(() => {
    handleApi(
      () => dotThuPhiApi.getAll(),
      'Không thể tải danh sách đợt thu phí'
    );
  }, [handleApi]);

  const handleViewOverview = (dotThuPhiId) => {
    if (!dotThuPhiId) return;
    navigate(`/fee-collection/overview/${dotThuPhiId}`);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={() => handleApi(() => dotThuPhiApi.getAll(), 'Không thể tải danh sách đợt thu phí')} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📌 Tổng hợp theo đợt thu</h1>
          <p className="text-sm text-gray-600 mt-1">
            Chọn một đợt thu phí để xem tổng quan tình trạng đóng góp của từng hộ khẩu.
          </p>
        </div>
        <button
          onClick={() => handleApi(() => dotThuPhiApi.getAll(), 'Không thể tải danh sách đợt thu phí')}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7 7 0 0114 0M19 15a7 7 0 01-14 0" />
          </svg>
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tên đợt thu</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Định mức mặc định</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(!feePeriods || feePeriods.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Chưa có đợt thu phí nào.
                </td>
              </tr>
            )}
            {Array.isArray(feePeriods) && feePeriods.map((period) => (
              <tr key={period.id}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{period.tenDot || 'Chưa đặt tên'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${period.loai === 'BAT_BUOC' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {LOAI_LABELS[period.loai] || period.loai || LOAI_THU_PHI[0]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(period.ngayBatDau)} → {formatDate(period.ngayKetThuc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                  {formatMoney(period.dinhMuc)} ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleViewOverview(period.id)}
                    className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Xem tổng hợp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeePeriodOverviewEntry;
