import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';
import StatusBadge from './StatusBadge';

const TYPE_META = {
  BAT_BUOC: { label: 'Bắt buộc', color: 'text-blue-700' },
  TU_NGUYEN: { label: 'Tự nguyện', color: 'text-purple-700' }
};

const formatAmount = (row) => (
  row?.loaiThuPhi === 'TU_NGUYEN' ? row?.tongPhiTuNguyen : row?.tongPhi
);

/**
 * FeeByHousehold - Refactored 2025
 * 
 * Shows fee collection history for a specific household
 * Updated to match new backend response format
 */
const FeeByHousehold = ({ householdId }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const response = await feeCollectionApi.getByHousehold(householdId);
        setCollections(response);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
      setLoading(false);
    };

    if (householdId) {
      fetchCollections();
    }
  }, [householdId]);

  const columns = [
    { key: 'tenDot', title: 'Đợt thu' },
    {
      key: 'loaiThuPhi',
      title: 'Loại',
      render: (value) => {
        const meta = TYPE_META[value] || { label: 'Khác', color: 'text-gray-600' };
        return <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>;
      }
    },
    { 
      key: 'soNguoi', 
      title: 'Số người',
      render: (value, row) => row?.loaiThuPhi === 'TU_NGUYEN' ? '—' : `${value || 0} người`
    },
    { 
      key: 'tongPhi', 
      title: 'Tổng phí',
      render: (value, row) => (
        <span className="font-semibold text-blue-700">
          {new Intl.NumberFormat('vi-VN').format(formatAmount(row) || 0)} ₫
        </span>
      )
    },
    { 
      key: 'ngayThu', 
      title: 'Ngày thu',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => <StatusBadge status={value} size="sm" />
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Lịch sử thu phí</h3>
      <DataTable
        columns={columns}
        data={collections}
        loading={loading}
      />
    </div>
  );
};

export default FeeByHousehold;