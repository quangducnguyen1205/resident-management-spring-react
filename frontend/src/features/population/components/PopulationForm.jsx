import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';

const schema = yup.object().shape({
  loaiBienDong: yup.string().required('Vui lòng chọn loại biến động'),
  ngayBienDong: yup.date().required('Vui lòng nhập ngày biến động'),
  noiDung: yup.string().required('Vui lòng nhập nội dung'),
  ghiChu: yup.string()
});

const changeTypeOptions = [
  { value: 'CHUYEN_DEN', label: 'Chuyển đến' },
  { value: 'CHUYEN_DI', label: 'Chuyển đi' },
  { value: 'TAM_TRU', label: 'Tạm trú' },
  { value: 'TAM_VANG', label: 'Tạm vắng' },
  { value: 'MAT', label: 'Mất' }
];

export const PopulationForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Loại biến động"
        register={register}
        name="loaiBienDong"
        options={changeTypeOptions}
        error={errors.loaiBienDong}
      />

      <FormInput
        label="Ngày biến động"
        type="date"
        register={register}
        name="ngayBienDong"
        error={errors.ngayBienDong}
      />

      <FormInput
        label="Nội dung"
        register={register}
        name="noiDung"
        error={errors.noiDung}
      />

      <FormInput
        label="Ghi chú"
        register={register}
        name="ghiChu"
        error={errors.ghiChu}
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