import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../../api/authApi";

const SuccessModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Đăng ký thành công</h3>
        <p className="text-sm text-gray-600 mb-6">
          Tài khoản đã được tạo. Bạn có thể đăng nhập ngay bây giờ.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-teal-500 text-white py-2 rounded-xl font-semibold hover:bg-teal-600"
        >
          Đóng và chuyển đến đăng nhập
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
    hoTen: "",
    email: "",
    soDienThoai: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const username = formData.username.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const hoTen = formData.hoTen.trim();
    const email = formData.email.trim();
    const soDienThoai = formData.soDienThoai.trim();

    // Validation
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setError("Tên đăng nhập phải từ 3-50 ký tự");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username,
        password,
        role: formData.role
      };

      if (hoTen) {
        payload.hoTen = hoTen;
      }
      if (email) {
        payload.email = email;
      }
      if (soDienThoai) {
        payload.soDienThoai = soDienThoai;
      }

      await authApi.register(payload);
      setError("");
      setShowSuccessModal(true);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Nếu là object chứa validation errors
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          const errors = Object.values(errorData).join(", ");
          setError(errors);
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError("Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else {
        setError(err.message || "Lỗi kết nối máy chủ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen relative">
      <SuccessModal open={showSuccessModal} onClose={handleCloseModal} />
      {/* --- Bên trái: logo / hình minh họa --- */}
      <div className="flex-1 bg-white flex justify-center items-center border-r">
        <div className="flex space-x-3 items-end">
          <div className="w-0 h-0 border-l-[35px] border-r-[35px] border-b-[60px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
          <div className="w-[40px] h-[90px] bg-blue-500"></div>
          <div className="w-[40px] h-[100px] bg-red-500 rounded-tr-md"></div>
        </div>
      </div>

      {/* --- Bên phải: form đăng ký --- */}
      <div className="flex-1 flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Đăng ký tài khoản
          </h2>
          <div className="w-16 h-[3px] bg-teal-400 mx-auto mb-8"></div>

          <form onSubmit={handleRegister} className="flex flex-col space-y-4">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập *"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <input
                type="text"
                name="hoTen"
                placeholder="Họ và tên"
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <input
                type="tel"
                name="soDienThoai"
                placeholder="Số điện thoại"
                value={formData.soDienThoai}
                onChange={handleChange}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700 bg-white"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="TOTRUONG">TỔ TRƯỞNG</option>
                <option value="USER">NGƯỜI DÙNG</option>
              </select>
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu *"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu *"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 text-white font-semibold py-3 rounded-xl hover:bg-teal-500 transition duration-200 disabled:bg-gray-400"
            >
              {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <Link
              to="/login"
              className="text-teal-500 hover:text-teal-600 font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
