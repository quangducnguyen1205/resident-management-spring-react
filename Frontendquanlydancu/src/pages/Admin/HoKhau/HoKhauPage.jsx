import { useState, useEffect } from "react";
import {
  getAllHoKhau,
  getHoKhauById,
  createHoKhau,
  updateHoKhau,
  deleteHoKhau,
} from "../../../api/hoKhauApi";
import NoPermission from "../NoPermission";
import "./HoKhauPage.css";

function HoKhauPage() {
  const [hoKhaus, setHoKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    soHoKhau: "",
    tenChuHo: "",
    diaChi: "",
  });
  const role = localStorage.getItem("role");

  // Kiểm tra quyền: ADMIN, TOTRUONG có thể tạo/sửa/xóa, KETOAN chỉ xem
  const allowedRoles = ["ADMIN", "TOTRUONG", "KETOAN"];
  const canEdit = role === "ADMIN" || role === "TOTRUONG";

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadHoKhaus();
  }, []);

  const loadHoKhaus = async () => {
    try {
      setLoading(true);
      const data = await getAllHoKhau();
      setHoKhaus(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách hộ khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        soHoKhau: item.soHoKhau || "",
        tenChuHo: item.tenChuHo || "",
        diaChi: item.diaChi || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        soHoKhau: "",
        tenChuHo: "",
        diaChi: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      soHoKhau: "",
      tenChuHo: "",
      diaChi: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateHoKhau(editingItem.id, formData);
        alert("Cập nhật hộ khẩu thành công!");
      } else {
        await createHoKhau(formData);
        alert("Tạo hộ khẩu thành công!");
      }
      handleCloseModal();
      loadHoKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hộ khẩu này?")) {
      return;
    }
    try {
      await deleteHoKhau(id);
      alert("Xóa hộ khẩu thành công!");
      loadHoKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="ho-khau-page">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Hộ Khẩu</h1>
        <div className="header-actions">
          {canEdit && (
            <button className="btn-add" onClick={() => handleOpenModal()}>
              + Thêm hộ khẩu
            </button>
          )}
          <button className="btn-refresh" onClick={loadHoKhaus}>
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
              <th>Số hộ khẩu</th>
              <th>Tên chủ hộ</th>
              <th>Địa chỉ</th>
              <th>Số thành viên</th>
              <th>Ngày tạo</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {hoKhaus.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="empty-message">
                  Chưa có hộ khẩu nào
                </td>
              </tr>
            ) : (
              hoKhaus.map((hk, index) => (
                <tr key={hk.id}>
                  <td>{index + 1}</td>
                  <td>{hk.soHoKhau || "-"}</td>
                  <td>{hk.tenChuHo || "-"}</td>
                  <td className="dia-chi-cell" title={hk.diaChi}>
                    {hk.diaChi || "-"}
                  </td>
                  <td>{hk.soThanhVien || 0}</td>
                  <td>
                    {hk.ngayTao
                      ? new Date(hk.ngayTao).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  {canEdit && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(hk)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(hk.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? "Sửa hộ khẩu" : "Thêm hộ khẩu mới"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  Số hộ khẩu <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.soHoKhau}
                  onChange={(e) =>
                    setFormData({ ...formData, soHoKhau: e.target.value })
                  }
                  required
                  disabled={!!editingItem}
                />
              </div>
              <div className="form-group">
                <label>
                  Tên chủ hộ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenChuHo}
                  onChange={(e) =>
                    setFormData({ ...formData, tenChuHo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Địa chỉ <span className="required">*</span>
                </label>
                <textarea
                  value={formData.diaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, diaChi: e.target.value })
                  }
                  required
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingItem ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HoKhauPage;
