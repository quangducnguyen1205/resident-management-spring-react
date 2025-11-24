import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../auth/contexts/AuthContext';
import authApi from '../../../api/authApi';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';

const schema = yup.object().shape({
  tenDangNhap: yup.string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự'),
  matKhau: yup.string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  hoTen: yup.string().required('Vui lòng nhập họ tên'),
  email: yup.string().email('Email không hợp lệ'),
  vaiTro: yup.string()
    .required('Vui lòng chọn vai trò')
    .oneOf(['TOTRUONG', 'KETOAN'], 'Vai trò không hợp lệ')
});

const roleOptions = [
  { value: 'TOTRUONG', label: 'Tổ trưởng' },
  { value: 'KETOAN', label: 'Kế toán' }
];

const CreateAccount = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not ADMIN
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vaiTro: 'TOTRUONG'
    }
  });

  const onSubmit = async (data) => {
    setSubmitError(null);
    setLoading(true);

    try {
      await authApi.register(data);
      alert('Tạo tài khoản thành công!');
      navigate('/tai-khoan');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi tạo tài khoản';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Tạo tài khoản mới
        </h1>
        <button
          onClick={() => navigate('/tai-khoan')}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        {submitError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Lỗi:</strong> {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Tên đăng nhập"
            register={register}
            name="tenDangNhap"
            error={errors.tenDangNhap}
            placeholder="Nhập tên đăng nhập (4-50 ký tự)"
            required
          />

          <FormInput
            label="Mật khẩu"
            type="password"
            register={register}
            name="matKhau"
            error={errors.matKhau}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            required
          />

          <FormInput
            label="Họ tên"
            register={register}
            name="hoTen"
            error={errors.hoTen}
            placeholder="Nhập họ và tên đầy đủ"
            required
          />

          <FormInput
            label="Email"
            type="email"
            register={register}
            name="email"
            error={errors.email}
            placeholder="Nhập địa chỉ email (không bắt buộc)"
          />

          <FormSelect
            label="Vai trò"
            register={register}
            name="vaiTro"
            options={roleOptions}
            error={errors.vaiTro}
            required
          />

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/tai-khoan')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
