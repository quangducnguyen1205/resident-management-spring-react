import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Table/DataTable';
import CitizenSearch from '../components/CitizenSearch';
import CitizenStats from '../components/CitizenStats';
import useApiHandler from '../../../hooks/useApiHandler';
import citizenApi from '../../../api/citizenApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';

const CitizenList = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ gender: null, age: null });
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'tamvang', 'tamtru', 'khaitu'
  const [filters, setFilters] = useState({
    trangThai: '',
    gioiTinh: ''
  });
  
  const {
    data,
    loading,
    error,
    handleApi
  } = useApiHandler({});

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'hoTen', title: 'Họ tên' },
    { 
      key: 'ngaySinh', 
      title: 'Ngày sinh',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    { key: 'gioiTinh', title: 'Giới tính' },
    { key: 'cmndCccd', title: 'CMND/CCCD' },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'THUONG_TRU' ? 'bg-green-100 text-green-800' : 
          value === 'TAM_TRU' ? 'bg-blue-100 text-blue-800' : 
          value === 'TAM_VANG' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'THUONG_TRU' ? 'Thường trú' : 
           value === 'TAM_TRU' ? 'Tạm trú' : 
           value === 'TAM_VANG' ? 'Tạm vắng' : 
           value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTamVang(row);
            }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            title="Tạm vắng"
          >
            Tạm vắng
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTamTru(row);
            }}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
            title="Tạm trú"
          >
            Tạm trú
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleKhaiTu(row);
            }}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
            title="Khai tử"
          >
            Khai tử
          </button>
        </div>
      )
    }
  ];

  const fetchCitizens = async () => {
    await handleApi(
      () => citizenApi.getAll(),
      'Không thể tải danh sách nhân khẩu'
    );
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const [genderData, ageData] = await Promise.all([
        citizenApi.getGenderStats(),
        citizenApi.getAgeStats()
      ]);
      
      console.log('Gender stats response:', genderData);
      console.log('Age stats response:', ageData);
      
      // Extract data từ response
      let rawGenderStats = genderData?.data || genderData;
      let rawAgeStats = ageData?.data || ageData;
      
      console.log('Raw gender stats:', rawGenderStats);
      console.log('Raw age stats:', rawAgeStats);
      
      // Parse Gender Stats từ backend format:
      // { total: 2, byGender: { "Nam": 2, "Nữ": 0 } }
      let genderStats = [];
      if (rawGenderStats?.byGender) {
        console.log('Parsing backend gender format...');
        genderStats = Object.entries(rawGenderStats.byGender).map(([name, value]) => ({
          name,
          value
        }));
        console.log('Parsed gender stats:', genderStats);
      } else if (Array.isArray(rawGenderStats)) {
        genderStats = rawGenderStats;
      }
      
      // Parse Age Stats từ backend format:
      // { buckets: { thieuNhi: { total, label, byGender }, diLam: {...}, veHuu: {...} } }
      let ageStats = [];
      if (rawAgeStats?.buckets) {
        console.log('Parsing backend age format...');
        ageStats = Object.entries(rawAgeStats.buckets).map(([key, bucket]) => ({
          range: bucket.label || key,
          count: bucket.total || 0,
          byGender: bucket.byGender || {}
        }));
        console.log('Parsed age stats:', ageStats);
      } else if (Array.isArray(rawAgeStats)) {
        ageStats = rawAgeStats;
      }
      
      console.log('Final gender stats:', genderStats);
      console.log('Final age stats:', ageStats);
      
      setStats({
        gender: genderStats,
        age: ageStats
      });
    } catch (err) {
      console.error('Không thể tải thống kê từ API:', err);
      console.error('Error details:', err.response?.data);
      
      // Fallback: Tính stats từ dữ liệu citizens có sẵn
      console.log('Calculating stats from citizen data...');
      calculateStatsFromData();
    }
  };

  // Hàm tính stats từ dữ liệu citizens
  const calculateStatsFromData = () => {
    const citizens = Array.isArray(data) ? data : (data?.data || []);
    
    if (citizens.length === 0) {
      console.log('No citizens data to calculate stats');
      setStats({ gender: null, age: null });
      return;
    }

    // Tính stats theo giới tính
    const genderCount = citizens.reduce((acc, citizen) => {
      const gender = citizen.gioiTinh || 'Không xác định';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const genderStats = Object.entries(genderCount).map(([name, value]) => ({
      name,
      value
    }));

    // Tính stats theo độ tuổi
    const ageRanges = [
      { range: '0-18', min: 0, max: 18, count: 0 },
      { range: '19-30', min: 19, max: 30, count: 0 },
      { range: '31-50', min: 31, max: 50, count: 0 },
      { range: '51-65', min: 51, max: 65, count: 0 },
      { range: '65+', min: 65, max: 200, count: 0 }
    ];

    citizens.forEach(citizen => {
      if (citizen.ngaySinh) {
        const birthDate = new Date(citizen.ngaySinh);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        const range = ageRanges.find(r => age >= r.min && age <= r.max);
        if (range) {
          range.count++;
        }
      }
    });

    console.log('Calculated gender stats:', genderStats);
    console.log('Calculated age stats:', ageRanges);

    setStats({
      gender: genderStats,
      age: ageRanges
    });
  };

  // Effect để tính lại stats khi data thay đổi (fallback)
  useEffect(() => {
    if (data && (!stats.gender || !stats.age)) {
      calculateStatsFromData();
    }
  }, [data]);

  useEffect(() => {
    fetchCitizens();
    fetchStats();
  }, []);

  const handleAdd = () => navigate('/citizen/new');
  const handleEdit = (row) => navigate(`/citizen/${row.id}`);
  const handleView = (row) => navigate(`/citizen/${row.id}`);
  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa nhân khẩu "${row.hoTen}"?`)) return;
    try {
      await handleApi(
        () => citizenApi.delete(row.id),
        'Không thể xóa nhân khẩu'
      );
      alert('Xóa nhân khẩu thành công!');
      await fetchCitizens();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      await fetchCitizens();
      return;
    }
    try {
      await handleApi(
        () => citizenApi.search({ q: searchTerm }),
        'Không thể tìm kiếm nhân khẩu'
      );
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handlers for special actions
  const handleTamVang = (citizen) => {
    setSelectedCitizen(citizen);
    setShowModal('tamvang');
  };

  const handleTamTru = (citizen) => {
    setSelectedCitizen(citizen);
    setShowModal('tamtru');
  };

  const handleKhaiTu = (citizen) => {
    setSelectedCitizen(citizen);
    setShowModal('khaitu');
  };

  const handleCancelTamVang = async (citizen) => {
    if (!window.confirm(`Xác nhận huỷ tạm vắng cho ${citizen.hoTen}?`)) return;
    try {
      await citizenApi.deleteTamVang(citizen.id);
      alert('Đã huỷ tạm vắng thành công');
      await fetchCitizens();
    } catch (err) {
      alert('Không thể huỷ tạm vắng: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelTamTru = async (citizen) => {
    if (!window.confirm(`Xác nhận huỷ tạm trú cho ${citizen.hoTen}?`)) return;
    try {
      await citizenApi.deleteTamTru(citizen.id);
      alert('Đã huỷ tạm trú thành công');
      await fetchCitizens();
    } catch (err) {
      alert('Không thể huỷ tạm trú: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (showModal === 'tamvang') {
        await citizenApi.updateTamVang(selectedCitizen.id, formData);
        alert('Đã cập nhật tạm vắng thành công');
      } else if (showModal === 'tamtru') {
        await citizenApi.updateTamTru(selectedCitizen.id, formData);
        alert('Đã cập nhật tạm trú thành công');
      } else if (showModal === 'khaitu') {
        await citizenApi.updateKhaiTu(selectedCitizen.id, formData);
        alert('Đã khai tử thành công');
      }
      setShowModal(null);
      setSelectedCitizen(null);
      await fetchCitizens();
      await fetchStats(); // Refresh stats after update
    } catch (err) {
      alert('Không thể thực hiện: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCitizens} />;

  // Transform data - API có thể trả về array hoặc object
  const citizens = Array.isArray(data) ? data : (data?.data || []);
  
  // Apply filters
  const filteredCitizens = citizens.filter(citizen => {
    if (filters.trangThai && citizen.trangThai !== filters.trangThai) return false;
    if (filters.gioiTinh && citizen.gioiTinh !== filters.gioiTinh) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 
            className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
            onClick={() => {
              // Reset all filters and reload
              setFilters({ trangThai: '', gioiTinh: '' });
              fetchCitizens();
            }}
            title="Click để tải lại danh sách"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Quản lý nhân khẩu
          </h1>
          <p className="text-gray-600 mt-1">Tổng số: {filteredCitizens.length} nhân khẩu</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm nhân khẩu
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <CitizenSearch onSearch={handleSearch} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Bộ lọc
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filters.trangThai}
              onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="THUONG_TRU">Thường trú</option>
              <option value="TAM_TRU">Tạm trú</option>
              <option value="TAM_VANG">Tạm vắng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <select
              value={filters.gioiTinh}
              onChange={(e) => setFilters({ ...filters, gioiTinh: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ trangThai: '', gioiTinh: '' })}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Statistics section */}
      {stats.gender && stats.age && (
        <div className="mb-6">
          <CitizenStats genderStats={stats.gender} ageStats={stats.age} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredCitizens}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          basePath="/citizen"
        />
      </div>

      {/* Modal for Tạm vắng */}
      {showModal === 'tamvang' && selectedCitizen && (
        <Modal
          title={`Cập nhật tạm vắng - ${selectedCitizen.hoTen}`}
          onClose={() => {
            setShowModal(null);
            setSelectedCitizen(null);
          }}
          onSubmit={handleModalSubmit}
        >
          <TamVangForm />
        </Modal>
      )}

      {/* Modal for Tạm trú */}
      {showModal === 'tamtru' && selectedCitizen && (
        <Modal
          title={`Cập nhật tạm trú - ${selectedCitizen.hoTen}`}
          onClose={() => {
            setShowModal(null);
            setSelectedCitizen(null);
          }}
          onSubmit={handleModalSubmit}
        >
          <TamTruForm />
        </Modal>
      )}

      {/* Modal for Khai tử */}
      {showModal === 'khaitu' && selectedCitizen && (
        <Modal
          title={`Khai tử - ${selectedCitizen.hoTen}`}
          onClose={() => {
            setShowModal(null);
            setSelectedCitizen(null);
          }}
          onSubmit={handleModalSubmit}
        >
          <KhaiTuForm />
        </Modal>
      )}
    </div>
  );
};

// Simple Modal Component
const Modal = ({ title, onClose, onSubmit, children }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {React.cloneElement(children, { formData, setFormData })}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Xác nhận
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Tạm vắng Form
const TamVangForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
      <input
        type="date"
        value={formData.ngayBatDau || ''}
        onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Ngày kết thúc (dự kiến)</label>
      <input
        type="date"
        value={formData.ngayKetThuc || ''}
        onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Địa chỉ tạm vắng</label>
      <textarea
        value={formData.diaChiTamVang || ''}
        onChange={(e) => setFormData({ ...formData, diaChiTamVang: e.target.value })}
        className="w-full border rounded px-3 py-2"
        rows="3"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Lý do</label>
      <textarea
        value={formData.lyDo || ''}
        onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
        className="w-full border rounded px-3 py-2"
        rows="2"
      />
    </div>
  </div>
);

// Tạm trú Form
const TamTruForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
      <input
        type="date"
        value={formData.ngayBatDau || ''}
        onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Ngày kết thúc (dự kiến)</label>
      <input
        type="date"
        value={formData.ngayKetThuc || ''}
        onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Địa chỉ thường trú</label>
      <textarea
        value={formData.diaChiThuongTru || ''}
        onChange={(e) => setFormData({ ...formData, diaChiThuongTru: e.target.value })}
        className="w-full border rounded px-3 py-2"
        rows="3"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Lý do</label>
      <textarea
        value={formData.lyDo || ''}
        onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
        className="w-full border rounded px-3 py-2"
        rows="2"
      />
    </div>
  </div>
);

// Khai tử Form
const KhaiTuForm = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Ngày mất</label>
      <input
        type="date"
        value={formData.ngayMat || ''}
        onChange={(e) => setFormData({ ...formData, ngayMat: e.target.value })}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Nguyên nhân</label>
      <textarea
        value={formData.nguyenNhan || ''}
        onChange={(e) => setFormData({ ...formData, nguyenNhan: e.target.value })}
        className="w-full border rounded px-3 py-2"
        rows="3"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Nơi mất</label>
      <input
        type="text"
        value={formData.noiMat || ''}
        onChange={(e) => setFormData({ ...formData, noiMat: e.target.value })}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Số giấy khai tử</label>
      <input
        type="text"
        value={formData.soGiayKhaiTu || ''}
        onChange={(e) => setFormData({ ...formData, soGiayKhaiTu: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  </div>
);

export default CitizenList;