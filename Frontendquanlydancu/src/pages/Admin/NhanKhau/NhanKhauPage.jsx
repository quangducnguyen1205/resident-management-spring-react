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

function NhanKhauPage() {
  const [nhanKhaus, setNhanKhaus] = useState([]);
  const [hoKhaus, setHoKhaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "tamtru", "tamvang", "khaitu"
  const [selectedNhanKhau, setSelectedNhanKhau] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    hoTen: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    danToc: "Kinh",
    quocTich: "Việt Nam",
    ngheNghiep: "",
    cmndCccd: "",
    ngayCap: "",
    noiCap: "",
    quanHeChuHo: "Chủ hộ",
    ghiChu: "",
    hoKhauId: "",
  });
  const [actionFormData, setActionFormData] = useState({
    ngayBatDau: "",
    ngayKetThuc: "",
    lyDo: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const role = localStorage.getItem("role");

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

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        hoTen: item.hoTen || "",
        ngaySinh: item.ngaySinh ? item.ngaySinh.split("T")[0] : "",
        gioiTinh: item.gioiTinh || "Nam",
        danToc: item.danToc || "Kinh",
        quocTich: item.quocTich || "Việt Nam",
        ngheNghiep: item.ngheNghiep || "",
        cmndCccd: item.cmndCccd || "",
        ngayCap: item.ngayCap ? item.ngayCap.split("T")[0] : "",
        noiCap: item.noiCap || "",
        quanHeChuHo: item.quanHeChuHo || "Chủ hộ",
        ghiChu: item.ghiChu || "",
        hoKhauId: item.hoKhauId || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        hoTen: "",
        ngaySinh: "",
        gioiTinh: "Nam",
        danToc: "Kinh",
        quocTich: "Việt Nam",
        ngheNghiep: "",
        cmndCccd: "",
        ngayCap: "",
        noiCap: "",
        quanHeChuHo: "Chủ hộ",
        ghiChu: "",
        hoKhauId: "",
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

  // Hàm validate dữ liệu nhân khẩu
  const validateForm = () => {
    const errors = {};
    
    // Validate CCCD
    if (formData.cmndCccd && !/^\d{12}$/.test(formData.cmndCccd)) {
      errors.cmndCccd = "Căn cước công dân phải gồm 12 số";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      const submitData = {
        ...formData,
        hoKhauId: Number(formData.hoKhauId),
        ngaySinh: formData.ngaySinh || null,
        ngayCap: formData.ngayCap || null,
      };
      if (editingItem) {
        // Cập nhật nhân khẩu
        await updateNhanKhau(editingItem.id, submitData);
        
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
              <th>CMND/CCCD</th>
              <th>Quan hệ chủ hộ</th>
              <th>Trạng thái</th>
              <th>Tạm vắng từ</th>
              <th>Tạm vắng đến</th>
              <th>Tạm trú từ</th>
              <th>Tạm trú đến</th>
              <th>Ghi chú</th>
              <th>Số hộ khẩu</th>
              {canEdit && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {nhanKhaus.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 16 : 15} className="empty-message">
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
                  <td>{nk.cmndCccd || "-"}</td>
                  <td>{nk.quanHeChuHo || "-"}</td>
                  <td>
                    <span className={`status-badge status-${nk.trangThaiHienTai || "THUONG_TRU"}`}>
                      {nk.trangThaiHienTai === "TAM_TRU" ? "Tạm trú" :
                       nk.trangThaiHienTai === "TAM_VANG" ? "Tạm vắng" :
                       nk.trangThaiHienTai === "KHAI_TU" ? "Khai tử" : "Thường trú"}
                    </span>
                  </td>
                  <td>
                    {nk.tamVangTu
                      ? new Date(nk.tamVangTu).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    {nk.tamVangDen
                      ? new Date(nk.tamVangDen).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    {nk.tamTruTu
                      ? new Date(nk.tamTruTu).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    {nk.tamTruDen
                      ? new Date(nk.tamTruDen).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="ghi-chu-cell" title={nk.ghiChu}>
                    {nk.ghiChu || "-"}
                  </td>
                  <td>{getSoHoKhau(nk.hoKhauId)}</td>
                  {canEdit && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(nk)}
                          title="Sửa thông tin"
                        >
                          Sửa
                        </button>
                        {nk.trangThaiHienTai !== "TAM_TRU" && (
                          <button
                            className="btn-tamtru"
                            onClick={() => handleOpenActionModal(nk, "tamtru")}
                            title="Đăng ký tạm trú"
                          >
                            Tạm trú
                          </button>
                        )}
                        {nk.trangThaiHienTai === "TAM_TRU" && (
                          <button
                            className="btn-cancel-tamtru"
                            onClick={() => handleCancelTamTru(nk.id)}
                            title="Hủy tạm trú"
                          >
                            Hủy TT
                          </button>
                        )}
                        {nk.trangThaiHienTai !== "TAM_VANG" && (
                          <button
                            className="btn-tamvang"
                            onClick={() => handleOpenActionModal(nk, "tamvang")}
                            title="Đăng ký tạm vắng"
                          >
                            Tạm vắng
                          </button>
                        )}
                        {nk.trangThaiHienTai === "TAM_VANG" && (
                          <button
                            className="btn-cancel-tamvang"
                            onClick={() => handleCancelTamVang(nk.id)}
                            title="Hủy tạm vắng"
                          >
                            Hủy TV
                          </button>
                        )}
                        {nk.trangThaiHienTai !== "KHAI_TU" && (
                          <button
                            className="btn-khaitu"
                            onClick={() => handleOpenActionModal(nk, "khaitu")}
                            title="Khai tử"
                          >
                            Khai tử
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(nk.id)}
                          title="Xóa nhân khẩu"
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
              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                    required
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
                  />
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
              <div className="form-row">
                <div className="form-group">
                  <label>CMND/CCCD</label>
                  <input
                    type="text"
                    value={formData.cmndCccd}
                    onChange={(e) => setFormData({ ...formData, cmndCccd: e.target.value })}
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
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nơi cấp</label>
                <input
                  type="text"
                  value={formData.noiCap}
                  onChange={(e) => setFormData({ ...formData, noiCap: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quan hệ chủ hộ</label>
                  <select
                    value={formData.quanHeChuHo}
                    onChange={(e) => setFormData({ ...formData, quanHeChuHo: e.target.value })}
                  >
                    <option
                      value="Chủ hộ"
                      disabled={
                        editingItem?.quanHeChuHo === "Chủ hộ"
                          ? false
                          : formData.hoKhauId && hoKhauHasChuHo.has(Number(formData.hoKhauId))
                      }
                    >
                      Chủ hộ
                    </option>
                    <option value="Vợ/Chồng">Vợ/Chồng</option>
                    <option value="Con">Con</option>
                    <option value="Bố/Mẹ">Bố/Mẹ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
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
                    disabled={!!editingItem}
                  >
                    <option value="">Chọn hộ khẩu</option>
                    {hoKhaus.map((hk) => (
                      <option key={hk.id} value={hk.id}>
                        {hk.soHoKhau}
                      </option>
                    ))}
                  </select>
                </div>
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
        </div>
      )}

      {/* Modal thao tác (Tạm trú, Tạm vắng, Khai tử) */}
      {showActionModal && selectedNhanKhau && (
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
      )}
    </div>
  );
}

export default NhanKhauPage;

