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
        {/* Trang login - redirect nếu đã đăng nhập */}
        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/admin" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Trang admin với layout chung */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect mặc định về trang dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* Các trang quản lý */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tai-khoan" element={<TaiKhoanPage />} />
          <Route path="ho-khau" element={<HoKhauPage />} />
          <Route path="nhan-khau" element={<NhanKhauPage />} />
          <Route path="bien-dong" element={<BienDongPage />} />
          <Route path="dot-thu-phi" element={<DotThuPhiPage />} />
          <Route path="thu-phi-ho-khau" element={<ThuPhiHoKhauPage />} />
        </Route>

        {/* Redirect root về login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

