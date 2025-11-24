import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';

// Toast Alert Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-800' : 'bg-green-100 border-green-400 text-green-800';
  const icon = type === 'error' ? '❌' : '✅';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg z-50 max-w-md`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-semibold">{type === 'error' ? 'Lỗi' : 'Thành công'}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const FeeCollectionList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // KETOAN and ADMIN can modify fee collections, TOTRUONG can only view
  const canModifyFeeCollection = user?.role === 'ADMIN' || user?.role === 'KETOAN';

  // Check if user has accountant role (Kế toán) - keeping for backward compatibility
  const hasAccountantRole = user?.role === 'KETOAN';

  const {
    data: collections,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  const columns = [
    { key: 'soHoKhau', title: 'Số hộ khẩu' },
    { key: 'tenChuHo', title: 'Chủ hộ' },
    { key: 'tenDot', title: 'Đợt thu' },
    { 
      key: 'tongPhi', 
      title: 'Tổng phí',
      render: (value) => <span className="font-medium text-gray-700">{new Intl.NumberFormat('vi-VN').format(value || 0)} ₫</span>
    },
    { 
      key: 'soTienDaThu', 
      title: 'Đã thu',
      render: (value) => <span className="text-green-600 font-medium">{new Intl.NumberFormat('vi-VN').format(value || 0)} ₫</span>
    },
    { 
      key: 'ngayThu', 
      title: 'Ngày thu',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'DA_NOP' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'DA_NOP' ? '✅ Đủ' : '⏳ Còn thiếu'}
        </span>
      )
    }
  ];

  const fetchCollections = async () => {
    const result = await handleApi(
      () => feeCollectionApi.getAll(),
      'Không thể tải danh sách thu phí'
    );
    // Sort by newest first (ngayThu descending) if data exists
    if (result && Array.isArray(result)) {
      return result.sort((a, b) => {
        // Sort by ngayThu if available, otherwise by id (assuming higher id = newer)
        if (a.ngayThu && b.ngayThu) {
          return new Date(b.ngayThu) - new Date(a.ngayThu);
        }
        return (b.id || 0) - (a.id || 0);
      });
    }
    return result;
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleAdd = () => navigate('/fee-collection/new');
  const handleEdit = (row) => navigate(`/fee-collection/${row.id}`);
  const handleView = (row) => navigate(`/fee-collection/${row.id}`);
  
  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa khoản thu phí cho hộ ${row.soHoKhau}?`)) return;
    try {
      // Delete the record
      await feeCollectionApi.delete(row.id);
      
      setToast({
        type: 'success',
        message: '✅ Xóa khoản thu thành công!'
      });
      
      // Reload the list after successful delete
      await fetchCollections();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa khoản thu';
      
      setToast({
        type: 'error',
        message: `❌ Lỗi: ${errorMessage}`
      });
    }
  };

  // Filter collections by search term
  const filteredCollections = collections.filter(collection => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      collection.soHoKhau?.toLowerCase().includes(search) ||
      collection.tenChuHo?.toLowerCase().includes(search) ||
      collection.tenDot?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCollections} />;

  // Check permission for fee-collection
  if (!hasAccountantRole) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Không có quyền truy cập</h3>
              <p className="text-red-700">
                Chỉ nhân viên <strong>Kế toán</strong> mới có quyền xem và quản lý <strong>Thu Phí Hộ Khẩu</strong>.
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">💰 Quản lý thu phí hộ khẩu</h1>
              <p className="text-sm text-gray-600 mt-1">
                Hiển thị các khoản thu gần đây theo hộ khẩu · 
                <span className="font-semibold text-blue-600">{collections.length}</span> khoản thu phí
              </p>
            </div>
            {canModifyFeeCollection && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thu phí mới
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
                placeholder="Tìm kiếm theo số hộ khẩu, tên chủ hộ, đợt thu..."
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
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCollections}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            basePath="/fee-collection"
            canEdit={canModifyFeeCollection}
            canDelete={canModifyFeeCollection}
          />
        </div>
      </div>
    </>
  );
};

export default FeeCollectionList;