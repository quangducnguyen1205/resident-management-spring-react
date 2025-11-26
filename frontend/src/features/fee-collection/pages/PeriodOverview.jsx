import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import feeCollectionApi from '../../../api/feeCollectionApi';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import { useAuth } from '../../auth/contexts/AuthContext';

/**
 * PeriodOverview - New Page (2025)
 * 
 * Shows all household payments for a specific fee period
 * Route: /fee-collection/period/:id
 * 
 * Displays:
 * - Period information
 * - Summary statistics (total households, paid, unpaid)
 * - Table with all households and their payment status
 */
const PeriodOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [period, setPeriod] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasAccountantRole = user?.role === 'KETOAN';

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [periodRes, collectionsRes] = await Promise.all([
        feePeriodApi.getById(id),
        feeCollectionApi.getByPeriod(id)
      ]);

      setPeriod(periodRes.data);
      
      // Sort by soHoKhau for stable ordering
      const sortedCollections = (collectionsRes.data || []).sort((a, b) => {
        const so1 = a.soHoKhau || '';
        const so2 = b.soHoKhau || '';
        return so1.localeCompare(so2, 'vi', { numeric: true });
      });
      
      setCollections(sortedCollections);
    } catch (err) {
      console.error('Error fetching period overview:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin đợt thu phí');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalHouseholds = collections.length;
  const paidCount = collections.filter(c => c.trangThai === 'DA_NOP').length;
  const unpaidCount = collections.filter(c => c.trangThai === 'CHUA_NOP').length;
  const notApplicableCount = collections.filter(c => c.trangThai === 'KHONG_AP_DUNG').length;
  const totalCollected = collections
    .filter(c => c.trangThai === 'DA_NOP')
    .reduce((sum, c) => sum + (c.tongPhi || 0), 0);
  const totalExpected = collections
    .reduce((sum, c) => sum + (c.tongPhi || 0), 0);

  const columns = [
    { 
      key: 'soHoKhau', 
      title: 'Số hộ khẩu',
      render: (value) => <span className="font-semibold text-gray-800">{value}</span>
    },
    { key: 'tenChuHo', title: 'Chủ hộ' },
    { 
      key: 'soNguoi', 
      title: 'Số người',
      render: (value) => <span className="text-gray-700">{value || 0} người</span>
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
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => {
        if (value === 'DA_NOP') {
          return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Đã nộp
            </span>
          );
        } else if (value === 'CHUA_NOP') {
          return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⏳ Chưa nộp
            </span>
          );
        } else if (value === 'KHONG_AP_DUNG') {
          return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              ➖ Không áp dụng
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      }
    },
    { 
      key: 'ngayThu', 
      title: 'Ngày thu',
      render: (value) => value ? (
        <span className="text-gray-700">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    }
  ];

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  if (!hasAccountantRole) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Không có quyền truy cập</h3>
              <p className="text-red-700">
                Chỉ nhân viên <strong>Kế toán</strong> mới có quyền xem thông tin thu phí.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📊 Tổng quan đợt thu phí
          </h1>
          {period && (
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">{period.tenDot || period.tenDotThu}</span>
              {' '}• {new Date(period.ngayBatDau).toLocaleDateString('vi-VN')} 
              {' '}- {new Date(period.ngayKetThuc).toLocaleDateString('vi-VN')}
              {' '}• Định mức: {new Intl.NumberFormat('vi-VN').format(period.dinhMuc || 0)} ₫/người/tháng
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/fee-collection')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          ← Quay lại
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Tổng số hộ</p>
          <p className="text-2xl font-bold text-blue-600">{totalHouseholds}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Đã nộp</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-1">Chưa nộp</p>
          <p className="text-2xl font-bold text-yellow-600">{unpaidCount}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
          <p className="text-sm text-gray-600 mb-1">Không áp dụng</p>
          <p className="text-2xl font-bold text-gray-600">{notApplicableCount}</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow p-4 border-2 border-green-500">
          <p className="text-xs text-gray-700 mb-1">Tổng thu</p>
          <p className="text-lg font-bold text-green-700">
            {new Intl.NumberFormat('vi-VN').format(totalCollected)} ₫
          </p>
          <p className="text-xs text-gray-500 mt-1">
            / {new Intl.NumberFormat('vi-VN').format(totalExpected)} ₫
          </p>
        </div>
      </div>

      {/* Collection Rate Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Tiến độ thu phí</h3>
          <span className="text-2xl font-bold text-blue-600">
            {totalHouseholds > 0 ? Math.round((paidCount / totalHouseholds) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold" 
            style={{ width: `${totalHouseholds > 0 ? (paidCount / totalHouseholds) * 100 : 0}%` }}
          >
            {paidCount} / {totalHouseholds} hộ
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Đã thu: {new Intl.NumberFormat('vi-VN').format(totalCollected)} ₫</span>
          <span>Còn lại: {new Intl.NumberFormat('vi-VN').format(totalExpected - totalCollected)} ₫</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">
            Danh sách hộ khẩu ({collections.length})
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={collections}
          loading={loading}
          onView={(row) => navigate(`/fee-collection/${row.id}`)}
          canEdit={false}
          canDelete={false}
        />
      </div>
    </div>
  );
};

export default PeriodOverview;
