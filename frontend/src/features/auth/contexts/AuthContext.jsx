// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

// Custom hook để sử dụng AuthContext dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin user (email, token,...)
  const [loading, setLoading] = useState(true); // Khi app khởi động, kiểm tra token có sẵn không

  // Hàm kiểm tra token có hết hạn không
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Decode JWT token (phần payload là base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Kiểm tra exp claim (thời gian hết hạn tính bằng giây)
      if (payload.exp) {
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
        return payload.exp < currentTime;
      }
      
      // Nếu không có exp claim, coi như token hợp lệ
      return false;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Nếu decode lỗi, coi như token không hợp lệ
    }
  };

  // Khi app mở lại, đọc token từ localStorage (nếu có)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // Kiểm tra token có hết hạn không
      if (parsedUser.token && !isTokenExpired(parsedUser.token)) {
        setUser(parsedUser);
      } else {
        // Token hết hạn → xóa localStorage
        localStorage.removeItem("user");
        console.log('Token expired - user logged out');
      }
    }
    setLoading(false);
  }, []);

  // Khi user thay đổi (đăng nhập/đăng xuất), cập nhật localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
