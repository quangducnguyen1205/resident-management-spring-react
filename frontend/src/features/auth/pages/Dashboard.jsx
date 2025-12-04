import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CitizenStats from "../../citizen/components/CitizenStats";
import FeeStats from "../../fee-collection/components/FeeStats";
import citizenApi from "../../../api/citizenApi";
import feeCollectionApi from "../../../api/feeCollectionApi";
import Loader from "../../../components/Loader";
import ErrorMessage from "../../../components/ErrorMessage";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    citizen: null,
    feeCollection: null,
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [genderData, ageData, feeData, feeCollectionData] = await Promise.all([
        citizenApi.getGenderStats(),
        citizenApi.getAgeStats(),
        feeCollectionApi.getStats(),
        feeCollectionApi.getAll(),
      ]);

      // Parse Gender Stats từ backend format:
      // { total: 2, byGender: { "Nam": 2, "Nữ": 0 } }
      let genderStats = [];
      const rawGenderStats = genderData?.data || genderData;
      if (rawGenderStats?.byGender) {
        genderStats = Object.entries(rawGenderStats.byGender).map(([name, value]) => ({
          name,
          value
        }));
      }

      // Parse Age Stats từ backend format:
      // { buckets: { thieuNhi: {...}, diLam: {...}, veHuu: {...} } }
      let ageStats = [];
      const rawAgeStats = ageData?.data || ageData;
      if (rawAgeStats?.buckets) {
        ageStats = Object.entries(rawAgeStats.buckets).map(([key, bucket]) => ({
          range: bucket.label || key,
          count: bucket.total || 0,
          byGender: bucket.byGender || {}
        }));
      }

      // Parse Fee Stats từ backend format:
      // { totalRecords: 1, totalCollected: 3000000, totalHouseholds: 1, paidRecords: 1, unpaidRecords: 0 }
      const rawFeeStats = feeData?.data || feeData;
      const allCollections = feeCollectionData?.data || feeCollectionData;
      const feeCollectionStats = [];
      
      if (rawFeeStats || allCollections) {
        const totalHouseholds = rawFeeStats?.totalHouseholds || 0;
        const paidRecords = rawFeeStats?.paidRecords || 0;
        const unpaidRecords = rawFeeStats?.unpaidRecords || 0;

        const isVoluntaryRecord = (record) => record?.loaiThuPhi === 'TU_NGUYEN';
        const getMandatoryAmount = (record) => record?.tongPhi || 0;
        const getVoluntaryAmount = (record) => record?.tongPhiTuNguyen || 0;

        let totalRequired = 0;
        let totalMandatoryCollected = 0;
        let totalVoluntary = 0;

        if (Array.isArray(allCollections)) {
          allCollections.forEach((record) => {
            if (isVoluntaryRecord(record)) {
              totalVoluntary += getVoluntaryAmount(record);
            } else {
              totalRequired += getMandatoryAmount(record);
              if (record.trangThai === 'DA_NOP') {
                totalMandatoryCollected += getMandatoryAmount(record);
              }
            }
          });
        }

        const totalCollected = totalMandatoryCollected + totalVoluntary;
        
        // Chart data: Đã thu vs Chưa thu
        feeCollectionStats.push(
          { name: 'Đã thu', value: paidRecords },
          { name: 'Chưa thu', value: unpaidRecords }
        );
        
        // Stats properties
        feeCollectionStats.totalCollected = totalCollected;
        feeCollectionStats.totalRequired = totalRequired;
        feeCollectionStats.totalVoluntary = totalVoluntary;
        feeCollectionStats.totalHouseholds = totalHouseholds;
        // Tỷ lệ thu: (tổng tiền đã thu / tổng tiền cần thu) * 100
        feeCollectionStats.collectionRate = totalRequired > 0 
          ? Math.round((totalMandatoryCollected / totalRequired) * 100) 
          : 0;
        feeCollectionStats.householdsPaid = paidRecords;
        feeCollectionStats.householdsUnpaid = unpaidRecords;
      }
      

      setStats({
        citizen: {
          genderStats,
          ageStats
        },
        feeCollection: feeCollectionStats,
      });
      
    } catch (err) {
      console.error('Dashboard: Không thể tải thống kê:', err);
      console.error('Dashboard: Error details:', err.response?.data);
      
      // Fallback: Set empty stats để component vẫn render
      setStats({
        citizen: {
          genderStats: [],
          ageStats: []
        },
        feeCollection: [],
      });
      
      setError('Không thể tải thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  // ========== PHẦN CODE MỚI (ĐANG SỬ DỤNG) ==========
  // Helper values for summary cards (safely handle null)
  const totalPeople = stats.citizen?.genderStats?.reduce((s, g) => s + (g.value || 0), 0) ?? 0;
  const totalCollected = stats.feeCollection?.totalCollected ?? 0;
  const collectionRate = stats.feeCollection?.collectionRate ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Top area: greeting + actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
            <p className="text-sm text-gray-600">Xin chào, <span className="font-semibold">{user?.email}</span></p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Trang chủ</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Đăng xuất</button>
          </div>
        </div>

        {/* Sub navigation / quick links (matches Figma: Nav Bar) */}
        <div className="mb-6">
          <nav className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="px-3 py-2 rounded-md bg-teal-100 text-teal-800">Tổng quan</button>
            <button onClick={() => navigate('/citizen')} className="px-3 py-2 rounded-md hover:bg-gray-100">Nhân khẩu</button>
            <button onClick={() => navigate('/fee-collection/stats')} className="px-3 py-2 rounded-md hover:bg-gray-100">Thu phí</button>
            <button onClick={() => navigate('/household')} className="px-3 py-2 rounded-md hover:bg-gray-100">Hộ khẩu</button>
          </nav>
        </div>

        {/* Overview summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Tổng nhân khẩu</div>
            <div className="text-2xl font-bold">{totalPeople}</div>
            <div className="text-xs text-gray-400 mt-2">Cập nhật từ hệ thống</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Tổng tiền đã thu</div>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalCollected)} ₫</div>
            <div className="text-xs text-gray-400 mt-2">Tỷ lệ thu: {collectionRate}%</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex flex-col">
            <div className="text-sm text-gray-500">Hộ đã nộp / Chưa nộp</div>
            <div className="text-2xl font-bold">{stats.feeCollection?.householdsPaid ?? 0} / {stats.feeCollection?.householdsUnpaid ?? 0}</div>
            <div className="text-xs text-gray-400 mt-2">Chi tiết: <button onClick={() => navigate('/fee-collection/stats')} className="text-teal-600 underline">Xem</button></div>
          </div>
        </div>

        {/* Charts grid - each chart is clickable to navigate to detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/citizen')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/citizen'); }}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
            aria-label="Mở chi tiết nhân khẩu"
          >
            <h3 className="text-lg font-semibold mb-4">Nhân khẩu</h3>
            <CitizenStats
              genderStats={stats.citizen?.genderStats}
              ageStats={stats.citizen?.ageStats}
            />
            <div className="text-right mt-2 text-sm text-gray-500">Nhấp để xem chi tiết</div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/fee-collection/stats')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/fee-collection/stats'); }}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
            aria-label="Mở chi tiết thu phí"
          >
            <h3 className="text-lg font-semibold mb-4">Thu phí</h3>
            <FeeStats stats={stats.feeCollection} />
            <div className="text-right mt-2 text-sm text-gray-500">Nhấp để xem chi tiết</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ========== PHẦN CODE CŨ (ĐÃ COMMENT) ==========
  // Layout cũ - Centered card với hai buttons
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Xin chào,{" "}
          <span className="font-semibold">{user?.email}</span> 👋
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Trang chủ
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h1>

        <div className="grid gap-6">
          <CitizenStats
            genderStats={stats.citizen?.genderStats}
            ageStats={stats.citizen?.ageStats}
          />

          <FeeStats stats={stats.feeCollection} />
        </div>
      </div>
    </div>
  );
  */
}
