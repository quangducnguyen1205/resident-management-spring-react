import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiHome, 
  HiUsers, 
  HiDocumentText,
  HiCash,
  HiChartBar,
  HiTrendingUp,
  HiUserGroup 
} from 'react-icons/hi';
import { AuthContext } from '../features/auth/contexts/AuthContext';

const menuItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: <HiHome />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/household', label: 'Hộ khẩu', icon: <HiDocumentText />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/citizen', label: 'Nhân khẩu', icon: <HiUsers />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/population', label: 'Biến động', icon: <HiTrendingUp />, roles: ['ADMIN', 'TOTRUONG'] },
  { to: '/fee-period', label: 'Đợt thu phí', icon: <HiCash />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/fee-collection', label: 'Thu phí hộ', icon: <HiCash />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/statistics', label: 'Thống kê', icon: <HiChartBar />, roles: ['ADMIN', 'TOTRUONG', 'KETOAN'] },
  { to: '/tai-khoan', label: 'Tài khoản', icon: <HiUserGroup />, roles: ['ADMIN'] }
];

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || '';

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-60 bg-white border-r h-screen fixed left-0 top-0 pt-6">
      <div className="px-6 mb-6">
        <h1 className="text-xl font-bold">QLDC System</h1>
        {user && (
          <p className="text-xs text-gray-500 mt-1">
            {user.hoTen || user.tenDangNhap} ({user.role})
          </p>
        )}
      </div>
      
      <nav className="px-2">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition-colors ${
                isActive 
                  ? 'bg-teal-100 text-teal-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;