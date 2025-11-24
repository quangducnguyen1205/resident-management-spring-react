import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';

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
    { key: 'tenDotThu', title: 'Đợt thu' },
    { key: 'soTien', title: 'Số tiền' },
    { key: 'ngayThu', title: 'Ngày thu' },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'DA_NOP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp'}
        </span>
      )
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