import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import { LOAI_THU_PHI } from '../../../api/feePeriodApi';

const DATE_REG_EXP = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_VALUES = {
  tenDot: '',
  loai: LOAI_THU_PHI[0],
  ngayBatDau: '',
  ngayKetThuc: '',
  dinhMuc: ''
};

const schema = yup.object().shape({
  tenDot: yup.string().required('Vui lòng nhập tên đợt thu'),
  loai: yup.string()
    .required('Vui lòng chọn loại phí')
    .oneOf(LOAI_THU_PHI, 'Loại phí không hợp lệ'),
  ngayBatDau: yup.string()
    .required('Vui lòng nhập ngày bắt đầu')
    .matches(DATE_REG_EXP, 'Định dạng ngày không hợp lệ (YYYY-MM-DD)'),
  ngayKetThuc: yup.string()
    .required('Vui lòng nhập ngày kết thúc')
    .matches(DATE_REG_EXP, 'Định dạng ngày không hợp lệ (YYYY-MM-DD)')
    .test('end-after-start', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', function check(value) {
      const { ngayBatDau } = this.parent;
      if (!value || !ngayBatDau) return true;
      return new Date(value) >= new Date(ngayBatDau);
    }),
  dinhMuc: yup.number()
    .transform((value, originalValue) => (originalValue === '' || originalValue === null ? undefined : value))
    .when('loai', {
      is: 'BAT_BUOC',
      then: (current) => current
        .typeError('Định mức phải là số')
        .positive('Định mức phải lớn hơn 0')
        .required('Vui lòng nhập định mức phí'),
      otherwise: (current) => current
        .typeError('Định mức phải là số')
        .min(0, 'Định mức không được âm')
    })
});

const feeTypeOptions = LOAI_THU_PHI.map((type) => ({
  value: type,
  label: type === 'BAT_BUOC' ? 'Bắt buộc' : 'Tự nguyện'
}));

const toDateInput = (value) => {
  if (!value) return '';
  if (DATE_REG_EXP.test(value)) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString().split('T')[0];
};

export const FeePeriodForm = ({ initialValues, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES
  });

  const loaiValue = useWatch({ control, name: 'loai' }) || LOAI_THU_PHI[0];

  // Update form when initialValues changes (edit mode)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset({
        tenDot: initialValues.tenDot || '',
        loai: initialValues.loai || LOAI_THU_PHI[0],
        ngayBatDau: toDateInput(initialValues.ngayBatDau),
        ngayKetThuc: toDateInput(initialValues.ngayKetThuc),
        dinhMuc: initialValues.dinhMuc ?? ''
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialValues, reset]);

  const onSubmitHandler = (data) => {
    // Ensure data matches backend DTO exactly
    const normalizedLoai = (data.loai || '').toString().trim().toUpperCase();
    const isVoluntary = normalizedLoai === 'TU_NGUYEN';
    const formattedData = {
      tenDot: data.tenDot.trim(),
      loai: normalizedLoai,
      ngayBatDau: toDateInput(data.ngayBatDau),
      ngayKetThuc: toDateInput(data.ngayKetThuc),
      dinhMuc: isVoluntary ? 0 : Number(data.dinhMuc)
    };

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
        placeholder={loaiValue === 'TU_NGUYEN' ? 'Không áp dụng cho phí tự nguyện' : 'Nhập mức phí (bắt buộc)'}
        disabled={loaiValue === 'TU_NGUYEN'}
      />

      {loaiValue === 'TU_NGUYEN' && (
        <p className="text-sm text-gray-500">
          Đợt thu tự nguyện không yêu cầu định mức. Hệ thống sẽ tự đánh dấu các hộ khẩu là <strong>KHÔNG ÁP DỤNG</strong>.
        </p>
      )}

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