import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  soHoKhau: yup.string().required('Vui lòng nhập số hộ khẩu').min(3, 'Số hộ khẩu phải có ít nhất 3 ký tự'),
  tenChuHo: yup.string().required('Vui lòng nhập tên chủ hộ').min(3, 'Tên chủ hộ phải có ít nhất 3 ký tự'),
  diaChi: yup.string().required('Vui lòng nhập địa chỉ'),
  noiDungThayDoiChuHo: yup.string()
});

export const HouseholdForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Số hộ khẩu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('soHoKhau')}
          placeholder="VD: HK001, HK002..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.soHoKhau && (
          <p className="mt-1 text-sm text-red-600">{errors.soHoKhau.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tên chủ hộ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('tenChuHo')}
          placeholder="Nhập họ tên chủ hộ"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.tenChuHo && (
          <p className="mt-1 text-sm text-red-600">{errors.tenChuHo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Địa chỉ <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('diaChi')}
          rows={3}
          placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường, quận)"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.diaChi && (
          <p className="mt-1 text-sm text-red-600">{errors.diaChi.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nội dung thay đổi chủ hộ
        </label>
        <textarea
          {...register('noiDungThayDoiChuHo')}
          rows={2}
          placeholder="Ghi chú về lý do thay đổi chủ hộ (nếu có)"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
};