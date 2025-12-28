import { useState, useEffect, useMemo } from "react";
import {
  getAllNhanKhau,
  createNhanKhau,
  updateNhanKhau,
  deleteNhanKhau,
  searchNhanKhau,
  registerTamTru,
  cancelTamTru,
  registerTamVang,
  cancelTamVang,
  registerKhaiTu,
} from "../../../api/nhanKhauApi";
import { getAllHoKhau, updateHoKhau } from "../../../api/hoKhauApi";
import NoPermission from "../NoPermission";
import "./NhanKhauPage.css";

// Tính tuổi từ ngày sinh (yyyy-MM-dd)
const calculateAge = (dateStr) => {
  if (!dateStr) return null;
  const birth = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

function NhanKhauPage() {
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "tamtru", "tamvang", "khaitu"
  const [selectedNhanKhau, setSelectedNhanKhau] = useState(null);
  const [detailNhanKhau, setDetailNhanKhau] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    hoTen: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    danToc: "Kinh",
    quocTich: "Việt Nam",
    queQuan: "",
    ngheNghiep: "",
    cmndCccd: "",
    ngayCap: "",
    noiCap: "",
    quanHeChuHo: "Chủ hộ",
    ghiChu: "",
    hoKhauId: "",
    newChuHoId: "", // Field mới: ID của chủ hộ được chọn thay thế
    trangThai: "Thường trú", // Field mới: Trạng thái nhân khẩu
  });
  // Danh sách ứng viên cho vị trí Chủ hộ mới (cùng hộ khẩu, trừ bản thân)
  const [otherMembers, setOtherMembers] = useState([]);
  const [actionFormData, setActionFormData] = useState({
    ngayBatDau: "",
    ngayKetThuc: "",
    lyDo: "",
  });
  // State for Confirmation Dialog when transferring last member
  const [showConfirmDeleteHoKhau, setShowConfirmDeleteHoKhau] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const role = localStorage.getItem("role");

  const age = useMemo(() => calculateAge(formData.ngaySinh), [formData.ngaySinh]);
  const isUnder14 = age !== null && age < 14;

  // Các hộ khẩu đã có chủ hộ (dùng để chặn chọn thêm "Chủ hộ")
  const hoKhauHasChuHo = useMemo(() => {
    const set = new Set();
    nhanKhaus.forEach((nk) => {
      if (nk.quanHeChuHo === "Chủ hộ" && nk.hoKhauId) {
        set.add(Number(nk.hoKhauId));
      }
    });
    return set;
  }, [nhanKhaus]);

  const allowedRoles = ["ADMIN", "TOTRUONG", "KETOAN"];
  const canEdit = role === "ADMIN" || role === "TOTRUONG";

  if (!allowedRoles.includes(role)) {
    return <NoPermission />;
  }

  // Calculate Lock State: Locked if originally Dead AND still Dead in form
  const isLocked = (editingItem?.trangThai === 'KHAI_TU' || editingItem?.trangThai === 'Đã mất') && (formData.trangThai === 'KHAI_TU' || formData.trangThai === 'Đã mất');

  useEffect(() => {
    loadNhanKhaus();
    loadHoKhaus();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      loadNhanKhaus();
    }
  }, [searchTerm]);

  const loadNhanKhaus = async () => {
    try {
      setLoading(true);
      const data = await getAllNhanKhau();
      setNhanKhaus(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách nhân khẩu");
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadNhanKhaus();
      return;
    }
    try {
      setLoading(true);
      const data = await searchNhanKhau(searchTerm);
      setNhanKhaus(data || []);
    } catch (err) {
      setError("Không thể tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  // Lấy số hộ khẩu từ ID
  const getSoHoKhau = (hoKhauId) => {
    const hoKhau = hoKhaus.find((hk) => hk.id === hoKhauId);
    return hoKhau?.soHoKhau || "-";
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        hoTen: item.hoTen || "",
        ngaySinh: item.ngaySinh ? item.ngaySinh.split("T")[0] : "",
        gioiTinh: item.gioiTinh || "Nam",
        danToc: item.danToc || "Kinh",
        quocTich: item.quocTich || "Việt Nam",
        queQuan: item.queQuan || "",
        ngheNghiep: item.ngheNghiep || "",
        cmndCccd: item.cmndCccd || "",
        ngayCap: item.ngayCap ? item.ngayCap.split("T")[0] : "",
        noiCap: item.noiCap || "",
        quanHeChuHo: item.quanHeChuHo || "Chủ hộ",
        ghiChu: item.ghiChu || "",
        hoKhauId: item.hoKhauId || "",
        newChuHoId: "",
        trangThai: item.trangThai || "Thường trú",
      });
      // Nếu đang sửa Chủ hộ, tìm các thành viên khác để chuẩn bị cho việc chuyển quyền
      if (item.quanHeChuHo === "Chủ hộ" && item.hoKhauId) {
        setOtherMembers(
          nhanKhaus.filter(nk => Number(nk.hoKhauId) === Number(item.hoKhauId) && nk.id !== item.id)
        );
      } else {
        setOtherMembers([]);
      }
    } else {
      setEditingItem(null);
      setFormData({
        hoTen: "",
        ngaySinh: "",
        gioiTinh: "Nam",
        danToc: "Kinh",
        quocTich: "Việt Nam",
        queQuan: "",
        ngheNghiep: "",
        cmndCccd: "",
        ngayCap: "",
        noiCap: "",
        quanHeChuHo: "Chủ hộ",
        ghiChu: "",
        hoKhauId: "",
        trangThai: "Thường trú",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setValidationErrors({});
    setSubmitError("");
  };

  // Nếu người được chọn < 14 tuổi, tự xóa dữ liệu CCCD và xóa lỗi liên quan
  useEffect(() => {
    if (!isUnder14) return;
    setFormData((prev) => {
      if (!prev.cmndCccd && !prev.ngayCap && !prev.noiCap) return prev;
      return { ...prev, cmndCccd: "", ngayCap: "", noiCap: "" };
    });
    setValidationErrors((prev) => {
      if (!prev.cmndCccd && !prev.ngayCap && !prev.noiCap) return prev;
      const next = { ...prev };
      delete next.cmndCccd;
      delete next.ngayCap;
      delete next.noiCap;
      return next;
    });
  }, [isUnder14]);

  // Hàm validate dữ liệu nhân khẩu
  const validateForm = () => {
    const errors = {};

    const birthDate = parseDate(formData.ngaySinh);
    if (!birthDate) {
      errors.ngaySinh = "Ngày sinh không hợp lệ";
      return errors;
    }

    if (age !== null && age < 14) {
      const hasCccdData =
        (formData.cmndCccd && formData.cmndCccd.trim() !== "") ||
        formData.ngayCap ||
        (formData.noiCap && formData.noiCap.trim() !== "");
      if (hasCccdData) {
        const msg = "Người dưới 14 tuổi không được nhập thông tin CMND/CCCD";
        errors.cmndCccd = msg;
        errors.ngayCap = msg;
        errors.noiCap = msg;
      }
      return errors;
    }

    if (age !== null && age >= 14) {
      if (!formData.cmndCccd || formData.cmndCccd.trim() === "") {
        errors.cmndCccd = "Người từ 14 tuổi trở lên phải nhập CMND/CCCD";
      } else if (!/^\d{12}$/.test(formData.cmndCccd)) {
        errors.cmndCccd = "CMND/CCCD phải gồm 12 chữ số";
      }

      const issuanceDate = parseDate(formData.ngayCap);
      if (!formData.ngayCap) {
        errors.ngayCap = "Người từ 14 tuổi trở lên phải nhập ngày cấp";
      } else if (!issuanceDate) {
        errors.ngayCap = "Ngày cấp không hợp lệ";
      } else {
        const minIssuance = new Date(birthDate);
        minIssuance.setFullYear(minIssuance.getFullYear() + 14);
        const today = new Date();
        if (issuanceDate < minIssuance) {
          errors.ngayCap = `Ngày cấp phải sau ngày sinh ít nhất 14 năm (từ ${minIssuance.toLocaleDateString("vi-VN")})`;
        } else if (issuanceDate > today) {
          errors.ngayCap = "Ngày cấp không được lớn hơn hôm nay";
        }
      }

      if (!formData.noiCap || formData.noiCap.trim() === "") {
        errors.noiCap = "Người từ 14 tuổi trở lên phải nhập nơi cấp";
      }
    }

    return errors;
  };

  const handleOpenActionModal = (item, type) => {
    setSelectedNhanKhau(item);
    setActionType(type);
    setActionFormData({
      ngayBatDau: "",
      ngayKetThuc: "",
      lyDo: "",
    });
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setSelectedNhanKhau(null);
    setActionType("");
  };

  const handleOpenDetailModal = (item) => {
    setDetailNhanKhau(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailNhanKhau(null);
  };

  const handleEditFromDetail = () => {
    if (!detailNhanKhau) return;
    handleCloseDetailModal();
    handleOpenModal(detailNhanKhau);
  };

  const handleActionFromDetail = (type) => {
    if (!detailNhanKhau) return;
    handleCloseDetailModal();
    handleOpenActionModal(detailNhanKhau, type);
  };

  const handleCancelTamTruFromDetail = () => {
    if (!detailNhanKhau) return;
    handleCloseDetailModal();
    handleCancelTamTru(detailNhanKhau.id);
  };

  const handleCancelTamVangFromDetail = () => {
    if (!detailNhanKhau) return;
    handleCloseDetailModal();
    handleCancelTamVang(detailNhanKhau.id);
  };

  const handleDeleteFromDetail = () => {
    if (!detailNhanKhau) return;
    handleCloseDetailModal();
    handleDelete(detailNhanKhau.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.queQuan.trim()) {
      alert("Vui lòng nhập quê quán");
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitError("");
      return;
    }
    setValidationErrors({});
    setSubmitError("");

    const selectedHoKhauHasChuHo = formData.hoKhauId
      ? hoKhauHasChuHo.has(Number(formData.hoKhauId))
      : false;
    const allowChuHoOption = editingItem?.quanHeChuHo === "Chủ hộ" || !selectedHoKhauHasChuHo;

    if (!allowChuHoOption && formData.quanHeChuHo === "Chủ hộ") {
      setSubmitError("Hộ khẩu này đã có chủ hộ, hãy chọn quan hệ khác.");
      return;
    }

    try {
      const cleanedCmndCccd = formData.cmndCccd?.trim() || null;
      const cleanedNoiCap = formData.noiCap?.trim() || null;
      const cleanedQueQuan = formData.queQuan.trim();
      const submitData = {
        ...formData,
        cmndCccd: isUnder14 ? null : cleanedCmndCccd,
        noiCap: isUnder14 ? null : cleanedNoiCap,
        queQuan: cleanedQueQuan,
        hoKhauId: Number(formData.hoKhauId),
        ngaySinh: formData.ngaySinh || null,
        ngayCap: isUnder14 ? null : formData.ngayCap || null,
        newChuHoId: formData.newChuHoId ? Number(formData.newChuHoId) : null,
      };
      if (editingItem) {
        // Validation: Hộ khẩu cũ bị xóa?
        if (submitData.hoKhauId !== editingItem.hoKhauId) {
          const livingInOld = nhanKhaus.filter(nk => Number(nk.hoKhauId) === Number(editingItem.hoKhauId) && nk.trangThai !== "KHAI_TU").length;
          // livingInOld bao gồm cả người đang chuyển. Nếu chỉ còn 1 người (chính là mình) -> Cảnh báo
          if (livingInOld <= 1) {
            setPendingPayload(submitData);
            setShowConfirmDeleteHoKhau(true);
            return;
          }
        }

        // Cập nhật nhân khẩu
        await executeUpdate(submitData);
      } else {
        await createNhanKhau(submitData);
        alert("Tạo nhân khẩu thành công!");
      }
      handleCloseModal();
      loadNhanKhaus();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra!";
      setSubmitError(errorMsg);
    }
  };

  const executeUpdate = async (data) => {
    await updateNhanKhau(editingItem.id, data);

    // Nếu đây là chủ hộ và tên đã thay đổi, cập nhật tên chủ hộ trong hộ khẩu
    if (editingItem.quanHeChuHo === "Chủ hộ" && editingItem.hoTen !== formData.hoTen) {
      try {
        const hoKhau = hoKhaus.find((hk) => hk.id === Number(formData.hoKhauId));
        if (hoKhau) {
          await updateHoKhau(hoKhau.id, {
            ...hoKhau,
            tenChuHo: formData.hoTen,
          });
        }
      } catch (err) {
        console.error("Không thể cập nhật tên chủ hộ:", err);
      }
    }
    alert("Cập nhật nhân khẩu thành công!");
  };

  const handleConfirmTransfer = async () => {
    if (!pendingPayload) return;
    try {
      await executeUpdate(pendingPayload);
      setShowConfirmDeleteHoKhau(false);
      setPendingPayload(null);
      handleCloseModal();
      loadNhanKhaus();
      alert("Đã chuyển hộ khẩu. Hộ khẩu cũ đã bị xóa khỏi hệ thống.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra!";
      setSubmitError(errorMsg);
      setShowConfirmDeleteHoKhau(false);
    }
  };


  const handleActionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (actionType === "tamtru") {
        await registerTamTru(selectedNhanKhau.id, actionFormData);
        alert("Đăng ký tạm trú thành công!");
      } else if (actionType === "tamvang") {
        await registerTamVang(selectedNhanKhau.id, actionFormData);
        alert("Đăng ký tạm vắng thành công!");
      } else if (actionType === "khaitu") {
        await registerKhaiTu(selectedNhanKhau.id, { lyDo: actionFormData.lyDo });
        alert("Khai tử thành công!");
      }
      handleCloseActionModal();
      loadNhanKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleCancelTamTru = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tạm trú?")) {
      return;
    }
    try {
      await cancelTamTru(id);
      alert("Hủy đăng ký tạm trú thành công!");
      loadNhanKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleCancelTamVang = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tạm vắng?")) {
      return;
    }
    try {
      await cancelTamVang(id);
      alert("Hủy đăng ký tạm vắng thành công!");
      loadNhanKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân khẩu này?")) {
      return;
    }
    try {
      await deleteNhanKhau(id);
      alert("Xóa nhân khẩu thành công!");
      loadNhanKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  if (loading && nhanKhaus.length === 0) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="nhan-khau-page">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Nhân Khẩu</h1>
        <div className="header-actions">
          {canEdit && (
            <button className="btn-add" onClick={() => handleOpenModal()}>
              + Thêm nhân khẩu
            </button>
          )}
          <button className="btn-refresh" onClick={loadNhanKhaus}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên..."
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
              <th>Họ tên</th>
              <th>Ngày sinh</th>
              <th>Dân tộc</th>
              <th>Quốc tịch</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
              <th>Số hộ khẩu</th>
              <th>Quan hệ chủ hộ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {nhanKhaus.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-message">
                  {searchTerm ? "Không tìm thấy kết quả" : "Chưa có nhân khẩu nào"}
                </td>
              </tr>
            ) : (
              nhanKhaus.map((nk, index) => (
                <tr key={nk.id}>
                  <td>{index + 1}</td>
                  <td>{nk.hoTen || "-"}</td>
                  <td>
                    {nk.ngaySinh
                      ? new Date(nk.ngaySinh).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>{nk.danToc || "-"}</td>
                  <td>{nk.quocTich || "-"}</td>
                  <td>{nk.gioiTinh || "-"}</td>
                  <td>
                    <span className={`status-badge status-${nk.trangThaiHienTai || "THUONG_TRU"}`}>
                      {nk.trangThaiHienTai === "TAM_TRU" ? "Tạm trú" :
                        nk.trangThaiHienTai === "TAM_VANG" ? "Tạm vắng" :
                          nk.trangThaiHienTai === "KHAI_TU" ? "Khai tử" : "Thường trú"}
                    </span>
                  </td>
                  <td>{getSoHoKhau(nk.hoKhauId)}</td>
                  <td>{nk.quanHeChuHo || "-"}</td>
                  <td>
                    <button
                      className="btn-detail"
                      onClick={() => handleOpenDetailModal(nk)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết nhân khẩu */}
      {showDetailModal && detailNhanKhau && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="nhankhau-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nhankhau-detail-header">
              <h2>Chi tiết nhân khẩu</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>
                ×
              </button>
            </div>

            <div className="nhankhau-detail-body">
              <div className="nhankhau-detail-section">
                <div className="nhankhau-section-title">Thông tin cơ bản</div>
                <div className="nhankhau-detail-grid">
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Họ tên</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.hoTen || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Giới tính</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.gioiTinh || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Ngày sinh</span>
                    <span className="nhankhau-field-value">{formatDate(detailNhanKhau.ngaySinh)}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Quê quán</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.queQuan || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Dân tộc</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.danToc || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Quốc tịch</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.quocTich || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="nhankhau-detail-section">
                <div className="nhankhau-section-title">Giấy tờ & nghề nghiệp</div>
                <div className="nhankhau-detail-grid">
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">CMND/CCCD</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.cmndCccd || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Ngày cấp</span>
                    <span className="nhankhau-field-value">{formatDate(detailNhanKhau.ngayCap)}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Nơi cấp</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.noiCap || "-"}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Nghề nghiệp</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.ngheNghiep || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="nhankhau-detail-section">
                <div className="nhankhau-section-title">Hộ khẩu & quan hệ</div>
                <div className="nhankhau-detail-grid">
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Số hộ khẩu</span>
                    <span className="nhankhau-field-value">{getSoHoKhau(detailNhanKhau.hoKhauId)}</span>
                  </div>
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Quan hệ chủ hộ</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.quanHeChuHo || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="nhankhau-detail-section">
                <div className="nhankhau-section-title">Trạng thái cư trú</div>
                <div className="nhankhau-detail-grid">
                  <div className="nhankhau-field-card">
                    <span className="nhankhau-field-label">Trạng thái hiện tại</span>
                    <span className="nhankhau-field-value">
                      <span className={`status-badge status-${detailNhanKhau.trangThaiHienTai || "THUONG_TRU"}`}>
                        {detailNhanKhau.trangThaiHienTai === "TAM_TRU"
                          ? "Tạm trú"
                          : detailNhanKhau.trangThaiHienTai === "TAM_VANG"
                            ? "Tạm vắng"
                            : detailNhanKhau.trangThaiHienTai === "KHAI_TU"
                              ? "Khai tử"
                              : "Thường trú"}
                      </span>
                    </span>
                  </div>
                  {detailNhanKhau.trangThaiHienTai === "TAM_VANG" && (
                    <>
                      <div className="nhankhau-field-card">
                        <span className="nhankhau-field-label">Tạm vắng từ</span>
                        <span className="nhankhau-field-value">{formatDate(detailNhanKhau.tamVangTu)}</span>
                      </div>
                      <div className="nhankhau-field-card">
                        <span className="nhankhau-field-label">Tạm vắng đến</span>
                        <span className="nhankhau-field-value">{formatDate(detailNhanKhau.tamVangDen)}</span>
                      </div>
                    </>
                  )}
                  {detailNhanKhau.trangThaiHienTai === "TAM_TRU" && (
                    <>
                      <div className="nhankhau-field-card">
                        <span className="nhankhau-field-label">Tạm trú từ</span>
                        <span className="nhankhau-field-value">{formatDate(detailNhanKhau.tamTruTu)}</span>
                      </div>
                      <div className="nhankhau-field-card">
                        <span className="nhankhau-field-label">Tạm trú đến</span>
                        <span className="nhankhau-field-value">{formatDate(detailNhanKhau.tamTruDen)}</span>
                      </div>
                    </>
                  )}
                  <div className="nhankhau-field-card nhankhau-field-full">
                    <span className="nhankhau-field-label">Ghi chú</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.ghiChu || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="nhankhau-detail-section">
                <div className="nhankhau-section-title">Khác</div>
                <div className="nhankhau-detail-grid">
                  <div className="nhankhau-field-card nhankhau-field-full">
                    <span className="nhankhau-field-label">Ghi chú</span>
                    <span className="nhankhau-field-value">{detailNhanKhau.ghiChu || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="nhankhau-detail-footer">
                <div className="nhankhau-action-buttons">
                  <button className="btn-edit" onClick={handleEditFromDetail}>
                    Sửa
                  </button>

                  {/* Buttons hidden if Deceased */}
                  {detailNhanKhau.trangThaiHienTai !== "KHAI_TU" && (
                    <>
                      {detailNhanKhau.trangThaiHienTai !== "TAM_TRU" ? (
                        <button
                          className="btn-tamtru"
                          onClick={() => handleActionFromDetail("tamtru")}
                        >
                          Tạm trú
                        </button>
                      ) : (
                        <button
                          className="btn-cancel-tamtru"
                          onClick={handleCancelTamTruFromDetail}
                        >
                          Hủy tạm trú
                        </button>
                      )}

                      {detailNhanKhau.trangThaiHienTai !== "TAM_VANG" ? (
                        <button
                          className="btn-tamvang"
                          onClick={() => handleActionFromDetail("tamvang")}
                        >
                          Tạm vắng
                        </button>
                      ) : (
                        <button
                          className="btn-cancel-tamvang"
                          onClick={handleCancelTamVangFromDetail}
                        >
                          Hủy tạm vắng
                        </button>
                      )}

                      <button
                        className="btn-khaitu"
                        onClick={() => handleActionFromDetail("khaitu")}
                      >
                        Khai tử
                      </button>
                    </>
                  )}

                  <button className="btn-delete" onClick={handleDeleteFromDetail}>
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? "Sửa nhân khẩu" : "Thêm nhân khẩu mới"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {submitError && (
                <div className="error-message" style={{ marginBottom: "20px" }}>
                  {submitError}
                </div>
              )}

              {isLocked && (
                <div style={{ backgroundColor: "#fff3cd", color: "#856404", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ffeeba" }}>
                  <strong>⚠ Nhân khẩu đã Khai tử/Đã mất.</strong><br />
                  Thông tin bị khóa. Để chỉnh sửa, vui lòng đổi <strong>Trạng thái</strong> sang "Thường trú" (Hủy khai tử).
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    required
                    disabled={isLocked}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giới tính <span className="required">*</span></label>
                  <select
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                    required
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dân tộc <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.danToc}
                    onChange={(e) => setFormData({ ...formData, danToc: e.target.value })}
                    required
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                  >
                    <option value="Thường trú">Thường trú</option>
                    <option value="Tạm trú">Tạm trú</option>
                    <option value="Tạm vắng">Tạm vắng</option>
                    <option value="KHAI_TU">Đã mất (Khai tử)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quốc tịch <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.quocTich}
                    onChange={(e) => setFormData({ ...formData, quocTich: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nghề nghiệp</label>
                  <input
                    type="text"
                    value={formData.ngheNghiep}
                    onChange={(e) => setFormData({ ...formData, ngheNghiep: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Quê quán <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.queQuan}
                  onChange={(e) =>
                    setFormData({ ...formData, queQuan: e.target.value })
                  }
                  placeholder="Nhập quê quán"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CMND/CCCD</label>
                  <input
                    type="text"
                    value={formData.cmndCccd}
                    onChange={(e) => setFormData({ ...formData, cmndCccd: e.target.value })}
                    disabled={isUnder14}
                    placeholder={isUnder14 ? "Dưới 14 tuổi không nhập" : "Nhập 12 chữ số"}
                  />
                  {validationErrors.cmndCccd && (
                    <span className="error-message">{validationErrors.cmndCccd}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Ngày cấp</label>
                  <input
                    type="date"
                    value={formData.ngayCap}
                    onChange={(e) => setFormData({ ...formData, ngayCap: e.target.value })}
                    disabled={isUnder14}
                  />
                  {validationErrors.ngayCap && (
                    <span className="error-message">{validationErrors.ngayCap}</span>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Nơi cấp</label>
                <input
                  type="text"
                  value={formData.noiCap}
                  onChange={(e) => setFormData({ ...formData, noiCap: e.target.value })}
                  disabled={isUnder14}
                  placeholder={isUnder14 ? "Dưới 14 tuổi không nhập" : "Nhập nơi cấp"}
                />
                {validationErrors.noiCap && (
                  <span className="error-message">{validationErrors.noiCap}</span>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quan hệ với chủ hộ <span className="required">*</span></label>
                  <select
                    value={formData.quanHeChuHo}
                    onChange={(e) => setFormData({ ...formData, quanHeChuHo: e.target.value })}
                    required
                  >
                    {/* Nếu đang sửa Chủ hộ, vẫn cho phép chọn thành viên để kích hoạt tính năng chuyển quyền,
                       Nhưng nếu hộ khẩu đã có chủ hộ (và không phải mình), thì không cho chọn Chủ hộ */}
                    {!(hoKhauHasChuHo.has(Number(formData.hoKhauId)) && editingItem?.quanHeChuHo !== "Chủ hộ") && (
                      <option value="Chủ hộ">Chủ hộ</option>
                    )}
                    <option value="Vợ/Chồng">Vợ/Chồng</option>
                    <option value="Con">Con</option>
                    <option value="Bố/Mẹ">Bố/Mẹ</option>
                    <option value="Ông/Bà">Ông/Bà</option>
                    <option value="Cháu">Cháu</option>
                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                    <option value="Thành viên">Thành viên</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              {/* SECTION: Chọn chủ hộ mới (Chỉ hiện khi đang là Chủ hộ và đổi sang vai trò khác, VÀ KHÔNG PHẢI LÀ CHUYỂN HỘ) */}
              {editingItem?.quanHeChuHo === "Chủ hộ" && formData.quanHeChuHo !== "Chủ hộ" && Number(formData.hoKhauId) === Number(editingItem?.hoKhauId) && (
                <div className="form-row" style={{ backgroundColor: "#fff3cd", padding: "10px", borderRadius: "5px", border: "1px solid #ffeeba" }}>
                  <div className="form-group" style={{ width: "100%" }}>
                    <label style={{ color: "#856404" }}>
                      ⚠ Bạn đang hủy quyền Chủ hộ. Vui lòng chọn Chủ hộ mới: <span className="required">*</span>
                    </label>
                    <select
                      value={formData.newChuHoId}
                      onChange={(e) => setFormData({ ...formData, newChuHoId: e.target.value })}
                      required
                      className="form-control"
                    >
                      <option value="">-- Chọn thành viên kế nhiệm --</option>
                      {otherMembers.map(mem => (
                        <option key={mem.id} value={mem.id}>
                          {mem.hoTen} (quan hệ: {mem.quanHeChuHo})
                        </option>
                      ))}
                    </select>
                    {otherMembers.length === 0 && (
                      <div style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
                        Không còn thành viên nào khác để chuyển quyền! Bạn không thể thực hiện thao tác này.
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Hộ khẩu <span className="required">*</span></label>
                <select
                  value={formData.hoKhauId}
                  onChange={(e) => {
                    const value = e.target.value;
                    const hasChuHo = value ? hoKhauHasChuHo.has(Number(value)) : false;
                    setFormData((prev) => {
                      const next = { ...prev, hoKhauId: value };
                      if (hasChuHo && prev.quanHeChuHo === "Chủ hộ" && prev.quanHeChuHo !== (editingItem?.quanHeChuHo || "")) {
                        next.quanHeChuHo = "Vợ/Chồng";
                      }
                      return next;
                    });
                  }}
                  required
                  disabled={isLocked}
                >
                  <option value="">Chọn hộ khẩu</option>
                  {hoKhaus.map((hk) => (
                    <option key={hk.id} value={hk.id}>
                      {hk.soHoKhau}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
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
        </div >
      )
      }

      {/* Modal thao tác (Tạm trú, Tạm vắng, Khai tử) */}
      {
        showActionModal && selectedNhanKhau && (
          <div className="modal-overlay" onClick={handleCloseActionModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {actionType === "tamtru" && "Đăng Ký Tạm Trú"}
                  {actionType === "tamvang" && "Đăng Ký Tạm Vắng"}
                  {actionType === "khaitu" && "Khai Tử"}
                </h2>
                <button className="modal-close" onClick={handleCloseActionModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleActionSubmit} className="modal-form">
                <div className="form-group">
                  <label>Nhân khẩu</label>
                  <input
                    type="text"
                    value={selectedNhanKhau.hoTen || ""}
                    disabled
                    className="disabled-input"
                  />
                </div>
                {actionType !== "khaitu" && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Ngày bắt đầu <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          value={actionFormData.ngayBatDau}
                          onChange={(e) =>
                            setActionFormData({
                              ...actionFormData,
                              ngayBatDau: e.target.value,
                            })
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
                          value={actionFormData.ngayKetThuc}
                          onChange={(e) =>
                            setActionFormData({
                              ...actionFormData,
                              ngayKetThuc: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        Lý do <span className="required">*</span>
                      </label>
                      <textarea
                        value={actionFormData.lyDo}
                        onChange={(e) =>
                          setActionFormData({
                            ...actionFormData,
                            lyDo: e.target.value,
                          })
                        }
                        required
                        rows="3"
                        placeholder="Nhập lý do..."
                      />
                    </div>
                  </>
                )}
                {actionType === "khaitu" && (
                  <div className="form-group">
                    <label>
                      Lý do khai tử <span className="required">*</span>
                    </label>
                    <textarea
                      value={actionFormData.lyDo}
                      onChange={(e) =>
                        setActionFormData({
                          ...actionFormData,
                          lyDo: e.target.value,
                        })
                      }
                      required
                      rows="4"
                      placeholder="Nhập lý do khai tử..."
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCloseActionModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit">
                    {actionType === "tamtru" && "Đăng ký tạm trú"}
                    {actionType === "tamvang" && "Đăng ký tạm vắng"}
                    {actionType === "khaitu" && "Khai tử"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* Modal xác nhận xóa hộ khẩu khi chuyển đi */}
      {
        showConfirmDeleteHoKhau && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header" style={{ borderBottom: 'none' }}>
                <h3 style={{ color: '#dc3545' }}>⚠ Cảnh báo</h3>
              </div>
              <div className="modal-body">
                <p>Bạn là thành viên duy nhất của hộ khẩu hiện tại.</p>
                <p>Sau khi bạn chuyển đi, <strong>Hộ khẩu cũ sẽ bị xóa vĩnh viễn</strong>.</p>
                <p>Bạn có chắc chắn muốn tiếp tục?</p>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowConfirmDeleteHoKhau(false)}>Hủy</button>
                <button className="btn-submit" style={{ backgroundColor: '#dc3545' }} onClick={handleConfirmTransfer}>Xác nhận chuyển</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default NhanKhauPage;

