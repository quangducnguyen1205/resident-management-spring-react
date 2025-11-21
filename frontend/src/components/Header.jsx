import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { HiOutlineLogout } from 'react-icons/hi';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 ml-60">
      <div className="text-sm text-gray-600">Hệ thống thu phí</div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
          title="Đăng xuất"
        >
          <HiOutlineLogout />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Header;