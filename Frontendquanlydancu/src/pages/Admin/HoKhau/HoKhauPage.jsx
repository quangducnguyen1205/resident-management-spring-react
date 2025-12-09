import { useState, useEffect } from "react";
import {
  getAllHoKhau,
  getHoKhauById,
  createHoKhau,
  updateHoKhau,
  deleteHoKhau,
} from "../../../api/hoKhauApi";
import {
  createNhanKhau,
  getAllNhanKhau,
  updateNhanKhau,
} from "../../../api/nhanKhauApi";
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
  const [chuHoData, setChuHoData] = useState({
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
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setChuHoData({
        hoTen: item.tenChuHo || "",
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
      });
    } else {
      setEditingItem(null);
      setFormData({
        soHoKhau: "",
        tenChuHo: "",
        diaChi: "",
      });
      setChuHoData({
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
      });
      setValidationErrors({});
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
    setChuHoData({
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
    });
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Cập nhật hộ khẩu
        await updateHoKhau(editingItem.id, formData);
        
        // Nếu tên chủ hộ đã thay đổi, cập nhật nhân khẩu là chủ hộ
        if (editingItem.tenChuHo !== formData.tenChuHo) {
          try {
            const allNhanKhaus = await getAllNhanKhau();
            // Tìm nhân khẩu là chủ hộ của hộ khẩu này
            const chuHoNhanKhau = allNhanKhaus.find(
              (nk) => nk.hoKhauId === editingItem.id && nk.quanHeChuHo === "Chủ hộ"
            );
            
            if (chuHoNhanKhau) {
              // Cập nhật tên nhân khẩu
              await updateNhanKhau(chuHoNhanKhau.id, {
                ...chuHoNhanKhau,
                hoTen: formData.tenChuHo,
              });
            }
          } catch (err) {
            console.error("Không thể cập nhật tên nhân khẩu:", err);
          }
        }
        
        alert("Cập nhật hộ khẩu thành công!");
      } else {
        // Validate dữ liệu nhân khẩu chủ hộ
        const errors = {};
        if (chuHoData.cmndCccd && !/^\d{12}$/.test(chuHoData.cmndCccd)) {
          errors.cmndCccd = "Căn cước công dân phải gồm 12 số";
        }
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
          setIsSubmitting(false);
          return;
        }

        // Tạo hộ khẩu
        const createdHoKhau = await createHoKhau(formData);

        // Sau khi tạo hộ khẩu, tự động thêm nhân khẩu chủ hộ
        try {
          const hoKhauId = Number(createdHoKhau?.id ?? createdHoKhau?.hoKhauId);
          if (!hoKhauId) {
            throw new Error("Không xác định được ID hộ khẩu vừa tạo");
          }

          await createNhanKhau({
            ...chuHoData,
            hoTen: formData.tenChuHo,
            hoKhauId,
            quanHeChuHo: "Chủ hộ",
            ngaySinh: chuHoData.ngaySinh || null,
            ngayCap: chuHoData.ngayCap || null,
          });
          alert("Tạo hộ khẩu và chủ hộ thành công!");
        } catch (err) {
          // Rollback hộ khẩu nếu thêm nhân khẩu thất bại
          try {
            const hoKhauId = Number(createdHoKhau?.id ?? createdHoKhau?.hoKhauId);
            if (hoKhauId) {
              await deleteHoKhau(hoKhauId);
            }
          } catch (rollbackErr) {
            console.error("Rollback hộ khẩu thất bại:", rollbackErr);
          }

          alert(
            err.response?.data?.message ||
              "Không thể thêm nhân khẩu chủ hộ. Hộ khẩu chưa được lưu. Vui lòng thử lại."
          );
          throw err;
        }
      }
      handleCloseModal();
      loadHoKhaus();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
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
                    {
                      const value = e.target.value;
                      setFormData({ ...formData, tenChuHo: value });
                      if (!editingItem) {
                        setChuHoData((prev) => ({ ...prev, hoTen: value }));
                      }
                    }
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

              {!editingItem && (
                <>
                  <div className="modal-section-title">Thông tin chủ hộ</div>
                  <div className="form-group">
                    <label>Họ tên chủ hộ</label>
                    <input type="text" value={formData.tenChuHo} disabled />
                  </div>
                  <div className="form-group">
                    <label>
                      Ngày sinh <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={chuHoData.ngaySinh}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, ngaySinh: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      value={chuHoData.gioiTinh}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, gioiTinh: e.target.value })
                      }
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Dân tộc <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={chuHoData.danToc}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, danToc: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Quốc tịch <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={chuHoData.quocTich}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, quocTich: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nghề nghiệp</label>
                    <input
                      type="text"
                      value={chuHoData.ngheNghiep}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, ngheNghiep: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>CMND/CCCD</label>
                    <input
                      type="text"
                      value={chuHoData.cmndCccd}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, cmndCccd: e.target.value })
                      }
                    />
                    {validationErrors.cmndCccd && (
                      <span className="error-message">{validationErrors.cmndCccd}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Ngày cấp</label>
                    <input
                      type="date"
                      value={chuHoData.ngayCap}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, ngayCap: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Nơi cấp</label>
                    <input
                      type="text"
                      value={chuHoData.noiCap}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, noiCap: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Quan hệ với chủ hộ</label>
                    <input type="text" value="Chủ hộ" disabled />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      value={chuHoData.ghiChu}
                      onChange={(e) =>
                        setChuHoData({ ...chuHoData, ghiChu: e.target.value })
                      }
                      rows="3"
                    />
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
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
