import { useState, useEffect } from "react";
import { getAllDotThuPhi, createDotThuPhi } from "../../../api/dotThuPhiApi";
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
    ghiChu: "",
  });

  const role = localStorage.getItem("role");

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
      ghiChu: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Client-side validation
    // 1. Check date range: ngayKetThuc >= ngayBatDau
    if (formData.ngayKetThuc < formData.ngayBatDau) {
      alert("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
      return;
    }

    // 2. Check dinhMuc for BAT_BUOC: must be > 0
    if (formData.loai === "BAT_BUOC") {
      const dinhMucValue = Number(formData.dinhMuc);
      if (!formData.dinhMuc || dinhMucValue <= 0) {
        alert("Định mức phải lớn hơn 0 cho đợt bắt buộc");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        tenDot: formData.tenDot,
        loai: formData.loai,
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc,
        dinhMuc: formData.dinhMuc ? Number(formData.dinhMuc) : 0,
        ghiChu: formData.ghiChu || null,
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
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {dotThuPhis.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-message">
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
                  <td>{dtp.ghiChu || "-"}</td>
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

              <div className="form-group">
                <label>
                  Định mức (VNĐ/người/tháng){" "}
                  {formData.loai === "BAT_BUOC" && (
                    <span className="required">*</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.dinhMuc}
                  onChange={(e) =>
                    setFormData({ ...formData, dinhMuc: e.target.value })
                  }
                  min="0"
                  step="1000"
                  placeholder={
                    formData.loai === "BAT_BUOC"
                      ? "Nhập định mức (bắt buộc)"
                      : "Nhập định mức gợi ý (không bắt buộc)"
                  }
                  required={formData.loai === "BAT_BUOC"}
                />
                {formData.loai === "TU_NGUYEN" && (
                  <small className="field-hint">
                    Đối với phí tự nguyện, định mức chỉ là gợi ý, không bắt buộc.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) =>
                    setFormData({ ...formData, ghiChu: e.target.value })
                  }
                  rows="3"
                  placeholder="Nhập ghi chú (không bắt buộc)"
                />
              </div>

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
