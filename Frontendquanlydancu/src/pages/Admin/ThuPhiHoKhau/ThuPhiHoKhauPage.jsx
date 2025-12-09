import { useState, useEffect } from "react";
import {
  getAllThuPhiHoKhau,
  createThuPhiHoKhau,
  updateThuPhiHoKhau,
  deleteThuPhiHoKhau,
} from "../../../api/thuPhiHoKhauApi";
import { getAllHoKhau } from "../../../api/hoKhauApi";
import { getAllDotThuPhi } from "../../../api/dotThuPhiApi";
import NoPermission from "../NoPermission";
import "./ThuPhiHoKhauPage.css";

function ThuPhiHoKhauPage() {
  const [thuPhiHoKhaus, setThuPhiHoKhaus] = useState([]);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [dotThuPhis, setDotThuPhis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    hoKhauId: "",
    dotThuPhiId: "",
    ngayThu: "",
    ghiChu: "",
    tongPhi: "",
  });
  const role = localStorage.getItem("role");

  const allowedRoles = ["ADMIN", "KETOAN", "TOTRUONG"];
  const canEdit = role === "ADMIN" || role === "KETOAN";

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadThuPhiHoKhaus();
    loadHoKhaus();
    loadDotThuPhis();
  }, []);

  const loadThuPhiHoKhaus = async () => {
    try {
      setLoading(true);
      const data = await getAllThuPhiHoKhau();
      setThuPhiHoKhaus(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách thu phí hộ khẩu");
    } finally {
      setLoading(false);
    }
  };

  const loadHoKhaus = async () => {
    try {
      const data = await getAllHoKhau();
      setHoKhaus(data || []);
    } catch (err) {
      console.error("Không thể tải danh sách hộ khẩu", err);
    }
  };

  const loadDotThuPhis = async () => {
    try {
      const data = await getAllDotThuPhi();
      setDotThuPhis(data || []);
    } catch (err) {
      console.error("Không thể tải danh sách đợt thu phí", err);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        hoKhauId: item.hoKhauId || "",
        dotThuPhiId: item.dotThuPhiId || "",
        ngayThu: item.ngayThu ? item.ngayThu.split("T")[0] : "",
        ghiChu: item.ghiChu || "",
        tongPhi: item.tongPhi ? item.tongPhi.toString() : "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        hoKhauId: "",
        dotThuPhiId: "",
        ngayThu: "",
        ghiChu: "",
        tongPhi: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        hoKhauId: Number(formData.hoKhauId),
        dotThuPhiId: Number(formData.dotThuPhiId),
        ngayThu: formData.ngayThu || null,
        ghiChu: formData.ghiChu || "",
        tongPhi: formData.tongPhi ? Number(formData.tongPhi) : null,
      };
      if (editingItem) {
        await updateThuPhiHoKhau(editingItem.id, submitData);
        alert("Cập nhật thu phí thành công!");
      } else {
        await createThuPhiHoKhau(submitData);
        alert("Tạo thu phí thành công!");
      }
      handleCloseModal();
      loadThuPhiHoKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thu phí này?")) {
      return;
    }
    try {
      await deleteThuPhiHoKhau(id);
      alert("Xóa thu phí thành công!");
      loadThuPhiHoKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      DA_NOP: "Đã nộp",
      CHUA_NOP: "Chưa nộp",
      TRE_HAN: "Trễ hạn",
    };
    return labels[trangThai] || trangThai;
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="thu-phi-ho-khau-page">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Thu Phí Hộ Khẩu</h1>
        <div className="header-actions">
          {canEdit && (
            <button className="btn-add" onClick={() => handleOpenModal()}>
              + Thêm thu phí
            </button>
          )}
          <button className="btn-refresh" onClick={loadThuPhiHoKhaus}>
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
              <th>Tên đợt thu</th>
              <th>Loại phí</th>
              <th>Số người</th>
              <th>Số tháng</th>
              <th>Tổng phí (VNĐ)</th>
              <th>Trạng thái</th>
              <th>Ngày thu</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {thuPhiHoKhaus.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 11 : 10} className="empty-message">
                  Chưa có thu phí nào
                </td>
              </tr>
            ) : (
              thuPhiHoKhaus.map((tphk, index) => (
                <tr key={tphk.id}>
                  <td>{index + 1}</td>
                  <td>{tphk.soHoKhau || "-"}</td>
                  <td>{tphk.tenChuHo || "-"}</td>
                  <td>{tphk.tenDot || "-"}</td>
                  <td>
                    <span className={`loai-badge loai-${tphk.loaiThuPhi}`}>
                      {tphk.loaiThuPhi === "BAT_BUOC" ? "Bắt buộc" : "Tự nguyện"}
                    </span>
                  </td>
                  <td>{tphk.soNguoi || 0}</td>
                  <td>{tphk.soThang || 0}</td>
                  <td>
                    {tphk.tongPhi
                      ? tphk.tongPhi.toLocaleString("vi-VN")
                      : "0"} đ
                  </td>
                  <td>
                    <span className={`status-badge status-${tphk.trangThai}`}>
                      {getTrangThaiLabel(tphk.trangThai)}
                    </span>
                  </td>
                  <td>
                    {tphk.ngayThu
                      ? new Date(tphk.ngayThu).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  {canEdit && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(tphk)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(tphk.id)}
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
              <h2>{editingItem ? "Sửa thu phí" : "Thêm thu phí mới"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Hộ khẩu <span className="required">*</span>
                  </label>
                  <select
                    value={formData.hoKhauId}
                    onChange={(e) =>
                      setFormData({ ...formData, hoKhauId: e.target.value })
                    }
                    required
                    disabled={!!editingItem}
                  >
                    <option value="">Chọn hộ khẩu</option>
                    {hoKhaus.map((hk) => (
                      <option key={hk.id} value={hk.id}>
                        {hk.soHoKhau} - {hk.tenChuHo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Đợt thu phí <span className="required">*</span>
                  </label>
                  <select
                    value={formData.dotThuPhiId}
                    onChange={(e) =>
                      setFormData({ ...formData, dotThuPhiId: e.target.value })
                    }
                    required
                    disabled={!!editingItem}
                  >
                    <option value="">Chọn đợt thu phí</option>
                    {dotThuPhis.map((dtp) => (
                      <option key={dtp.id} value={dtp.id}>
                        {dtp.tenDot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>
                  Ngày thu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ngayThu}
                  onChange={(e) =>
                    setFormData({ ...formData, ngayThu: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tổng phí (VNĐ) - Chỉ dùng cho phí tự nguyện</label>
                <input
                  type="number"
                  value={formData.tongPhi}
                  onChange={(e) =>
                    setFormData({ ...formData, tongPhi: e.target.value })
                  }
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) =>
                    setFormData({ ...formData, ghiChu: e.target.value })
                  }
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

export default ThuPhiHoKhauPage;
