import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const FeePeriodList = () => {
  const navigate = useNavigate();
  const {
    data: periods,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  const columns = [
    { key: 'tenDotThu', title: 'Tên đợt thu' },
    { key: 'ngayBatDau', title: 'Ngày bắt đầu' },
    { key: 'ngayKetThuc', title: 'Ngày kết thúc' },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'DANG_THU' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'DANG_THU' ? 'Đang thu' : 'Kết thúc'}
        </span>
      )
    }
  ];

  const fetchPeriods = async () => {
    await handleApi(
      () => feePeriodApi.getAll(),
      'Không thể tải danh sách đợt thu phí'
    );
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAdd = () => navigate('/fee-period/new');
  const handleEdit = (row) => navigate(`/fee-period/${row.id}`);
  const handleView = (row) => navigate(`/fee-period/${row.id}`);
  const handleDelete = async (row) => {
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
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Tạo đợt thu phí
        </button>
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
        />
      </div>
    </div>
  );
};

export default FeePeriodList;