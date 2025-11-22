import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiHome, 
  HiUsers, 
  HiDocumentText,
  HiCash,
  HiChartBar 
} from 'react-icons/hi';

const menuItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: <HiHome /> },
  { to: '/household', label: 'Hộ khẩu', icon: <HiDocumentText /> },
  { to: '/citizen', label: 'Nhân khẩu', icon: <HiUsers /> },
  { 
    to: '/fee-collection', 
    label: 'Thu phí', 
    icon: <HiCash />,
    children: [
      { to: '/fee-period', label: 'Đợt thu phí' },
      { to: '/fee-collection', label: 'Quản lý thu phí' },
      { to: '/fee-collection/stats', label: 'Thống kê' }
    ]
  },
  { to: '/stats', label: 'Thống kê', icon: <HiChartBar /> }
];

const Sidebar = () => {
  return (
    <aside className="w-60 bg-white border-r h-screen fixed left-0 top-0 pt-6">
      <div className="px-6 mb-6">
        <h1 className="text-xl font-bold">QLDC System</h1>
      </div>
      
      <nav className="px-2">
        {menuItems.map((item) => (
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