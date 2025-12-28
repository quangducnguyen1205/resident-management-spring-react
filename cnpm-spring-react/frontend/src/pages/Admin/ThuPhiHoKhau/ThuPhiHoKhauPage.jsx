import { useState, useEffect } from "react";
import {
  createThuPhiHoKhau,
  deleteThuPhiHoKhau,
  calculateThuPhi,
  getThuPhiOverview,
  getThuPhiByDot,
} from "../../../api/thuPhiHoKhauApi";
import { getAllHoKhau } from "../../../api/hoKhauApi";
import { getAllDotThuPhi } from "../../../api/dotThuPhiApi";
import NoPermission from "../NoPermission";
import "./ThuPhiHoKhauPage.css";

function ThuPhiHoKhauPage() {
  const [dotThuPhis, setDotThuPhis] = useState([]);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [selectedDotId, setSelectedDotId] = useState("");
  const [selectedDot, setSelectedDot] = useState(null);
  const [overview, setOverview] = useState(null);
  const [thuPhiRecords, setThuPhiRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(""); // "thu_phi_bat_buoc" | "create_tu_nguyen" | "view_bat_buoc"
  const [editingItem, setEditingItem] = useState(null);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for voluntary fees
  const [formData, setFormData] = useState({
    hoKhauId: "",
    ngayThu: "",
    tongPhi: "",
    ghiChu: "",
  });

  // Form data for mandatory fee collection
  const [batBuocFormData, setBatBuocFormData] = useState({
    ngayThu: "",
    ghiChu: "",
  });

  const role = localStorage.getItem("role");
  const allowedRoles = ["ADMIN", "KETOAN", "TOTRUONG"];
  const canEdit = role === "ADMIN" || role === "KETOAN";

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  useEffect(() => {
    loadDotThuPhis();
    loadHoKhaus();
  }, []);

  useEffect(() => {
    if (selectedDotId) {
      const dot = dotThuPhis.find((d) => d.id === Number(selectedDotId));
      setSelectedDot(dot || null);
      loadDataForDot(selectedDotId);
    } else {
      setSelectedDot(null);
      setOverview(null);
      setThuPhiRecords([]);
    }
  }, [selectedDotId, dotThuPhis]);

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

  const loadHoKhaus = async () => {
    try {
      const data = await getAllHoKhau();
      setHoKhaus(data || []);
    } catch (err) {
      console.error("Không thể tải danh sách hộ khẩu", err);
    }
  };

  const loadDataForDot = async (dotId) => {
    if (!dotId) return;
    try {
      setLoading(true);
      setError("");
      const [overviewData, recordsData] = await Promise.all([
        getThuPhiOverview(dotId),
        getThuPhiByDot(dotId),
      ]);
      setOverview(overviewData);
      setThuPhiRecords(recordsData || []);
      setStatusFilter("ALL");
      setSearchTerm("");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu thu phí");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedDotId) {
      loadDataForDot(selectedDotId);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Check if a date is within the period
  const isDateInPeriod = (dateStr) => {
    if (!selectedDot || !dateStr) return false;
    const date = new Date(dateStr);
    const start = new Date(selectedDot.ngayBatDau);
    const end = new Date(selectedDot.ngayKetThuc);
    return date >= start && date <= end;
  };

  // Get default date (today if within period, otherwise period start)
  const getDefaultDate = () => {
    const today = getTodayDate();
    if (selectedDot && isDateInPeriod(today)) {
      return today;
    }
    return selectedDot?.ngayBatDau?.split("T")[0] || today;
  };

  // ========== MANDATORY FEE (BAT_BUOC) HANDLERS ==========

  const handleOpenThuPhiBatBuoc = async (hoKhauItem) => {
  try {
    setIsSubmitting(true);
    const calcData = await calculateThuPhi(hoKhauItem.hoKhauId, selectedDotId);

    // Chuẩn hoá dữ liệu từ API calculate -> state dùng trong UI
    setCalculatedData({
      hoKhauId: hoKhauItem.hoKhauId,
      soHoKhau: hoKhauItem.soHoKhau,
      tenChuHo: hoKhauItem.tenChuHo,
      soNguoi: calcData.memberCount ?? 0,
      soThang: calcData.soThang ?? 0,
      dinhMuc: calcData.dinhMuc ?? 0,
      tongPhi: calcData.totalFee ?? 0,
      // formula: calcData.formula, // nếu sau này muốn show công thức
    });

    setBatBuocFormData({
      ngayThu: getDefaultDate(),
      ghiChu: "",
    });
    setModalMode("thu_phi_bat_buoc");
    setShowModal(true);
  } catch (err) {
    alert(err.response?.data?.message || "Không thể tính phí cho hộ khẩu này");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmitBatBuoc = async (e) => {
    e.preventDefault();

    if (!batBuocFormData.ngayThu) {
      alert("Vui lòng chọn ngày thu");
      return;
    }

    if (!isDateInPeriod(batBuocFormData.ngayThu)) {
      alert("Ngày thu phải nằm trong khoảng thời gian của đợt thu phí");
      return;
    }

    try {
      setIsSubmitting(true);
      await createThuPhiHoKhau({
        hoKhauId: calculatedData.hoKhauId,
        dotThuPhiId: Number(selectedDotId),
        ngayThu: batBuocFormData.ngayThu,
        ghiChu: batBuocFormData.ghiChu || "",
      });
      alert("Thu phí thành công");
      handleCloseModal();
      loadDataForDot(selectedDotId);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi thu phí");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenViewBatBuoc = (item) => {
    setEditingItem(item);
    setModalMode("view_bat_buoc");
    setShowModal(true);
  };

  const handleDeleteBatBuoc = async (item) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khoản thu này?")) {
      return;
    }
    try {
      await deleteThuPhiHoKhau(item.id);
      alert("Đã xóa khoản thu");
      loadDataForDot(selectedDotId);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  // ========== VOLUNTARY FEE (TU_NGUYEN) HANDLERS ==========

  const handleOpenCreateTuNguyen = () => {
    setFormData({
      hoKhauId: "",
      ngayThu: getDefaultDate(),
      tongPhi: "",
      ghiChu: "",
    });
    setEditingItem(null);
    setModalMode("create_tu_nguyen");
    setShowModal(true);
  };

  const handleSubmitTuNguyen = async (e) => {
    e.preventDefault();

    if (!formData.hoKhauId) {
      alert("Vui lòng chọn hộ khẩu");
      return;
    }

    if (!formData.ngayThu) {
      alert("Vui lòng chọn ngày thu");
      return;
    }

    if (!isDateInPeriod(formData.ngayThu)) {
      alert("Ngày thu phải nằm trong khoảng thời gian của đợt thu phí");
      return;
    }

    const tongPhiValue = Number(formData.tongPhi);
    if (!formData.tongPhi || Number.isNaN(tongPhiValue) || tongPhiValue <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }

    try {
      setIsSubmitting(true);
      await createThuPhiHoKhau({
        hoKhauId: Number(formData.hoKhauId),
        dotThuPhiId: Number(selectedDotId),
        ngayThu: formData.ngayThu,
        tongPhi: tongPhiValue,
        ghiChu: formData.ghiChu || "",
      });
      alert("Thêm khoản thu thành công");
      handleCloseModal();
      loadDataForDot(selectedDotId);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTuNguyen = async (item) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khoản thu này?")) {
      return;
    }
    try {
      await deleteThuPhiHoKhau(item.id);
      alert("Đã xóa khoản thu");
      loadDataForDot(selectedDotId);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode("");
    setEditingItem(null);
    setCalculatedData(null);
  };

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      DA_NOP: "Đã nộp",
      CHUA_NOP: "Chưa nộp",
    };
    return labels[trangThai] || trangThai;
  };

  // ========== RENDER HELPERS ==========

  const renderOverviewCards = () => {
    if (!selectedDot) return null;

    if (selectedDot.loai === "BAT_BUOC") {
      const totalHouseholds = overview?.tongHo || 0;
      const paid = overview?.soHoDaNop || 0;
      const unpaid = overview?.soHoChuaNop || 0;
      const totalMoney = overview?.tongDaThu || 0;

      return (
        <div className="overview-cards">
          <div className="overview-card">
            <div className="overview-icon">🏠</div>
            <div className="overview-content">
              <div className="overview-label">Tổng số hộ</div>
              <div className="overview-value">{totalHouseholds}</div>
            </div>
          </div>
          <div className="overview-card overview-success">
            <div className="overview-icon">✅</div>
            <div className="overview-content">
              <div className="overview-label">Đã thu</div>
              <div className="overview-value">{paid}</div>
            </div>
          </div>
          <div className="overview-card overview-warning">
            <div className="overview-icon">⏳</div>
            <div className="overview-content">
              <div className="overview-label">Chưa thu</div>
              <div className="overview-value">{unpaid}</div>
            </div>
          </div>
          <div className="overview-card overview-info">
            <div className="overview-icon">💰</div>
            <div className="overview-content">
              <div className="overview-label">Tổng tiền đã thu</div>
              <div className="overview-value">
                {Number(totalMoney || 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          </div>
        </div>
      );
    }

    // TU_NGUYEN summary computed from list
    const totalPayments = thuPhiRecords.length;
    const totalAmount = thuPhiRecords.reduce((sum, item) => sum + (item.tongPhi || 0), 0);

    return (
      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-icon">🧾</div>
          <div className="overview-content">
            <div className="overview-label">Số khoản thu</div>
            <div className="overview-value">{totalPayments}</div>
          </div>
        </div>
        <div className="overview-card overview-success">
          <div className="overview-icon">💰</div>
          <div className="overview-content">
            <div className="overview-label">Tổng tiền đã thu</div>
            <div className="overview-value">
              {Number(totalAmount || 0).toLocaleString("vi-VN")} đ
            </div>
          </div>
        </div>
        <div className="overview-card overview-info">
          <div className="overview-icon">📅</div>
          <div className="overview-content">
            <div className="overview-label">Khoảng thời gian</div>
            <div className="overview-value" style={{ fontSize: "14px" }}>
              {selectedDot
                ? `${new Date(selectedDot.ngayBatDau).toLocaleDateString("vi-VN")} - ${new Date(selectedDot.ngayKetThuc).toLocaleDateString("vi-VN")}`
                : ""}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBatBuocTable = () => {
    const households = overview?.households || [];

    const filteredHouseholds = households.filter((hk) => {
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "DA_NOP" && hk.trangThai === "DA_NOP") ||
        (statusFilter === "CHUA_NOP" && hk.trangThai === "CHUA_NOP");

      const keyword = searchTerm.trim().toLowerCase();
      const matchKeyword =
        keyword.length === 0 ||
        (hk.soHoKhau || "").toLowerCase().includes(keyword) ||
        (hk.tenChuHo || "").toLowerCase().includes(keyword);

      return matchStatus && matchKeyword;
    });

    return (
      <div className="table-container">
        <div className="filters-row">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dot-select"
            >
              <option value="ALL">Tất cả</option>
              <option value="DA_NOP">Đã nộp</option>
              <option value="CHUA_NOP">Chưa nộp</option>
            </select>
          </div>
          <div className="filter-group search-group">
            <label>Tìm kiếm:</label>
            <input
              type="text"
              placeholder="Số hộ khẩu hoặc tên chủ hộ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hộ khẩu</th>
              <th>Tên chủ hộ</th>
              <th>Trạng thái</th>
              <th>Tổng phí</th>
              <th>Ngày thu</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filteredHouseholds.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="empty-message">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredHouseholds.map((hk, index) => (
                <tr key={hk.hoKhauId || index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{hk.soHoKhau || "-"}</td>
                  <td>{hk.tenChuHo || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`status-badge status-${hk.trangThai}`}>
                      {getTrangThaiLabel(hk.trangThai)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {hk.trangThai === "DA_NOP" && hk.tongPhi
                      ? hk.tongPhi.toLocaleString("vi-VN") + " đ"
                      : "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {hk.ngayThu
                      ? new Date(hk.ngayThu).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  {canEdit && (
                    <td style={{ textAlign: "center" }}>
                      {hk.trangThai === "CHUA_NOP" ? (
                        <button
                          className="btn-thu-phi"
                          onClick={() => handleOpenThuPhiBatBuoc(hk)}
                          disabled={isSubmitting}
                        >
                          Thu phí
                        </button>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleOpenViewBatBuoc(hk)}
                          >
                            Chi tiết
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteBatBuoc(hk)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTuNguyenTable = () => {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hộ khẩu</th>
              <th>Tên chủ hộ</th>
              <th>Ngày thu</th>
              <th>Số tiền</th>
              <th>Ghi chú</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {thuPhiRecords.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="empty-message">
                  Chưa có khoản thu nào
                </td>
              </tr>
            ) : (
              thuPhiRecords.map((record, index) => (
                <tr key={record.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{record.soHoKhau || "-"}</td>
                  <td>{record.tenChuHo || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    {record.ngayThu
                      ? new Date(record.ngayThu).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {record.tongPhi
                      ? record.tongPhi.toLocaleString("vi-VN") + " đ"
                      : "-"}
                  </td>
                  <td>{record.ghiChu || "-"}</td>
                  {canEdit && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteTuNguyen(record)}
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
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    if (modalMode === "thu_phi_bat_buoc" && calculatedData) {
      return (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thu phí bắt buộc</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitBatBuoc} className="modal-form">
              <div className="info-display">
                <div className="info-row">
                  <span className="info-label">Hộ khẩu:</span>
                  <span className="info-value">
                    {calculatedData.soHoKhau} - {calculatedData.tenChuHo}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số người:</span>
                  <span className="info-value">{calculatedData.soNguoi || 0}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Định mức:</span>
                  <span className="info-value">
                    {(calculatedData.dinhMuc || 0).toLocaleString("vi-VN")} đ/người/tháng
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số tháng:</span>
                  <span className="info-value">{calculatedData.soThang || 0}</span>
                </div>
                <div className="info-row info-highlight">
                  <span className="info-label">Tổng phí:</span>
                  <span className="info-value">
                    {(calculatedData.tongPhi || 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Ngày thu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  value={batBuocFormData.ngayThu}
                  onChange={(e) =>
                    setBatBuocFormData({ ...batBuocFormData, ngayThu: e.target.value })
                  }
                  min={selectedDot?.ngayBatDau?.split("T")[0]}
                  max={selectedDot?.ngayKetThuc?.split("T")[0]}
                  required
                />
                <span className="field-hint">
                  Trong khoảng: {selectedDot?.ngayBatDau ? new Date(selectedDot.ngayBatDau).toLocaleDateString("vi-VN") : ""} 
                  {" - "}
                  {selectedDot?.ngayKetThuc ? new Date(selectedDot.ngayKetThuc).toLocaleDateString("vi-VN") : ""}
                </span>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={batBuocFormData.ghiChu}
                  onChange={(e) =>
                    setBatBuocFormData({ ...batBuocFormData, ghiChu: e.target.value })
                  }
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận thu phí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (modalMode === "view_bat_buoc" && editingItem) {
      const dinhMuc = selectedDot?.dinhMuc || 0;
      const soNguoi = editingItem.soNguoi || 0;
      const soThang = editingItem.soThang || 0;
      const tongPhi = editingItem.tongPhi || 0;
      const hasFormulaData = dinhMuc && soNguoi && soThang && tongPhi;
      const formulaText = hasFormulaData
        ? `${dinhMuc.toLocaleString("vi-VN")} × ${soNguoi} × ${soThang} = ${tongPhi.toLocaleString("vi-VN")} đ`
        : "Không đủ dữ liệu để hiển thị công thức";

      return (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết khoản thu</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-form detail-modal">
              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-label">Hộ khẩu</div>
                  <div className="detail-value strong">
                    {editingItem.soHoKhau} - {editingItem.tenChuHo}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Số người</div>
                  <div className="detail-value">{soNguoi || "-"}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Định mức</div>
                  <div className="detail-value">
                    {dinhMuc
                      ? `${dinhMuc.toLocaleString("vi-VN")} đ/người/tháng`
                      : "-"}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Số tháng</div>
                  <div className="detail-value">{soThang || "-"}</div>
                </div>
                <div className="detail-card highlight">
                  <div className="detail-label">Tổng phí</div>
                  <div className="detail-value emphasis">
                    {tongPhi ? `${tongPhi.toLocaleString("vi-VN")} đ` : "-"}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Ngày thu</div>
                  <div className="detail-value">
                    {editingItem.ngayThu
                      ? new Date(editingItem.ngayThu).toLocaleDateString("vi-VN")
                      : "-"}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Ghi chú</div>
                  <div className="detail-value note">{editingItem.ghiChu || "-"}</div>
                </div>
              </div>

              <div className="formula-card">
                <div className="detail-label">Công thức</div>
                <div className="formula-text">Định mức × Số người × Số tháng = Tổng phí</div>
                <div className="formula-value">{formulaText}</div>
              </div>

              <div className="form-actions" style={{ justifyContent: "space-between" }}>
                <div>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDeleteBatBuoc(editingItem)}
                  >
                    Xóa
                  </button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (modalMode === "create_tu_nguyen") {
      return (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm khoản thu</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitTuNguyen} className="modal-form" noValidate>
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
                >
                  <option value="">Chọn hộ khẩu</option>
                  {hoKhaus.map((hk) => (
                    <option key={hk.id} value={hk.id}>
                      {hk.soHoKhau} - {hk.tenChuHo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
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
                    min={selectedDot?.ngayBatDau?.split("T")[0]}
                    max={selectedDot?.ngayKetThuc?.split("T")[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Số tiền (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.tongPhi}
                    onChange={(e) =>
                      setFormData({ ...formData, tongPhi: e.target.value })
                    }
                    min="1000"
                    step="1000"
                    placeholder="Nhập số tiền"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) =>
                    setFormData({ ...formData, ghiChu: e.target.value })
                  }
                  rows="3"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return null;
  };

  // ========== MAIN RENDER ==========

  if (loading && dotThuPhis.length === 0) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="thu-phi-ho-khau-page">
      <div className="page-header">
        <h1 className="page-title">Thu phí hộ khẩu</h1>
        <div className="header-actions">
          {canEdit && selectedDot?.loai === "TU_NGUYEN" && (
            <button className="btn-add" onClick={handleOpenCreateTuNguyen}>
              + Thêm khoản thu
            </button>
          )}
          <button className="btn-refresh" onClick={handleRefresh} disabled={!selectedDotId}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <div className="filter-group">
          <label>Chọn đợt thu phí:</label>
          <select
            value={selectedDotId}
            onChange={(e) => setSelectedDotId(e.target.value)}
            className="dot-select"
          >
            <option value="">-- Chọn đợt thu phí --</option>
            {dotThuPhis.map((dot) => (
              <option key={dot.id} value={dot.id}>
                {dot.tenDot} ({dot.loai === "BAT_BUOC" ? "Bắt buộc" : "Tự nguyện"})
              </option>
            ))}
          </select>
        </div>

        {selectedDot && (
          <div className="period-info">
            <span className={`loai-badge loai-${selectedDot.loai}`}>
              {selectedDot.loai === "BAT_BUOC" ? "Bắt buộc" : "Tự nguyện"}
            </span>
            <span className="period-dates">
              {new Date(selectedDot.ngayBatDau).toLocaleDateString("vi-VN")} 
              {" - "}
              {new Date(selectedDot.ngayKetThuc).toLocaleDateString("vi-VN")}
            </span>
            {selectedDot.loai === "BAT_BUOC" && selectedDot.dinhMuc && (
              <span className="period-dinh-muc">
                Định mức: {selectedDot.dinhMuc.toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>
        )}
      </div>

      {selectedDotId && (
        <>
          {loading ? (
            <div className="page-loading">Đang tải dữ liệu...</div>
          ) : (
            <>
              {renderOverviewCards()}
              {selectedDot?.loai === "BAT_BUOC"
                ? renderBatBuocTable()
                : renderTuNguyenTable()}
            </>
          )}
        </>
      )}

      {!selectedDotId && (
        <div className="empty-state">
          <p>Vui lòng chọn một đợt thu phí để xem chi tiết</p>
        </div>
      )}

      {renderModal()}
    </div>
  );
}

export default ThuPhiHoKhauPage;
