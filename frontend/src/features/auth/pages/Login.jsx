import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      if (response?.token) {
        // Lưu user với role từ backend
        setUser({ username, token: response.token, role: response.role });
        navigate("/dashboard");
      } else {
        // Nếu authService trả về null/undefined hoặc object không có token
        setError("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Lỗi kết nối máy chủ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* --- Bên trái: logo / hình minh họa --- */}
      <div className="flex-1 bg-white flex justify-center items-center border-r">
        <div className="flex space-x-3 items-end">
          <div className="w-0 h-0 border-l-[35px] border-r-[35px] border-b-[60px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
          <div className="w-[40px] h-[90px] bg-blue-500"></div>
          <div className="w-[40px] h-[100px] bg-red-500 rounded-tr-md"></div>
        </div>
      </div>

      {/* --- Bên phải: form đăng nhập --- */}
      <div className="flex-1 flex justify-center items-center bg-white">
        <div className="w-full max-w-sm px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Login
          </h2>
          <div className="w-16 h-[3px] bg-teal-400 mx-auto mb-8"></div>

          <form onSubmit={handleLogin} className="flex flex-col space-y-6">
            <div>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-400 focus:outline-none focus:border-teal-400 py-2 text-gray-700"
              />
              <div className="text-right text-sm text-gray-500 mt-1 hover:text-teal-500 cursor-pointer">
                Forgot Password ?
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 text-white font-semibold py-3 rounded-xl hover:bg-teal-500 transition duration-200"
            >
              {loading ? "Đang đăng nhập..." : "SIGN IN"}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Chưa có tài khoản? </span>
            <Link
              to="/register"
              className="text-teal-500 hover:text-teal-600 font-semibold"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
