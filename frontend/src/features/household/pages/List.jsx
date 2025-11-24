import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import householdApi from '../../../api/householdApi';
import { HouseholdModal } from '../components/HouseholdModal';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';

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
    { key: 'soThanhVien', title: 'Số thành viên' }
  ];

  const fetchHouseholds = async () => {
    await handleApi(
      () => householdApi.getAll(),
      'Không thể tải danh sách hộ khẩu'
    );
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleAdd = () => {
    setSelectedHousehold(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedHousehold(row);
    setIsModalOpen(true);
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
      
      // Save household (create or update)
      await handleApi(
        () => isNew
          ? householdApi.create(data)
          : householdApi.update(selectedHousehold.id, data),
        `Không thể ${isNew ? 'tạo mới' : 'cập nhật'} hộ khẩu`
      );
      
      // Show success message
      alert(`${isNew ? 'Tạo mới' : 'Cập nhật'} hộ khẩu thành công!`);
      
      // CRITICAL: Fetch list to refresh - never set result object to households array
      await fetchHouseholds();
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
      household.diaChi?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHouseholds} />;

  // Debug log to ensure households is an array
  console.log('Households in List:', households, 'Type:', Array.isArray(households) ? 'Array' : typeof households);

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