import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const FeeStats = ({ stats }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Kiểm tra nếu stats không hợp lệ
  if (!stats || !Array.isArray(stats)) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Thống kê thu phí</h3>
        <p className="text-gray-500">Không có dữ liệu thống kê</p>
      </div>
    );
  }

  // Lấy chart data từ array items
  const chartData = stats.filter(item => item.name && item.value !== undefined);
  
  // Tính tỷ lệ thu từ dữ liệu của chart
  // Nếu có "Đã thu" và "Chưa thu", tính: Đã thu / (Đã thu + Chưa thu) * 100
  let collectionRate = stats.collectionRate || 0;
  if (!collectionRate && chartData.length >= 2) {
    const paidValue = chartData.find(item => item.name === 'Đã thu')?.value || 0;
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    collectionRate = totalValue > 0 ? Math.round((paidValue / totalValue) * 100) : 0;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Thống kê thu phí</h3>
      <div className="grid grid-cols-2 gap-4">
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
        <div className="p-4 space-y-4">
          <h4 className="font-semibold mb-3">Tổng quan</h4>
          
          {/* Tỷ lệ thu - Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tỷ lệ thu</span>
              <span className="text-lg font-bold text-blue-600">{collectionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Thông tin chi tiết */}
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Tổng số tiền đã thu:</span>
              <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(stats.totalCollected || 0)} ₫</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Số hộ đã nộp:</span>
              <span className="font-semibold text-green-600">{stats.householdsPaid || 0} hộ</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Số hộ chưa nộp:</span>
              <span className="font-semibold text-orange-600">{stats.householdsUnpaid || 0} hộ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeeStats;