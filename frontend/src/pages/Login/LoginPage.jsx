// Frontendquanlydancu/src/pages/Login/LoginPage.jsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Login.css";

function LoginPage() {
  const navigate = useNavigate();

  // Nếu đã đăng nhập rồi thì không cho ở lại /login nữa
  const existingToken = localStorage.getItem("token");
  const existingRole = localStorage.getItem("role");
  if (existingToken && existingRole) {
    return <Navigate to="/admin" replace />;
  }

  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState("ADMIN"); // vai trò user chọn trên UI
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ username và password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            errData.error ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại."
        );
      }

      const data = await res.json(); // { token, username, role } từ backend

      // Kiểm tra role backend trả về có khớp với role user chọn hay không
      if (data.role !== role) {
        setError("Vui lòng chọn đúng vai trò.");
        return; // KHÔNG lưu token, coi như đăng nhập không hợp lệ
      }

      // Nếu đúng vai trò thì mới lưu
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      console.log("Đăng nhập thành công:", data);
      // Redirect về trang admin bằng React Router (không reload toàn trang)
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-card">
        {/* LEFT */}
        <div className="login-left">
          <img src="/logo.jpg" alt="Logo" className="login-logo" />
          <h2 className="login-title-left">SKYLINE MANAGER</h2>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <h1 className="login-title">LOGIN</h1>

          {/* RADIO CHỌN VAI TRÒ */}
          <label className="login-label">Chọn vai trò</label>
          <div className="role-group">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={role === "ADMIN"}
                onChange={() => setRole("ADMIN")}
              />
              <span className="role-text">Admin</span>
            </label>

            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="TOTRUONG"
                checked={role === "TOTRUONG"}
                onChange={() => setRole("TOTRUONG")}
              />
              <span className="role-text">Tổ trưởng</span>
            </label>

            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="KETOAN"
                checked={role === "KETOAN"}
                onChange={() => setRole("KETOAN")}
              />
              <span className="role-text">Kế toán</span>
            </label>
          </div>

          {/* USERNAME */}
          <label className="login-label">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* PASSWORD */}
          <label className="login-label">Password</label>
          <div className="input-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
              {showPass ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </span>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
