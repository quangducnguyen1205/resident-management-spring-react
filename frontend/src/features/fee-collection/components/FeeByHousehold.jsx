import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';

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
        setCollections(response.data);
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
      render: (value) => {
        if (value === 'DA_NOP') {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              ✅ Đã nộp
            </span>
          );
        } else if (value === 'CHUA_NOP') {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              ⏳ Chưa nộp
            </span>
          );
        } else if (value === 'KHONG_AP_DUNG') {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
              ➖ Không áp dụng
            </span>
          );
        }
        return '-';
      }
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