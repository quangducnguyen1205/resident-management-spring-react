import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-60 mt-16 p-6 min-h-[calc(100vh-64px)] bg-gray-50">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;