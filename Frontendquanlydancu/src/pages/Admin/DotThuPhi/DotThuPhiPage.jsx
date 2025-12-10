import { useState, useEffect } from "react";
import {
  getAllDotThuPhi,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tenDot: "",
    loai: "BAT_BUOC",
    ngayBatDau: "",
    ngayKetThuc: "",
    dinhMuc: "",
  });

  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  // Permissions: ADMIN, TOTRUONG, KETOAN can view
  const allowedRoles = ["ADMIN", "KETOAN", "TOTRUONG"];
  // Only ADMIN and KETOAN can create new periods (TOTRUONG is view-only)
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
      setError("");
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

    if (isSubmitting) return;

    // Validation bắt buộc
    if (!formData.tenDot || !formData.loai || !formData.ngayBatDau || !formData.ngayKetThuc) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }

    // Kiểm tra ngày
    if (formData.ngayKetThuc < formData.ngayBatDau) {
      alert("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    // Định mức chỉ áp dụng cho BAT_BUOC
    let dinhMucValue = 0;
    if (formData.loai === "BAT_BUOC") {
      dinhMucValue = Number(formData.dinhMuc);
      if (!formData.dinhMuc || Number.isNaN(dinhMucValue) || dinhMucValue <= 0) {
        alert("Định mức phải lớn hơn 0");
        return;
      }
    } else {
      dinhMucValue = 0;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        tenDot: formData.tenDot,
        loai: formData.loai,
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc,
        dinhMuc: dinhMucValue,
      };

      await createDotThuPhi(submitData);
      alert("Tạo đợt thu phí thành công");
      handleCloseModal();
      loadDotThuPhis();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Có lỗi xảy ra khi tạo đợt thu phí";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format định mức display
   * - For BAT_BUOC: always show formatted number + " đ"
   * - For TU_NGUYEN: show value if exists, otherwise "-"
   */
  const formatDinhMuc = (dinhMuc, loai) => {
    if (loai === "BAT_BUOC") {
      return dinhMuc ? `${dinhMuc.toLocaleString("vi-VN")} đ` : "0 đ";
    }
    // TU_NGUYEN: dinhMuc is optional (suggestion only)
    if (dinhMuc && dinhMuc > 0) {
      return `${dinhMuc.toLocaleString("vi-VN")} đ`;
    }
    return "-";
  };

  const handleDeleteDotThuPhi = async (dotThuPhi) => {
    if (!dotThuPhi) return;

    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa đợt thu phí này? Hành động này không thể hoàn tác."
    );

    if (!confirmDelete) return;

    try {
      await deleteDotThuPhi(dotThuPhi.id);
      alert("Xóa đợt thu phí thành công");
      loadDotThuPhis();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa đợt thu phí");
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
              <th>Loại</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Định mức</th>
              {isAdmin && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {dotThuPhis.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="empty-message">
                  Chưa có đợt thu phí nào
                </td>
              </tr>
            ) : (
              dotThuPhis.map((dtp, index) => (
                <tr key={dtp.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{dtp.tenDot || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`loai-badge loai-${dtp.loai}`}>
                      {dtp.loai === "BAT_BUOC" ? "Bắt buộc" : "Tự nguyện"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {dtp.ngayBatDau
                      ? new Date(dtp.ngayBatDau).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {dtp.ngayKetThuc
                      ? new Date(dtp.ngayKetThuc).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatDinhMuc(dtp.dinhMuc, dtp.loai)}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteDotThuPhi(dtp)}
                      >
                        Xóa đợt thu phí
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm đợt thu phí - only render if canEdit */}
      {canEdit && showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm đợt thu phí mới</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
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
                  placeholder="Nhập tên đợt thu phí"
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

              {formData.loai === "BAT_BUOC" && (
                <div className="form-group">
                  <label>
                    Định mức (VNĐ/người/tháng) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.dinhMuc}
                    onChange={(e) =>
                      setFormData({ ...formData, dinhMuc: e.target.value })
                    }
                    min="0"
                    step="1000"
                    placeholder="Nhập định mức (bắt buộc)"
                  />
                </div>
              )}

              {formData.loai === "TU_NGUYEN" && (
                <div className="form-group">
                  <small className="field-hint">
                    Phí tự nguyện không có định mức cố định. Mỗi hộ sẽ chọn số tiền khi thu.
                  </small>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
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
