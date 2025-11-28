import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import householdApi from '../../../api/householdApi';
import { HouseholdModal } from '../components/HouseholdModal';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';

const HOUSEHOLD_REFRESH_EVENT = 'household:refresh';

const RESIDENT_STATUS_BADGES = {
  THUONG_TRU: { label: 'Thường trú', color: 'bg-gray-100 text-gray-800' },
  TAM_TRU: { label: 'Tạm trú', color: 'bg-green-100 text-green-800' },
  TAM_VANG: { label: 'Tạm vắng', color: 'bg-yellow-100 text-yellow-800' },
  DA_KHAI_TU: { label: 'Đã khai tử', color: 'bg-red-100 text-red-800' }
};

const getResidentBadge = (status) => RESIDENT_STATUS_BADGES[status] || { label: 'Chưa xác định', color: 'bg-gray-100 text-gray-800' };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-');

const HouseholdList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: households,
    loading,
    error,
    handleApi
  } = useApiHandler([]);
  
  // TOTRUONG and ADMIN can modify households, KETOAN can only view
  const canModifyHousehold = user?.role === 'ADMIN' || user?.role === 'TOTRUONG';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'soHoKhau', title: 'Số hộ khẩu' },
    { key: 'tenChuHo', title: 'Tên chủ hộ' },
    { key: 'diaChi', title: 'Địa chỉ' },
    {
      key: 'ngayTao',
      title: 'Ngày tạo',
      render: (value) => formatDate(value)
    },
    {
      key: 'soThanhVien',
      title: 'Số thành viên',
      render: (value, row) => value ?? row?.listNhanKhau?.length ?? 0
    },
    {
      key: 'listNhanKhau',
      title: 'Nhân khẩu',
      render: (value = []) => {
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-sm text-gray-500">Chưa có nhân khẩu</span>;
        }

        const preview = value.slice(0, 3);
        const remaining = value.length - preview.length;

        return (
          <div className="space-y-1">
            {preview.map((resident) => {
              const badge = getResidentBadge(resident.trangThaiHienTai);
              return (
                <div key={resident.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-800">{resident.hoTen}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
            {remaining > 0 && (
              <span className="text-xs text-gray-500">+{remaining} nhân khẩu khác</span>
            )}
          </div>
        );
      }
    }
  ];

  const fetchHouseholds = useCallback(async () => {
    await handleApi(
      () => householdApi.getAll(),
      'Không thể tải danh sách hộ khẩu'
    );
  }, [handleApi]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  useEffect(() => {
    const handleRefreshEvent = () => {
      fetchHouseholds();
    };
    window.addEventListener(HOUSEHOLD_REFRESH_EVENT, handleRefreshEvent);
    return () => window.removeEventListener(HOUSEHOLD_REFRESH_EVENT, handleRefreshEvent);
  }, [fetchHouseholds]);

  const handleAdd = () => {
    setSelectedHousehold(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (row) => {
    if (!row?.id) return;
    setSelectedHousehold(row);
    setIsModalOpen(true);
    try {
      const freshData = await householdApi.getById(row.id);
      setSelectedHousehold(freshData);
    } catch (err) {
      console.error('Không thể tải chi tiết hộ khẩu:', err);
      alert('Không thể tải dữ liệu hộ khẩu. Vui lòng thử lại.');
    }
  };

  const handleView = (row) => navigate(`/household/${row.id}`);

  const handleDelete = async (row) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hộ khẩu "${row.soHoKhau}" - ${row.tenChuHo}?`)) return;
    try {
      await handleApi(
        () => householdApi.delete(row.id),
        'Không thể xóa hộ khẩu'
      );
      
      // Show success message
      alert('Xóa hộ khẩu thành công!');
      
      await fetchHouseholds();
      window.dispatchEvent(new Event(HOUSEHOLD_REFRESH_EVENT));
    } catch (err) {
      // Error is handled by handleApi
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedHousehold(null);
  };

  const handleModalSave = async (data) => {
    try {
      const isNew = !selectedHousehold;
      const normalized = {
        soHoKhau: data.soHoKhau?.trim() || '',
        tenChuHo: data.tenChuHo?.trim() || '',
        diaChi: data.diaChi?.trim() || ''
      };
      
      // Save household (create or update)
      await handleApi(
        () => isNew
          ? householdApi.create(normalized)
          : householdApi.update(selectedHousehold.id, {
              tenChuHo: normalized.tenChuHo,
              diaChi: normalized.diaChi
            }),
        `Không thể ${isNew ? 'tạo mới' : 'cập nhật'} hộ khẩu`
      );
      
      // Show success message
      alert(`${isNew ? 'Tạo mới' : 'Cập nhật'} hộ khẩu thành công!`);
      
      // CRITICAL: Fetch list to refresh - never set result object to households array
      await fetchHouseholds();
      window.dispatchEvent(new Event(HOUSEHOLD_REFRESH_EVENT));
      handleModalClose();
    } catch (err) {
      // Error is handled by handleApi
    }
  };

  // Filter households by search term
  // CRITICAL: Ensure households is always an array to prevent .filter() crash
  const safeHouseholds = Array.isArray(households) ? households : [];
  const filteredHouseholds = safeHouseholds.filter(household => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      household.soHoKhau?.toLowerCase().includes(search) ||
      household.tenChuHo?.toLowerCase().includes(search) ||
      household.diaChi?.toLowerCase().includes(search) ||
      household.listNhanKhau?.some((resident) =>
        resident?.hoTen?.toLowerCase().includes(search) ||
        resident?.cmndCccd?.toLowerCase().includes(search)
      )
    );
  });

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHouseholds} />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header với title và actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý hộ khẩu</h1>
            <p className="text-sm text-gray-600 mt-1">
              Tổng số: <span className="font-semibold text-blue-600">{safeHouseholds.length}</span> hộ khẩu
            </p>
          </div>
          {canModifyHousehold && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm hộ khẩu
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo số hộ khẩu, tên chủ hộ, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Tìm thấy <span className="font-semibold text-blue-600">{filteredHouseholds.length}</span> kết quả
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredHouseholds}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          basePath="/household"
          canEdit={canModifyHousehold}
          canDelete={canModifyHousehold}
        />
      </div>

      <HouseholdModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        household={selectedHousehold}
      />
    </div>
  );
};

export default HouseholdList;