import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import feeCollectionApi from '../../../api/feeCollectionApi';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import { useAuth } from '../../auth/contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';

const TYPE_LABEL = {
  BAT_BUOC: 'Bắt buộc',
  TU_NGUYEN: 'Tự nguyện'
};

const TYPE_BADGE = {
  BAT_BUOC: 'bg-blue-100 text-blue-700',
  TU_NGUYEN: 'bg-purple-100 text-purple-700'
};

const formatAmount = (item) => (
  item?.loaiThuPhi === 'TU_NGUYEN' ? (item?.tongPhiTuNguyen || 0) : (item?.tongPhi || 0)
);

const Toast = ({ message, type }) => {
  const palette = type === 'error'
    ? 'bg-red-100 border-red-400 text-red-800'
    : 'bg-green-100 border-green-400 text-green-800';

  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border shadow-lg z-50 ${palette}`}>
      <p className="text-sm font-semibold mb-1">{type === 'error' ? 'Lỗi' : 'Thành công'}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
};

const resolveRecordId = (record) => (
  record?.id ?? record?.thuPhiHoKhauId ?? record?.thuPhiId ?? record?.paymentId ?? null
);

const OverviewByPeriod = () => {
  const { dotThuPhiId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [period, setPeriod] = useState(null);
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const canView = user?.role === 'KETOAN';

  const fetchOverview = useCallback(async () => {
    if (!dotThuPhiId) return;
    setLoading(true);
    setError(null);
    try {
      const [periodRes, overviewRes] = await Promise.all([
        feePeriodApi.getById(dotThuPhiId),
        feeCollectionApi.getOverviewByPeriod(dotThuPhiId)
      ]);

      setPeriod(periodRes || null);
      const normalized = Array.isArray(overviewRes) ? overviewRes : [];
      normalized.sort((a, b) => (a?.soHoKhau || '').localeCompare(b?.soHoKhau || '', 'vi', { numeric: true }));
      setOverview(normalized);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  }, [dotThuPhiId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const summary = overview.reduce((acc, item) => {
      const isVoluntary = item.loaiThuPhi === 'TU_NGUYEN';
      const amount = formatAmount(item);

      acc.totalHouseholds += 1;

      if (item.trangThai === 'DA_NOP') acc.paidCount += 1;
      if (item.trangThai === 'CHUA_NOP') acc.unpaidCount += 1;
      if (item.trangThai === 'KHONG_AP_DUNG') acc.notApplied += 1;
      if (item.trangThai !== 'KHONG_AP_DUNG') acc.actionable += 1;

      if (isVoluntary) {
        acc.voluntaryTotal += amount;
      } else {
        acc.mandatoryExpected += item.tongPhi || 0;
        if (item.trangThai === 'DA_NOP') {
          acc.mandatoryCollected += amount;
        }
      }

      return acc;
    }, {
      totalHouseholds: 0,
      actionable: 0,
      paidCount: 0,
      unpaidCount: 0,
      notApplied: 0,
      mandatoryCollected: 0,
      mandatoryExpected: 0,
      voluntaryTotal: 0
    });

    return {
      ...summary,
      totalCollected: summary.mandatoryCollected + summary.voluntaryTotal,
      totalExpected: summary.mandatoryExpected,
      remainingMandatory: Math.max(summary.mandatoryExpected - summary.mandatoryCollected, 0)
    };
  }, [overview]);

  const handleStatusChange = async (record, newStatus) => {
    const recordId = resolveRecordId(record);
    if (!recordId) {
      setToast({ type: 'error', message: 'Không tìm thấy ID khoản thu để cập nhật.' });
      return;
    }
    if (record.trangThai === newStatus) {
      setToast({ type: 'success', message: 'Trạng thái đã đúng như yêu cầu.' });
      return;
    }

    setPendingId(recordId);
    try {
      await feeCollectionApi.update(recordId, { trangThai: newStatus });
      setToast({ type: 'success', message: 'Đã cập nhật trạng thái thanh toán.' });
      await fetchOverview();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Không thể cập nhật trạng thái' });
    } finally {
      setPendingId(null);
    }
  };

  const handleTogglePaid = (record) => {
    if (record?.trangThai === 'KHONG_AP_DUNG') {
      setToast({ type: 'error', message: 'Khoản thu này không áp dụng, không thể cập nhật.' });
      return;
    }
    const nextStatus = record?.trangThai === 'DA_NOP' ? 'CHUA_NOP' : 'DA_NOP';
    handleStatusChange(record, nextStatus);
  };

  if (!canView) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Không có quyền truy cập</h3>
              <p className="text-red-700">
                Chỉ nhân viên <strong>Kế toán</strong> mới có quyền xem tổng quan thu phí theo đợt.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOverview} />;

  const progress = stats.actionable > 0
    ? Math.round((stats.paidCount / stats.actionable) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Tổng quan theo đợt thu phí</h1>
          {period && (
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">{period.tenDot || period.tenDotThu}</span>
              {' '}• {new Date(period.ngayBatDau).toLocaleDateString('vi-VN')}
              {' '}→ {new Date(period.ngayKetThuc).toLocaleDateString('vi-VN')}
              {' '}• Loại: {TYPE_LABEL[period.loai] || 'Không xác định'}
              {period.loai !== 'TU_NGUYEN' && (
                <>
                  {' '}• Định mức: {new Intl.NumberFormat('vi-VN').format(period.dinhMuc || 0)} ₫/người/tháng
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchOverview}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7 7 0 0114 0M19 15a7 7 0 01-14 0" />
              </svg>
              Làm mới
            </button>
          <button
            onClick={() => navigate('/fee-collection')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Quản lý thu phí
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Tổng số hộ</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalHouseholds}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Đã nộp</p>
          <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Chưa nộp</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.unpaidCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
          <p className="text-sm text-gray-600 mb-1">Không áp dụng</p>
          <p className="text-2xl font-bold text-gray-600">{stats.notApplied}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-4 border-2 border-green-500">
          <p className="text-xs text-gray-700 mb-1">Thu bắt buộc</p>
          <p className="text-lg font-bold text-green-700">
            {new Intl.NumberFormat('vi-VN').format(stats.mandatoryCollected || 0)} ₫
          </p>
          <p className="text-xs text-gray-500 mt-1">
            / {new Intl.NumberFormat('vi-VN').format(stats.totalExpected || 0)} ₫ phải thu
          </p>
        </div>
      </div>

      {stats.voluntaryTotal > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg shadow p-4 mb-6">
          <p className="text-xs text-purple-800 mb-1">Đóng góp tự nguyện</p>
          <p className="text-2xl font-bold text-purple-900">{new Intl.NumberFormat('vi-VN').format(stats.voluntaryTotal)} ₫</p>
          <p className="text-xs text-purple-700 mt-1">Tổng số tiền các hộ đã hỗ trợ thêm trong đợt này.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Tiến độ thu phí</h3>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${progress}%` }}
          >
            {stats.paidCount} / {stats.actionable || 0} hộ bắt buộc
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Đã thu: {new Intl.NumberFormat('vi-VN').format(stats.mandatoryCollected || 0)} ₫</span>
          <span>Còn lại: {new Intl.NumberFormat('vi-VN').format(stats.remainingMandatory || 0)} ₫</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">Danh sách hộ khẩu ({overview.length})</h3>
            <p className="text-xs text-gray-500">Cập nhật trạng thái sẽ tự động làm mới bảng</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Số hộ khẩu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Chủ hộ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Số người</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tổng phí</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Ngày thu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 text-center">Đánh dấu</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overview.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Chưa có hộ khẩu nào trong đợt thu phí này.
                  </td>
                </tr>
              )}
              {overview.map((item) => {
                const recordId = resolveRecordId(item);
                const disabled = item.trangThai === 'KHONG_AP_DUNG' || !recordId;
                const isPending = pendingId === recordId;
                const amount = formatAmount(item);
                const isVoluntaryRow = item.loaiThuPhi === 'TU_NGUYEN';
                const typeClass = TYPE_BADGE[item.loaiThuPhi] || 'bg-gray-100 text-gray-700';
                return (
                  <tr key={`${recordId}-${item.soHoKhau}`} className={disabled ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{item.soHoKhau}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.tenChuHo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeClass}`}>
                        {TYPE_LABEL[item.loaiThuPhi] || 'Không xác định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{isVoluntaryRow ? '—' : (item.soNguoi || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700">
                      {new Intl.NumberFormat('vi-VN').format(amount || 0)} ₫
                      {isVoluntaryRow && (
                        <span className="block text-xs text-purple-600">Đóng góp tự nguyện</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.trangThai} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {item.ngayThu ? new Date(item.ngayThu).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {disabled ? (
                        <span className="text-xs text-gray-400">Không áp dụng</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.trangThai === 'DA_NOP'}
                              onChange={() => handleTogglePaid(item)}
                              disabled={isPending}
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              item.trangThai === 'DA_NOP' ? 'translate-x-6' : 'translate-x-0'
                            } ${isPending ? 'opacity-60' : ''}`}></div>
                          </label>
                          <span className={`text-xs font-semibold ${item.trangThai === 'DA_NOP' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {item.trangThai === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp'}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewByPeriod;
