import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';
import StatusBadge from './StatusBadge';

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
      key: 'soNguoi', 
      title: 'Số người',
      render: (value) => `${value || 0} người`
    },
    { 
      key: 'tongPhi', 
      title: 'Tổng phí',
      render: (value) => (
        <span className="font-semibold text-blue-700">
          {new Intl.NumberFormat('vi-VN').format(value || 0)} ₫
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