import { Navigate } from "react-router-dom";

/**
 * Component bảo vệ route - chỉ cho phép truy cập khi đã đăng nhập
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;


