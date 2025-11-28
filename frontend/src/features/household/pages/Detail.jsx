import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HouseholdForm } from '../components/HouseholdForm';
import FeeByHousehold from '../../fee-collection/components/FeeByHousehold';
import householdApi from '../../../api/householdApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const HOUSEHOLD_REFRESH_EVENT = 'household:refresh';

const RESIDENT_STATUS_BADGES = {
  THUONG_TRU: { label: 'Thường trú', color: 'bg-gray-100 text-gray-800' },
  TAM_TRU: { label: 'Tạm trú', color: 'bg-green-100 text-green-800' },
  TAM_VANG: { label: 'Tạm vắng', color: 'bg-yellow-100 text-yellow-800' },
  DA_KHAI_TU: { label: 'Đã khai tử', color: 'bg-red-100 text-red-800' }
};

const getResidentBadge = (status) => RESIDENT_STATUS_BADGES[status] || { label: 'Chưa xác định', color: 'bg-gray-100 text-gray-800' };
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-');

const HouseholdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: household,
    loading,
    error,
    handleApi,
    setData
  } = useApiHandler(null);

  const fetchHousehold = useCallback(async () => {
    if (id === 'new') {
      setData(null);
      return;
    }
    await handleApi(
      () => householdApi.getById(id),
      'Không thể tải thông tin hộ khẩu'
    );
  }, [handleApi, id, setData]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const handleSubmit = async (data) => {
    try {
      const isNew = id === 'new';
      const normalized = {
        soHoKhau: data.soHoKhau?.trim() || '',
        tenChuHo: data.tenChuHo?.trim() || '',
        diaChi: data.diaChi?.trim() || ''
      };
      
      // Save household (create or update)
      await handleApi(
        () => isNew
          ? householdApi.create(normalized)
          : householdApi.update(id, {
              tenChuHo: normalized.tenChuHo,
              diaChi: normalized.diaChi
            }),
        `Không thể ${isNew ? 'tạo mới' : 'cập nhật'} thông tin hộ khẩu`
      );
      
      // Show success message
      alert(`${isNew ? 'Tạo mới' : 'Cập nhật'} hộ khẩu thành công!`);
      window.dispatchEvent(new Event(HOUSEHOLD_REFRESH_EVENT));
      
      // CRITICAL: Only navigate - let List page fetch the array
      navigate('/household');
    } catch (err) {
      // Error is handled by handleApi
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHousehold} />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <nav className="flex text-sm text-gray-600">
          <button onClick={() => navigate('/household')} className="hover:text-blue-600 transition">
            Quản lý hộ khẩu
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">
            {id === 'new' ? 'Thêm mới' : `${household?.soHoKhau || 'Chi tiết'}`}
          </span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {id === 'new' ? 'Thêm hộ khẩu mới' : 'Chi tiết hộ khẩu'}
          </h1>
          {household && id !== 'new' && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{household.tenChuHo}</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{household.soThanhVien ?? household.listNhanKhau?.length ?? 0} thành viên</span>
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Ngày tạo: {formatDate(household.ngayTao)}</span>
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/household')}
          className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="space-y-6">
        {/* Household form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Thông tin hộ khẩu
          </h2>
          <HouseholdForm
            key={household?.id || (id === 'new' ? 'new-household' : 'pending')}
            initialValues={household || undefined}
            onSubmit={handleSubmit}
          />
        </div>

        {id !== 'new' && household && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Danh sách nhân khẩu
            </h2>
            {Array.isArray(household.listNhanKhau) && household.listNhanKhau.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {household.listNhanKhau.map((resident) => {
                  const badge = getResidentBadge(resident.trangThaiHienTai);
                  return (
                    <div key={resident.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{resident.hoTen}</p>
                        <p className="text-sm text-gray-600">Ngày sinh: {formatDate(resident.ngaySinh)}</p>
                        <p className="text-sm text-gray-600">Quan hệ với chủ hộ: {resident.quanHeChuHo || '-'}</p>
                        <p className="text-sm text-gray-600">CMND/CCCD: {resident.cmndCccd || 'Chưa cấp'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={() => navigate(`/citizen/${resident.id}`)}
                          className="text-blue-600 text-sm font-medium hover:underline"
                        >
                          Xem hồ sơ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có nhân khẩu trong hộ khẩu này.</p>
            )}
          </div>
        )}

        {/* Fee collection history */}
        {id !== 'new' && household && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch sử đóng phí
            </h2>
            <FeeByHousehold householdId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdDetail;