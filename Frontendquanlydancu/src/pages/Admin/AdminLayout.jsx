import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  // Menu items với quyền truy cập
  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Tổng Quan",
      icon: "chart",
      roles: ["ADMIN", "TOTRUONG", "KETOAN"],
    },
    {
      path: "/admin/ho-khau",
      label: "Hộ Khẩu",
      icon: "home",
      roles: ["ADMIN", "TOTRUONG", "KETOAN"],
    },
    {
      path: "/admin/nhan-khau",
      label: "Nhân Khẩu",
      icon: "users",
      roles: ["ADMIN", "TOTRUONG", "KETOAN"],
    },
    {
      path: "/admin/bien-dong",
      label: "Biến Động",
      icon: "edit",
      roles: ["ADMIN", "TOTRUONG", "KETOAN"],
    },
    {
      path: "/admin/dot-thu-phi",
      label: "Đợt Thu Phí",
      icon: "calendar",
      roles: ["ADMIN", "KETOAN", "TOTRUONG"],
    },
    {
      path: "/admin/thu-phi-ho-khau",
      label: "Thu Phí Hộ Khẩu",
      icon: "credit",
      roles: ["ADMIN", "KETOAN", "TOTRUONG"],
    },
    {
      path: "/admin/tai-khoan",
      label: "Tài Khoản",
      icon: "user",
      roles: ["ADMIN"],
    },
  ];

  // Kiểm tra quyền truy cập menu
  const hasAccess = (itemRoles) => {
    return itemRoles.includes(role);
  };

  // Render SVG icon
  const renderIcon = (iconName) => {
    const iconMap = {
      chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
      home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
      users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
      edit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 4 19 18 17 20 3 6"></polyline><line x1="3" y1="20" x2="5" y2="22"></line><path d="M20 4l2 2"></path></svg>,
      calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
      credit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
      user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    };
    return iconMap[iconName] || iconName;
  };

  // Xử lý click menu
  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  // Đăng xuất
  const handleLogout = () => {
    // Xóa tất cả thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    // Force reload về login để tránh màn hình trắng
    window.location.href = "/login";
  };

  // Lấy tên vai trò hiển thị
  const getRoleName = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      TOTRUONG: "Tổ trưởng",
      KETOAN: "Kế toán",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.jpg" alt="Logo" className="sidebar-logo" />
          <h2 className="sidebar-title">SKYLINE MANAGER</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const canAccess = hasAccess(item.roles);

            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""} ${
                  !canAccess ? "disabled" : ""
                }`}
                onClick={() => handleMenuClick(item)}
                disabled={!canAccess}
                title={!canAccess ? "Không có quyền truy cập" : ""}
              >
                <span className="nav-icon">{renderIcon(item.icon)}</span>
                <span className="nav-label">{item.label}</span>
                {!canAccess && <span className="nav-lock">🔒</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{username}</div>
            <div className="user-role">{getRoleName(role)}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

