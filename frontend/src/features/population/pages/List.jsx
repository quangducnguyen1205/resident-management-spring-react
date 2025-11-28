import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import populationApi, { BIEN_DONG_TYPES } from '../../../api/populationApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const CUSTOM_TYPE_LABELS = {
  CHUYEN_DEN: 'Chuyển đến',
  CHUYEN_DI: 'Chuyển đi',
  TACH_HO: 'Tách hộ',
  NHAP_HO: 'Nhập hộ',
  SINH: 'Khai sinh',
  KHAI_TU: 'Khai tử',
  THAY_DOI_THONG_TIN: 'Thay đổi thông tin',
  TAM_TRU: 'Đăng ký tạm trú',
  HUY_TAM_TRU: 'Huỷ tạm trú',
  TAM_VANG: 'Đăng ký tạm vắng',
  HUY_TAM_VANG: 'Huỷ tạm vắng'
};

const BIEN_DONG_LABELS = BIEN_DONG_TYPES.reduce((acc, type) => {
  acc[type] = CUSTOM_TYPE_LABELS[type] || type.replace(/_/g, ' ');
  return acc;
}, {});

const formatBienDongType = (type) => BIEN_DONG_LABELS[type] || type?.replace(/_/g, ' ') || '-';
const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('vi-VN');
};

const PopulationList = () => {
  const navigate = useNavigate();
  const {
    data: changes,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  const columns = [
    {
      key: 'loai',
      title: 'Loại biến động',
      render: (value) => formatBienDongType(value)
    },
    {
      key: 'noiDung',
      title: 'Nội dung',
      render: (value) => value || '-'
    },
    {
      key: 'thoiGian',
      title: 'Thời gian',
      render: (value) => formatDateTime(value)
    },
    {
      key: 'hoKhauId',
      title: 'Hộ khẩu',
      render: (value) => value ?? '-'
    },
    {
      key: 'nhanKhauId',
      title: 'Nhân khẩu',
      render: (value) => value ?? '-'
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

  const changeList = Array.isArray(changes) ? [...changes] : [];
  changeList.sort((a, b) => {
    const dateA = a?.thoiGian ? new Date(a.thoiGian).getTime() : 0;
    const dateB = b?.thoiGian ? new Date(b.thoiGian).getTime() : 0;
    return dateB - dateA;
  });

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
          data={changeList}
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