import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/contexts/AuthContext';
import Loader from './Loader';

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Khi đang kiểm tra trạng thái đăng nhập (đọc từ localStorage)
  if (loading) {
    return <Loader />;
  }

  // Check xem user có tồn tại và có token không
  const isAuthenticated = user && user.token;

  // Nếu không authenticated => redirect về login
  // Nếu authenticated => cho render nested routes (Outlet)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

/* ========== CODE CŨ (ĐÃ COMMENT) ==========
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
*/