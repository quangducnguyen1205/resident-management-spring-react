import { useState, useEffect } from "react";
import { getAllBienDong } from "../../../api/bienDongApi";
import { getAllHoKhau } from "../../../api/hoKhauApi";
import { getAllNhanKhau } from "../../../api/nhanKhauApi";
import NoPermission from "../NoPermission";
import "./BienDongPage.css";

function BienDongPage() {
  const [bienDongs, setBienDongs] = useState([]);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const role = localStorage.getItem("role");

  // Kiểm tra quyền: ADMIN, TOTRUONG, KETOAN
  const allowedRoles = ["ADMIN", "TOTRUONG", "KETOAN"];
  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [bienDongData, hoKhauData, nhanKhauData] = await Promise.all([
        getAllBienDong(),
        getAllHoKhau(),
        getAllNhanKhau(),
      ]);
      setBienDongs(bienDongData || []);
      setHoKhaus(hoKhauData || []);
      setNhanKhaus(nhanKhauData || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách biến động");
    } finally {
      setLoading(false);
    }
  };

  const getSoHoKhau = (hoKhauId) => {
    if (!hoKhauId) return "-";
    const hoKhau = hoKhaus.find((hk) => hk.id === hoKhauId);
    return hoKhau?.soHoKhau || "-";
  };

  const getTenChuHo = (hoKhauId) => {
    if (!hoKhauId) return "-";
    const hoKhau = hoKhaus.find((hk) => hk.id === hoKhauId);
    return hoKhau?.tenChuHo || "-";
  };

  const getTenNhanKhau = (nhanKhauId) => {
    if (!nhanKhauId) return "-";
    const nhanKhau = nhanKhaus.find((nk) => nk.id === nhanKhauId);
    return nhanKhau?.hoTen || "-";
  };

  const getLoaiLabel = (loai) => {
    const labels = {
      TAM_TRU: "Tạm trú",
      TAM_VANG: "Tạm vắng",
      KHAI_TU: "Khai tử",
      HUY_TAM_VANG: "Hủy tạm vắng",
      HUY_TAM_TRU: "Hủy tạm trú",
      THEM_MOI_THONG_TIN: "Thêm mới thông tin",
      THAY_DOI_THONG_TIN: "Thay đổi thông tin",
      CHUYEN_DEN: "Chuyển đến",
      CHUYEN_DI: "Chuyển đi",
      NHAP_HO: "Nhập hộ",
      TACH_HO: "Tách hộ",
    };
    return labels[loai] || loai;
  };

  // Filter Logic
  const filteredBienDongs = bienDongs.filter((bd) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    const soHoKhau = getSoHoKhau(bd.hoKhauId).toLowerCase();
    const tenChuHo = getTenChuHo(bd.hoKhauId).toLowerCase();

    return soHoKhau.includes(keyword) || tenChuHo.includes(keyword);
  });

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="bien-dong-page">
      <div className="page-header">
        <h1 className="page-title">Lịch sử thay đổi</h1>
        <div className="header-actions">
          <button className="btn-refresh" onClick={loadAllData}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm theo số hộ khẩu hoặc tên chủ hộ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Loại biến động</th>
              <th>Nội dung</th>
              <th>Thời gian</th>
              <th>Số hộ khẩu</th>
              <th>Tên nhân khẩu</th>
            </tr>
          </thead>
          <tbody>
            {filteredBienDongs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">
                  {searchTerm ? "Không tìm thấy kết quả phù hợp" : "Chưa có biến động nào"}
                </td>
              </tr>
            ) : (
              filteredBienDongs.map((bd, index) => (
                <tr key={bd.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="loai-badge">{getLoaiLabel(bd.loai)}</span>
                  </td>
                  <td className="noi-dung-cell" title={bd.noiDung}>
                    {bd.noiDung || "-"}
                  </td>
                  <td>
                    {bd.thoiGian
                      ? new Date(bd.thoiGian).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td>{getSoHoKhau(bd.hoKhauId)}</td>
                  <td>{getTenNhanKhau(bd.nhanKhauId)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default BienDongPage;
