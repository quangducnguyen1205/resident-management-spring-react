import { useState, useEffect } from "react";
import {
  getAllDotThuPhi,
  getDotThuPhiById,
  createDotThuPhi,
  deleteDotThuPhi,
} from "../../../api/dotThuPhiApi";
import NoPermission from "../NoPermission";
import "./DotThuPhiPage.css";

function DotThuPhiPage() {
  const [dotThuPhis, setDotThuPhis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tenDot: "",
    loai: "BAT_BUOC",
    ngayBatDau: "",
    ngayKetThuc: "",
    dinhMuc: "",
  });
  const role = localStorage.getItem("role");

  const allowedRoles = ["ADMIN", "KETOAN", "TOTRUONG"];
  const canEdit = role === "ADMIN" || role === "KETOAN";

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadDotThuPhis();
  }, []);

  const loadDotThuPhis = async () => {
    try {
      setLoading(true);
      const data = await getAllDotThuPhi();
      setDotThuPhis(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách đợt thu phí");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      tenDot: "",
      loai: "BAT_BUOC",
      ngayBatDau: "",
      ngayKetThuc: "",
      dinhMuc: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        dinhMuc: formData.dinhMuc ? Number(formData.dinhMuc) : 0,
      };
      await createDotThuPhi(submitData);
      alert("Tạo đợt thu phí thành công!");
      handleCloseModal();
      loadDotThuPhis();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đợt thu phí này?")) {
      return;
    }
    try {
      await deleteDotThuPhi(id);
      alert("Xóa đợt thu phí thành công!");
      loadDotThuPhis();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="dot-thu-phi-page">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Đợt Thu Phí</h1>
        <div className="header-actions">
          {canEdit && (
            <button className="btn-add" onClick={handleOpenModal}>
              + Thêm đợt thu phí
            </button>
          )}
          <button className="btn-refresh" onClick={loadDotThuPhis}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên đợt</th>
              <th>Loại phí</th>
              <th>Định mức (VNĐ)</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {dotThuPhis.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="empty-message">
                  Chưa có đợt thu phí nào
                </td>
              </tr>
            ) : (
              dotThuPhis.map((dtp, index) => (
                <tr key={dtp.id}>
                  <td>{index + 1}</td>
                  <td>{dtp.tenDot || "-"}</td>
                  <td>
                    <span className={`loai-badge loai-${dtp.loai}`}>
                      {dtp.loai === "BAT_BUOC" ? "Bắt buộc" : "Tự nguyện"}
                    </span>
                  </td>
                  <td>
                    {dtp.dinhMuc
                      ? dtp.dinhMuc.toLocaleString("vi-VN")
                      : "0"} đ
                  </td>
                  <td>
                    {dtp.ngayBatDau
                      ? new Date(dtp.ngayBatDau).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    {dtp.ngayKetThuc
                      ? new Date(dtp.ngayKetThuc).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  {canEdit && (
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(dtp.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm đợt thu phí mới</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  Tên đợt <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenDot}
                  onChange={(e) =>
                    setFormData({ ...formData, tenDot: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Loại phí <span className="required">*</span>
                </label>
                <select
                  value={formData.loai}
                  onChange={(e) =>
                    setFormData({ ...formData, loai: e.target.value })
                  }
                  required
                >
                  <option value="BAT_BUOC">Bắt buộc</option>
                  <option value="TU_NGUYEN">Tự nguyện</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Ngày bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngayBatDau}
                    onChange={(e) =>
                      setFormData({ ...formData, ngayBatDau: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Ngày kết thúc <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.ngayKetThuc}
                    onChange={(e) =>
                      setFormData({ ...formData, ngayKetThuc: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Định mức (VNĐ)</label>
                <input
                  type="number"
                  value={formData.dinhMuc}
                  onChange={(e) =>
                    setFormData({ ...formData, dinhMuc: e.target.value })
                  }
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DotThuPhiPage;
