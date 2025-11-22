import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CitizenStats = ({ genderStats, ageStats }) => {
  // Kiểm tra data hợp lệ
  const hasGenderData = genderStats && Array.isArray(genderStats) && genderStats.length > 0;
  const hasAgeData = ageStats && Array.isArray(ageStats) && ageStats.length > 0;

  return (
    <div className="space-y-6">
      {/* Thống kê theo giới tính */}
      <div>
        <h3 className="text-base font-semibold mb-3">Thống kê theo giới tính</h3>
        {hasGenderData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={genderStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">Không có dữ liệu</p>
        )}
      </div>

      {/* Thống kê theo độ tuổi */}
      <div>
        <h3 className="text-base font-semibold mb-3">Thống kê theo độ tuổi</h3>
        {hasAgeData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="range" 
                angle={-15}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
};

export default CitizenStats;