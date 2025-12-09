import { useState, useEffect } from "react";
import {
  getAllTaiKhoan,
  createTaiKhoan,
  deleteTaiKhoan,
} from "../../../api/taiKhoanApi";
import NoPermission from "../NoPermission";
import "./TaiKhoanPage.css";

function TaiKhoanPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "TOTRUONG",
    hoTen: "",
    email: "",
    soDienThoai: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const role = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username");

  // Chỉ ADMIN mới có quyền
  if (role !== "ADMIN") {
    return <NoPermission />;
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAllTaiKhoan();
      setAccounts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      username: "",
      password: "",
      role: "TOTRUONG",
      hoTen: "",
      email: "",
      soDienThoai: "",
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setValidationErrors({});
    setSubmitError("");
  };

  // Hàm validate dữ liệu tài khoản
  const validateForm = () => {
    const errors = {};
    
    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    
    // Validate số điện thoại
    if (formData.soDienThoai && !/^\d{10,11}$/.test(formData.soDienThoai)) {
      errors.soDienThoai = "Số điện thoại phải từ 10 đến 11 số";
    }
    
    return errors;
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
    
    try {
      await createTaiKhoan(
        formData.username,
        formData.password,
        formData.role,
        formData.hoTen,
        formData.email,
        formData.soDienThoai
      );
      alert("Tạo tài khoản thành công!");
      handleCloseModal();
      loadAccounts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra!";
      setSubmitError(errorMsg);
    }
  };

  const handleDelete = async (id, tenDangNhap) => {
    if (tenDangNhap === currentUsername) {
      alert("Bạn không thể xóa chính tài khoản của mình!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return;
    }
    try {
      await deleteTaiKhoan(id);
      alert("Xóa tài khoản thành công!");
      loadAccounts();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const getRoleName = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      TOTRUONG: "Tổ trưởng",
      KETOAN: "Kế toán",
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="tai-khoan-page">
      <div className="page-header">
        <h1 className="page-title">Quản Lý Tài Khoản</h1>
        <div className="header-actions">
          <button className="btn-add" onClick={handleOpenModal}>
            + Thêm tài khoản
          </button>
          <button className="btn-refresh" onClick={loadAccounts}>
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
              <th>Tên đăng nhập</th>
              <th>Vai trò</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  Chưa có tài khoản nào
                </td>
              </tr>
            ) : (
              accounts.map((acc, index) => (
                <tr key={acc.id}>
                  <td>{index + 1}</td>
                  <td>{acc.tenDangNhap || "-"}</td>
                  <td>
                    <span className={`role-badge role-${acc.vaiTro}`}>
                      {getRoleName(acc.vaiTro)}
                    </span>
                  </td>
                  <td>{acc.hoTen || "-"}</td>
                  <td>{acc.email || "-"}</td>
                  <td>
                    {acc.ngayTao
                      ? new Date(acc.ngayTao).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    {acc.tenDangNhap !== currentUsername && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(acc.id, acc.tenDangNhap)}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
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
              <h2>Thêm tài khoản mới</h2>
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
              <div className="form-group">
                <label>
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  minLength={3}
                />
              </div>
              <div className="form-group">
                <label>
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Vai trò <span className="required">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="TOTRUONG">Tổ trưởng</option>
                    <option value="KETOAN">Kế toán</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) =>
                      setFormData({ ...formData, hoTen: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="10-11 số"
                  value={formData.soDienThoai}
                  onChange={(e) =>
                    setFormData({ ...formData, soDienThoai: e.target.value })
                  }
                />
                {validationErrors.soDienThoai && (
                  <span className="error-message">{validationErrors.soDienThoai}</span>
                )}
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

export default TaiKhoanPage;
