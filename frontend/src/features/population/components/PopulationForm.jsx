import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';

const schema = yup.object().shape({
  loai: yup.string()
    .required('Vui lòng nhập loại biến động')
    .max(100, 'Loại biến động không được vượt quá 100 ký tự'),
  noiDung: yup.string()
    .required('Vui lòng nhập nội dung')
    .max(1000, 'Nội dung không được vượt quá 1000 ký tự'),
  thoiGian: yup.string()
    .nullable()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Thời gian không hợp lệ'),
  hoKhauId: yup.number().nullable(),
  nhanKhauId: yup.number().nullable()
});

export const PopulationForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Loại biến động"
        register={register}
        name="loai"
        error={errors.loai}
        placeholder="Ví dụ: Tạm trú, Tạm vắng, Khai sinh, Khai tử..."
      />

      <FormInput
        label="Thời gian biến động (tùy chọn)"
        type="datetime-local"
        register={register}
        name="thoiGian"
        error={errors.thoiGian}
      />

      <FormInput
        label="Nội dung"
        register={register}
        name="noiDung"
        error={errors.noiDung}
        placeholder="Mô tả chi tiết nội dung biến động"
      />

      <FormInput
        label="ID Hộ khẩu (tùy chọn)"
        type="number"
        register={register}
        name="hoKhauId"
        error={errors.hoKhauId}
        placeholder="Nhập ID hộ khẩu liên quan"
      />

      <FormInput
        label="ID Nhân khẩu (tùy chọn)"
        type="number"
        register={register}
        name="nhanKhauId"
        error={errors.nhanKhauId}
        placeholder="Nhập ID nhân khẩu liên quan"
      />

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