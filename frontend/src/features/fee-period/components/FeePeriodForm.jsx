import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import { LOAI_THU_PHI } from '../../../api/feePeriodApi';

const DATE_REG_EXP = /^\d{4}-\d{2}-\d{2}$/;

const emptyFormValues = {
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
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null;
      }
      const numeric = Number(originalValue);
      return Number.isNaN(numeric) ? NaN : numeric;
    })
    .when('loai', (loai, current) => {
      const baseSchema = current.typeError('Định mức phải là số');
      if (loai === 'BAT_BUOC') {
        return baseSchema
          .positive('Định mức phải lớn hơn 0')
          .required('Vui lòng nhập định mức phí');
      }
      return baseSchema
        .notRequired()
        .min(0, 'Định mức không được âm');
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

const mapInitialValues = (initialValues) => ({
  tenDot: initialValues?.tenDot || '',
  loai: (() => {
    if (!initialValues?.loai) return LOAI_THU_PHI[0];
    const normalized = initialValues.loai.toString().trim().toUpperCase();
    return LOAI_THU_PHI.includes(normalized) ? normalized : LOAI_THU_PHI[0];
  })(),
  ngayBatDau: toDateInput(initialValues?.ngayBatDau),
  ngayKetThuc: toDateInput(initialValues?.ngayKetThuc),
  dinhMuc: initialValues?.dinhMuc !== undefined && initialValues?.dinhMuc !== null
    ? String(initialValues.dinhMuc)
    : ''
});

export const FeePeriodForm = ({
  initialValues,
  onSubmit,
  formId,
  showActions = true,
  onCancel,
  submitLabel = 'Lưu thay đổi'
}) => {
  const { register, handleSubmit, reset, formState: { errors }, control, clearErrors, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: emptyFormValues
  });

  const loaiValue = useWatch({ control, name: 'loai' }) || LOAI_THU_PHI[0];

  // Update form when initialValues changes (edit mode)
  useEffect(() => {
    const hasInitialValues = initialValues && Object.keys(initialValues).length > 0;
    if (!hasInitialValues) {
      reset({ ...emptyFormValues });
      return;
    }
    reset(mapInitialValues(initialValues));
  }, [initialValues, reset]);

  useEffect(() => {
    if (loaiValue === 'TU_NGUYEN') {
      setValue('dinhMuc', '', { shouldDirty: true, shouldValidate: true });
      clearErrors('dinhMuc');
    }
  }, [loaiValue, setValue, clearErrors]);

  const onSubmitHandler = (data) => {
    console.log('FEE_PERIOD_FORM_VALUES', data);
    // Ensure data matches backend DTO exactly
    const normalizedLoai = (data.loai || '').toString().trim().toUpperCase();
    const isVoluntary = normalizedLoai === 'TU_NGUYEN';
    const formattedData = {
      tenDot: data.tenDot.trim(),
      loai: normalizedLoai,
      ngayBatDau: toDateInput(data.ngayBatDau),
      ngayKetThuc: toDateInput(data.ngayKetThuc)
    };

    if (!isVoluntary && data.dinhMuc !== undefined) {
      formattedData.dinhMuc = Number(data.dinhMuc);
    }

    onSubmit(formattedData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
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

      {showActions && (
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};