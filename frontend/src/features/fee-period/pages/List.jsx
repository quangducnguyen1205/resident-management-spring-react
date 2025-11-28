import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';
import { useAuth } from '../../auth/contexts/AuthContext';

const FeePeriodList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: periods,
    loading,
    error,
    handleApi
  } = useApiHandler([]);
  
  // KETOAN and ADMIN can modify fee periods, TOTRUONG can only view
  const canModifyFeePeriod = user?.role === 'ADMIN' || user?.role === 'KETOAN';

  const navigateToRecords = (row) => {
    if (row?.id === undefined || row?.id === null || row?.id === '') {
      alert('Lỗi: ID không hợp lệ');
      return;
    }
    navigate(`/fee-collection/overview/${row.id}`);
  };

  const columns = [
    { key: 'tenDot', title: 'Tên đợt thu' },
    {
      key: 'loai',
      title: 'Loại phí',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'BAT_BUOC' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {value === 'BAT_BUOC' ? 'Bắt buộc' : 'Tự nguyện'}
        </span>
      )
    },
    { key: 'ngayBatDau', title: 'Ngày bắt đầu' },
    { key: 'ngayKetThuc', title: 'Ngày kết thúc' },
    {
      key: 'dinhMuc',
      title: 'Định mức (VND)',
      render: (value) => value ? new Intl.NumberFormat('vi-VN').format(value) : '0'
    },
    {
      key: 'records',
      title: 'Khoản thu',
      render: (_, row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            navigateToRecords(row);
          }}
          className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
        >
          Xem chi tiết
        </button>
      )
    }
  ];

  const fetchPeriods = async () => {
    const result = await handleApi(
      () => feePeriodApi.getAll(),
      'Không thể tải danh sách đợt thu phí'
    );
    console.log('Fee periods fetched:', result);
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAdd = () => navigate('/fee-period/new');
  
  const handleEdit = (row) => {
    if (row?.id === undefined || row?.id === null || row?.id === '') {
      alert('Lỗi: ID không hợp lệ');
      return;
    }
    navigate(`/fee-period/${row.id}`);
  };
  
  const handleView = handleEdit;
  
  const handleDelete = async (row) => {
    if (row?.id === undefined || row?.id === null || row?.id === '') {
      alert('Lỗi: ID không hợp lệ');
      return;
    }
    if (!window.confirm('Xác nhận xóa đợt thu phí này?')) return;
    try {
      await handleApi(
        () => feePeriodApi.delete(row.id),
        'Không thể xóa đợt thu phí'
      );
      await fetchPeriods();
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPeriods} />;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đợt thu phí</h1>
        {canModifyFeePeriod && (
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Tạo đợt thu phí
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={periods}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          basePath="/fee-period"
          canEdit={canModifyFeePeriod}
          canDelete={canModifyFeePeriod}
        />
      </div>
    </div>
  );
};

export default FeePeriodList;