import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getAllHoKhau } from "../../../api/hoKhauApi";
import {
  getAllNhanKhau,
  getGenderStats,
  getAgeStats,
  getStatusStats,
} from "../../../api/nhanKhauApi";
import NoPermission from "../NoPermission";
import "./DashboardPage.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalHoKhau: 0,
    totalNhanKhau: 0,
    genderStats: null,
    ageStats: null,
    statusStats: null,
  });
  const role = localStorage.getItem("role");

  const allowedRoles = ["ADMIN", "TOTRUONG", "KETOAN"];

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [hoKhaus, nhanKhaus, genderStats, ageStats, statusStats] = await Promise.all([
        getAllHoKhau(),
        getAllNhanKhau(),
        getGenderStats(),
        getAgeStats(),
        getStatusStats(),
      ]);

      setStats({
        totalHoKhau: hoKhaus?.length || 0,
        totalNhanKhau: nhanKhaus?.filter(nk => nk.trangThai !== 'KHAI_TU').length || 0,
        genderStats,
        ageStats,
        statusStats,
      });
    } catch (err) {
      console.error("Lỗi khi tải thống kê:", err);
      setError(err.response?.data?.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="page-loading">Đang tải thống kê...</div>;
  }

  // Lấy dữ liệu giới tính từ byGender object
  const getGenderValue = (genderStats, key) => {
    if (!genderStats || !genderStats.byGender) return 0;
    return genderStats.byGender[key] || 0;
  };

  const getAgeValue = (ageStats, key) => {
    if (!ageStats || !ageStats[key]) return 0;
    return ageStats[key].soNguoi || 0;
  };

  const getStatusValue = (statusStats, key) => {
    if (!statusStats || !statusStats.byStatus) return 0;
    return statusStats.byStatus[key] || 0;
  };

  const genderTotal = stats.genderStats?.total || stats.totalNhanKhau;
  const ageTotal = stats.ageStats?.total || stats.totalNhanKhau;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="page-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '8px' }}>
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Thống kê
        </h1>
        <button className="btn-refresh" onClick={loadAllStats}>
          🔄 Làm mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tổng quan */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng số hộ khẩu</div>
            <div className="stat-value">{stats.totalHoKhau}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng số nhân khẩu</div>
            <div className="stat-value">{stats.totalNhanKhau}</div>
          </div>
        </div>
      </div>

      {/* Thống kê giới tính */}
      {stats.genderStats && stats.genderStats.byGender && (
        <div className="stats-section">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '8px' }}>
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            Thống Kê Theo Giới Tính
          </h2>
          <div className="gender-pie-wrapper">
            <Pie
              data={{
                labels: ["Nam", "Nữ"],
                datasets: [
                  {
                    data: [
                      getGenderValue(stats.genderStats, "Nam"),
                      getGenderValue(stats.genderStats, "Nữ"),
                    ],
                    backgroundColor: ["#3B82F6", "#EC4899"],
                    borderColor: ["#1E40AF", "#BE185D"],
                    borderWidth: 2,
                    hoverOffset: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 15,
                      font: {
                        size: 13,
                        weight: "600",
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 10,
                    titleFont: { size: 13, weight: "bold" },
                    bodyFont: { size: 12 },
                  },
                  datalabels: {
                    color: "#fff",
                    font: {
                      weight: "bold",
                      size: 14,
                    },
                    formatter: (value, context) => {
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${percentage}%`;
                    },
                  },
                },
              }}
              plugins={[
                {
                  id: "textCenter",
                  beforeDatasetsDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.restore();

                    const fontSize = (height / 200).toFixed(2);
                    ctx.font = `bold ${fontSize}em sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#ffffff";

                    const data = chart.data.datasets[0].data;
                    const total = data.reduce((a, b) => a + b, 0);

                    chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                      const { x, y } = datapoint.tooltipPosition();
                      const value = data[index];
                      const percentage = ((value / total) * 100).toFixed(1);

                      ctx.fillStyle = "#ffffff";
                      ctx.textAlign = "center";
                      ctx.font = `bold 14px sans-serif`;
                      ctx.fillText(`${percentage}%`, x, y);
                    });
                  },
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Thống kê trạng thái */}
      {stats.statusStats && stats.statusStats.byStatus && (
        <div className="stats-section">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '8px' }}>
              <path d="M3 3h7v7H3z"></path>
              <path d="M14 3h7v7h-7z"></path>
              <path d="M14 14h7v7h-7z"></path>
              <path d="M3 14h7v7H3z"></path>
            </svg>
            Thống Kê Theo Trạng Thái Cư Trú
          </h2>
          <div className="gender-pie-wrapper">
            <Pie
              data={{
                labels: ["Thường trú", "Tạm trú", "Tạm vắng"],
                datasets: [
                  {
                    data: [
                      getStatusValue(stats.statusStats, "THUONG_TRU"),
                      getStatusValue(stats.statusStats, "TAM_TRU"),
                      getStatusValue(stats.statusStats, "TAM_VANG"),
                    ],
                    backgroundColor: ["#10B981", "#06B6D4", "#F97316"],
                    borderColor: ["#059669", "#0891B2", "#EA580C"],
                    borderWidth: 2,
                    hoverOffset: 10,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 15,
                      font: { size: 13, weight: "600" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 10,
                    titleFont: { size: 13, weight: "bold" },
                    bodyFont: { size: 12 },
                  },
                  datalabels: {
                    color: "#fff",
                    font: {
                      weight: "bold",
                      size: 14,
                    },
                    formatter: (value, context) => {
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      if (total === 0) return "0%";
                      const percentage = ((value / total) * 100).toFixed(1);
                      // Only show if > 5% to avoid clutter
                      if (value / total < 0.05) return "";
                      return `${percentage}%`;
                    },
                  },
                },
              }}
              plugins={[
                {
                  id: "textCenterStatus",
                  beforeDatasetsDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.restore();
                    const data = chart.data.datasets[0].data;
                    const total = data.reduce((a, b) => a + b, 0);

                    chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                      const { x, y } = datapoint.tooltipPosition();
                      const value = data[index];
                      if (value / total < 0.05) return; // Hide small labels

                      const percentage = ((value / total) * 100).toFixed(1);

                      ctx.fillStyle = "#ffffff";
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.font = `bold 14px sans-serif`;
                      ctx.fillText(`${percentage}%`, x, y);
                    });
                  },
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Thống kê độ tuổi */}
      {stats.ageStats && (
        <div className="stats-section">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Thống Kê Theo Độ Tuổi
          </h2>
          <div className="age-stats">
            <div className="age-item">
              <div className="age-label">Đi học (≤16 tuổi)</div>
              <div className="age-bar-container">
                <div
                  className="age-bar school"
                  style={{
                    width: `${Math.max(
                      10,
                      calculatePercentage(getAgeValue(stats.ageStats, "diHoc"), ageTotal)
                    )}%`,
                  }}
                >
                  <span className="age-count">
                    {getAgeValue(stats.ageStats, "diHoc")} (
                    {calculatePercentage(
                      getAgeValue(stats.ageStats, "diHoc"),
                      ageTotal
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
            <div className="age-item">
              <div className="age-label">Đi làm (17-59 tuổi)</div>
              <div className="age-bar-container">
                <div
                  className="age-bar working"
                  style={{
                    width: `${Math.max(
                      10,
                      calculatePercentage(getAgeValue(stats.ageStats, "diLam"), ageTotal)
                    )}%`,
                  }}
                >
                  <span className="age-count">
                    {getAgeValue(stats.ageStats, "diLam")} (
                    {calculatePercentage(
                      getAgeValue(stats.ageStats, "diLam"),
                      ageTotal
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
            <div className="age-item">
              <div className="age-label">Về hưu (≥60 tuổi)</div>
              <div className="age-bar-container">
                <div
                  className="age-bar retired"
                  style={{
                    width: `${Math.max(
                      10,
                      calculatePercentage(getAgeValue(stats.ageStats, "veHuu"), ageTotal)
                    )}%`,
                  }}
                >
                  <span className="age-count">
                    {getAgeValue(stats.ageStats, "veHuu")} (
                    {calculatePercentage(
                      getAgeValue(stats.ageStats, "veHuu"),
                      ageTotal
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
