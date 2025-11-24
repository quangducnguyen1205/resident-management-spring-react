import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';

const schema = yup.object().shape({
  tenDot: yup.string().required('Vui lòng nhập tên đợt thu'),
  loai: yup.string()
    .required('Vui lòng chọn loại phí')
    .oneOf(['BAT_BUOC', 'TU_NGUYEN'], 'Loại phí không hợp lệ'),
  ngayBatDau: yup.date().required('Vui lòng nhập ngày bắt đầu'),
  ngayKetThuc: yup.date()
    .min(yup.ref('ngayBatDau'), 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu')
    .required('Vui lòng nhập ngày kết thúc'),
  dinhMuc: yup.number()
    .when('loai', {
      is: 'BAT_BUOC',
      then: (schema) => schema.positive('Mức phí bắt buộc phải lớn hơn 0').required('Vui lòng nhập định mức phí'),
      otherwise: (schema) => schema.min(0, 'Định mức phí không được âm')
    })
});

const feeTypeOptions = [
  { value: 'BAT_BUOC', label: 'Bắt buộc' },
  { value: 'TU_NGUYEN', label: 'Tự nguyện' }
];

export const FeePeriodForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  // Update form when initialValues changes (edit mode)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const formattedValues = {
        ...initialValues,
        ngayBatDau: initialValues.ngayBatDau ? initialValues.ngayBatDau.split('T')[0] : '',
        ngayKetThuc: initialValues.ngayKetThuc ? initialValues.ngayKetThuc.split('T')[0] : ''
      };
      reset(formattedValues);
    }
  }, [initialValues, reset]);

  const onSubmitHandler = (data) => {
    // Ensure data matches backend DTO exactly
    const formattedData = {
      tenDot: data.tenDot.trim(),
      loai: data.loai, // BAT_BUOC or TU_NGUYEN
      ngayBatDau: typeof data.ngayBatDau === 'string' 
        ? data.ngayBatDau 
        : data.ngayBatDau.toISOString().split('T')[0],
      ngayKetThuc: typeof data.ngayKetThuc === 'string'
        ? data.ngayKetThuc
        : data.ngayKetThuc.toISOString().split('T')[0],
      dinhMuc: data.dinhMuc ? parseFloat(data.dinhMuc) : (data.loai === 'TU_NGUYEN' ? 0 : 0)
    };
    
    console.log('Submitting fee period data:', formattedData);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <FormInput
        label="Tên đợt thu"
        register={register}
        name="tenDot"
        error={errors.tenDot}
        placeholder="Ví dụ: Thu phí quản lý tháng 1/2025"
      />

      <FormSelect
        label="Loại phí"
        register={register}
        name="loai"
        options={feeTypeOptions}
        error={errors.loai}
        required
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
        label="Định mức phí (VND)"
        type="number"
        register={register}
        name="dinhMuc"
        error={errors.dinhMuc}
        placeholder="Nhập mức phí (bắt buộc cho phí BẮT BUỘC)"
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