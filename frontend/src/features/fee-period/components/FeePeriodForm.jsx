import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';

const schema = yup.object().shape({
  tenDotThu: yup.string().required('Vui lòng nhập tên đợt thu'),
  ngayBatDau: yup.date().required('Vui lòng nhập ngày bắt đầu'),
  ngayKetThuc: yup.date()
    .min(yup.ref('ngayBatDau'), 'Ngày kết thúc phải sau ngày bắt đầu')
    .required('Vui lòng nhập ngày kết thúc'),
  mucPhi: yup.number()
    .positive('Mức phí phải lớn hơn 0')
    .required('Vui lòng nhập mức phí')
});

export const FeePeriodForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Tên đợt thu"
        register={register}
        name="tenDotThu"
        error={errors.tenDotThu}
      />

      <FormInput
        label="Ngày bắt đầu"
        type="date"
        register={register}
        name="ngayBatDau"
        error={errors.ngayBatDau}
      />

      <FormInput
        label="Ngày kết thúc"
        type="date"
        register={register}
        name="ngayKetThuc"
        error={errors.ngayKetThuc}
      />

      <FormInput
        label="Mức phí"
        type="number"
        register={register}
        name="mucPhi"
        error={errors.mucPhi}
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