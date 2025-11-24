import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import citizenApi from '../../../api/citizenApi';
import householdApi from '../../../api/householdApi';
import feeCollectionApi from '../../../api/feeCollectionApi';
import feePeriodApi from '../../../api/feePeriodApi';
import Loader from '../../../components/Loader';

const COLORS = {
  male: '#3B82F6',    // blue
  female: '#EC4899',  // pink
  child: '#10B981',   // green
  working: '#F59E0B', // amber
  retired: '#8B5CF6', // purple
  'Tạm trú': '#10B981',      // green
  'Tạm vắng': '#F59E0B',     // yellow  
  'Thường trú': '#6B7280',   // gray
  'Đã khai tử': '#EF4444'    // red
};

const StatisticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    citizens: null,
    households: null,
    fees: null
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        
        // Fetch citizen statistics
        const [genderStats, ageStats] = await Promise.all([
          citizenApi.getGenderStats(),
          citizenApi.getAgeStats({ underAge: 18, retireAge: 60 })
        ]);

        // Fetch household statistics
        const householdsResponse = await householdApi.getAll();
        const households = householdsResponse.data || [];
        
        const totalHouseholds = households.length;
        const totalMembers = households.reduce((sum, h) => sum + (h.soThanhVien || 0), 0);
        const avgMembers = totalHouseholds > 0 ? (totalMembers / totalHouseholds).toFixed(2) : 0;
        
        // Top 5 households by member count
        const topHouseholds = [...households]
          .sort((a, b) => (b.soThanhVien || 0) - (a.soThanhVien || 0))
          .slice(0, 5);

        // Fetch fee statistics
        const [feePeriodsResponse, feeCollectionsResponse] = await Promise.all([
          feePeriodApi.getAll(),
          feeCollectionApi.getAll()
        ]);
        
        const feePeriods = feePeriodsResponse.data || [];
        const feeCollections = feeCollectionsResponse.data || [];
        
        const totalCollected = feeCollections.reduce((sum, f) => sum + (f.soTienDaThu || 0), 0);
        const totalExpected = feeCollections.reduce((sum, f) => sum + (f.tongPhi || 0), 0);
        const completionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0;
        
        // Outstanding households (where soTienDaThu < tongPhi)
        const outstanding = feeCollections.filter(f => 
          (f.soTienDaThu || 0) < (f.tongPhi || 0)
        );

        // Money collected per fee period
        const collectionsByPeriod = {};
        feeCollections.forEach(fc => {
          const periodId = fc.dotThuPhiId;
          if (!collectionsByPeriod[periodId]) {
            const period = feePeriods.find(p => p.id === periodId);
            collectionsByPeriod[periodId] = {
              name: period?.tenDot || `Đợt ${periodId}`,
              collected: 0,
              expected: 0
            };
          }
          collectionsByPeriod[periodId].collected += (fc.soTienDaThu || 0);
          collectionsByPeriod[periodId].expected += (fc.tongPhi || 0);
        });

        setStats({
          citizens: {
            gender: genderStats.data,
            age: ageStats.data
          },
          households: {
            total: totalHouseholds,
            totalMembers,
            avgMembers,
            topHouseholds
          },
          fees: {
            totalCollected,
            totalExpected,
            completionRate,
            outstanding,
            byPeriod: Object.values(collectionsByPeriod)
          }
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  if (loading) return <Loader />;

  const { citizens, households, fees } = stats;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Thống kê tổng quan
      </h1>

      {/* A. Citizen Statistics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Thống kê nhân khẩu
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Tổng số nhân khẩu</div>
            <div className="text-4xl font-bold">{citizens?.gender?.total || 0}</div>
          </div>

          {citizens?.gender?.byGender && Object.entries(citizens.gender.byGender).map(([gender, count]) => (
            <div key={gender} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-2">{gender}</div>
              <div className="text-3xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-500 mt-1">
                {((count / citizens.gender.total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* Gender & Age Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* A1. Gender Distribution Pie Chart */}
          {citizens?.gender?.byGender && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Phân bố theo giới tính</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(citizens.gender.byGender).map(([name, value]) => ({
                      name,
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(citizens.gender.byGender).map((key, index) => (
                      <Cell key={`cell-${index}`} fill={key === 'Nam' ? COLORS.male : COLORS.female} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* A2. Age Distribution Bar Chart */}
          {citizens?.age?.buckets && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Phân bố theo độ tuổi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(citizens.age.buckets).map(([key, data]) => ({
                    name: data.label,
                    'Số lượng': data.total
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Số lượng" fill={COLORS.working} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Age details table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Chi tiết nhóm tuổi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {citizens?.age?.buckets && Object.entries(citizens.age.buckets).map(([key, data]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">{data.label}</div>
                <div className="text-2xl font-bold text-gray-800">{data.total}</div>
                {data.byGender && (
                  <div className="mt-2 text-xs text-gray-600">
                    {Object.entries(data.byGender).map(([gender, count]) => (
                      <div key={gender}>{gender}: {count}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B. Household Statistics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Thống kê hộ khẩu
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Tổng số hộ khẩu</div>
            <div className="text-4xl font-bold">{households?.total || 0}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-2">Tổng số thành viên</div>
            <div className="text-3xl font-bold text-gray-800">{households?.totalMembers || 0}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-2">Trung bình thành viên/hộ</div>
            <div className="text-3xl font-bold text-gray-800">{households?.avgMembers || 0}</div>
          </div>
        </div>

        {/* Top Households */}
        {households?.topHouseholds && households.topHouseholds.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 5 hộ khẩu đông thành viên nhất</h3>
            <div className="space-y-2">
              {households.topHouseholds.map((h, index) => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{h.soHoKhau}</div>
                      <div className="text-sm text-gray-600">{h.tenChuHo} - {h.diaChi}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{h.soThanhVien || 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* C. Fee Statistics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thống kê thu phí
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Tổng đã thu</div>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fees?.totalCollected || 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-2">Tổng phải thu</div>
            <div className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fees?.totalExpected || 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-2">Tỷ lệ hoàn thành</div>
            <div className="text-3xl font-bold text-green-600">{fees?.completionRate || 0}%</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-2">Hộ chưa đóng đủ</div>
            <div className="text-3xl font-bold text-red-600">{fees?.outstanding?.length || 0}</div>
          </div>
        </div>

        {/* Collections by Period */}
        {fees?.byPeriod && fees.byPeriod.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Thu phí theo đợt</h3>
            <div className="space-y-3">
              {fees.byPeriod.map((period, index) => {
                const percentage = period.expected > 0 ? (period.collected / period.expected) * 100 : 0;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{period.name}</span>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>Đã thu: {new Intl.NumberFormat('vi-VN').format(period.collected)} ₫</span>
                      <span>Phải thu: {new Intl.NumberFormat('vi-VN').format(period.expected)} ₫</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outstanding Households Table */}
        {fees?.outstanding && fees.outstanding.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Danh sách hộ chưa đóng đủ phí ({fees.outstanding.length} hộ)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Đợt thu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Hộ khẩu</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Phải thu</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Đã thu</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Còn thiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fees.outstanding.slice(0, 10).map((fee, index) => {
                    const remaining = (fee.tongPhi || 0) - (fee.soTienDaThu || 0);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{fee.tenDot || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{fee.soHoKhau || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-800">
                          {new Intl.NumberFormat('vi-VN').format(fee.tongPhi || 0)} ₫
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          {new Intl.NumberFormat('vi-VN').format(fee.soTienDaThu || 0)} ₫
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-bold">
                          {new Intl.NumberFormat('vi-VN').format(remaining)} ₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {fees.outstanding.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  ... và {fees.outstanding.length - 10} hộ khác
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StatisticsOverview;
