import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import populationApi from '../../../api/populationApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const PopulationList = () => {
  const navigate = useNavigate();
  const {
    data: changes,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  const columns = [
    { key: 'loaiBienDong', title: 'Loại biến động' },
    { key: 'ngayBienDong', title: 'Ngày biến động' },
    { key: 'noiDung', title: 'Nội dung' },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'DA_DUYET' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'DA_DUYET' ? 'Đã duyệt' : 'Chờ duyệt'}
        </span>
      )
    }
  ];

  const fetchChanges = async () => {
    await handleApi(
      () => populationApi.getAll(),
      'Không thể tải danh sách biến động'
    );
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const handleAdd = () => navigate('/population/new');
  const handleEdit = (row) => navigate(`/population/${row.id}`);
  const handleView = (row) => navigate(`/population/${row.id}`);
  const handleDelete = async (row) => {
    if (!window.confirm('Xác nhận xóa biến động này?')) return;
    try {
      await handleApi(
        () => populationApi.delete(row.id),
        'Không thể xóa biến động'
      );
      await fetchChanges();
    } catch (err) {}
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchChanges} />;

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Biến động dân cư</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Thêm biến động
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={changes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          basePath="/population"
        />
      </div>
    </div>
  );
};

export default PopulationList;