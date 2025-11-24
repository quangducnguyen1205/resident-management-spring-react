import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import accountApi from '../../../api/accountApi';
import authApi from '../../../api/authApi';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';
import useApiHandler from '../../../hooks/useApiHandler';

const AccountList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: accounts,
    loading,
    error,
    handleApi
  } = useApiHandler([]);

  // Redirect if not ADMIN
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAccounts = async () => {
    await handleApi(
      () => accountApi.getAll(),
      'Không thể tải danh sách tài khoản'
    );
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (account) => {
    if (account.vaiTro === 'ADMIN') {
      alert('Không thể xóa tài khoản quản trị viên!');
      return;
    }

    if (account.id === user?.id) {
      alert('Không thể xóa chính tài khoản của bạn!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${account.tenDangNhap}" - ${account.hoTen}?`)) {
      return;
    }

    try {
      await handleApi(
        () => accountApi.delete(account.id),
        'Không thể xóa tài khoản'
      );
      alert('Xóa tài khoản thành công!');
      await fetchAccounts();
    } catch (err) {
      // Error handled by handleApi
    }
  };

  const roleLabels = {
    'ADMIN': 'Quản trị viên',
    'TOTRUONG': 'Tổ trưởng',
    'KETOAN': 'Kế toán'
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'TOTRUONG': return 'bg-blue-100 text-blue-800';
      case 'KETOAN': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAccounts} />;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600 mt-1">Tổng số: {accounts.length} tài khoản</p>
        </div>
        <button
          onClick={() => navigate('/tai-khoan/new')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo tài khoản mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.tenDangNhap}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.hoTen}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(account.vaiTro)}`}>
                    {roleLabels[account.vaiTro] || account.vaiTro}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.trangThai === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.trangThai === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {account.vaiTro !== 'ADMIN' && account.id !== user?.id && (
                    <button
                      onClick={() => handleDelete(account)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  )}
                  {(account.vaiTro === 'ADMIN' || account.id === user?.id) && (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountList;
