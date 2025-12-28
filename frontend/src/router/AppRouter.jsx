// Frontendquanlydancu/src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import AdminLayout from "../pages/Admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/Admin/Dashboard/DashboardPage";
import TaiKhoanPage from "../pages/Admin/TaiKhoan/TaiKhoanPage";
import HoKhauPage from "../pages/Admin/HoKhau/HoKhauPage";
import NhanKhauPage from "../pages/Admin/NhanKhau/NhanKhauPage";
import BienDongPage from "../pages/Admin/BienDong/BienDongPage";
import DotThuPhiPage from "../pages/Admin/DotThuPhi/DotThuPhiPage";
import ThuPhiHoKhauPage from "../pages/Admin/ThuPhiHoKhau/ThuPhiHoKhauPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang login – logic redirect nếu đã đăng nhập sẽ xử lý bên trong LoginPage */}
        <Route path="/login" element={<LoginPage />} />

        {/* Khu vực /admin có bảo vệ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Khi vào đúng /admin thì đẩy sang /admin/dashboard  */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tai-khoan" element={<TaiKhoanPage />} />
          <Route path="ho-khau" element={<HoKhauPage />} />
          <Route path="nhan-khau" element={<NhanKhauPage />} />
          <Route path="bien-dong" element={<BienDongPage />} />
          <Route path="dot-thu-phi" element={<DotThuPhiPage />} />
          <Route path="thu-phi-ho-khau" element={<ThuPhiHoKhauPage />} />
        </Route>

        {/* Root → /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 → /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;