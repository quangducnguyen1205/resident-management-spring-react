import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import { BIEN_DONG_TYPES } from '../../../api/populationApi';

const CUSTOM_TYPE_LABELS = {
  CHUYEN_DEN: 'Chuyển đến',
  CHUYEN_DI: 'Chuyển đi',
  TACH_HO: 'Tách hộ',
  NHAP_HO: 'Nhập hộ',
  SINH: 'Khai sinh',
  KHAI_TU: 'Khai tử',
  THAY_DOI_THONG_TIN: 'Thay đổi thông tin',
  TAM_TRU: 'Đăng ký tạm trú',
  HUY_TAM_TRU: 'Huỷ tạm trú',
  TAM_VANG: 'Đăng ký tạm vắng',
  HUY_TAM_VANG: 'Huỷ tạm vắng'
};

const BIEN_DONG_OPTIONS = BIEN_DONG_TYPES.map((type) => ({
  value: type,
  label: CUSTOM_TYPE_LABELS[type] || type.replace(/_/g, ' ')
}));

const toDateTimeInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const DEFAULT_VALUES = {
  loai: '',
  noiDung: '',
  thoiGian: '',
  hoKhauId: '',
  nhanKhauId: ''
};

const schema = yup.object().shape({
  loai: yup.string()
    .oneOf(BIEN_DONG_TYPES, 'Loại biến động không hợp lệ')
    .required('Vui lòng chọn loại biến động'),
  noiDung: yup.string()
    .required('Vui lòng nhập nội dung')
    .max(1000, 'Nội dung không được vượt quá 1000 ký tự'),
  thoiGian: yup.string()
    .nullable()
    .test('valid-datetime', 'Thời gian không hợp lệ', (value) => {
      if (!value) return true;
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
    }),
  hoKhauId: yup.number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    }),
  nhanKhauId: yup.number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      return value;
    })
});

export const PopulationForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        loai: initialValues.loai || '',
        noiDung: initialValues.noiDung || '',
        thoiGian: toDateTimeInputValue(initialValues.thoiGian),
        hoKhauId: initialValues.hoKhauId ?? '',
        nhanKhauId: initialValues.nhanKhauId ?? ''
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Loại biến động"
        register={register}
        name="loai"
        options={BIEN_DONG_OPTIONS}
        error={errors.loai}
        required
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
        min="1"
      />

      <FormInput
        label="ID Nhân khẩu (tùy chọn)"
        type="number"
        register={register}
        name="nhanKhauId"
        error={errors.nhanKhauId}
        placeholder="Nhập ID nhân khẩu liên quan"
        min="1"
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