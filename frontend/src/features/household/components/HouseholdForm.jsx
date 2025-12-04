import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const householdSchema = yup.object().shape({
  soHoKhau: yup.string()
    .trim()
    .when('$isEditing', {
      is: true,
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.required('Vui lòng nhập số hộ khẩu')
    }),
  tenChuHo: yup.string().trim().required('Vui lòng nhập tên chủ hộ'),
  diaChi: yup.string().trim().required('Vui lòng nhập địa chỉ')
});

export const HouseholdForm = ({
  initialValues,
  onSubmit,
  formId,
  showActions = true,
  onCancel,
  submitLabel = 'Lưu thay đổi'
}) => {
  const DEFAULT_VALUES = {
    soHoKhau: '',
    tenChuHo: '',
    diaChi: ''
  };
  const isEditing = Boolean(initialValues?.id);

  const resolver = useMemo(
    () => yupResolver(householdSchema, undefined, { context: { isEditing } }),
    [isEditing]
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver,
    defaultValues: DEFAULT_VALUES
  });

  useEffect(() => {
    reset({
      soHoKhau: initialValues?.soHoKhau || '',
      tenChuHo: initialValues?.tenChuHo || '',
      diaChi: initialValues?.diaChi || ''
    });
  }, [initialValues?.id, initialValues?.soHoKhau, initialValues?.tenChuHo, initialValues?.diaChi, reset]);

  const handleFormSubmit = (values) => {
    console.log('HOUSEHOLD_FORM_VALUES', values);
    const payload = {
      tenChuHo: values.tenChuHo?.trim() || '',
      diaChi: values.diaChi?.trim() || ''
    };

    if (!isEditing) {
      payload.soHoKhau = values.soHoKhau?.trim() || '';
    }

    onSubmit(payload);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Số hộ khẩu {!isEditing && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          {...register('soHoKhau')}
          placeholder="VD: HK001, HK002..."
          disabled={isEditing}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isEditing ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300'}`}
        />
        {errors.soHoKhau && (
          <p className="mt-1 text-sm text-red-600">{errors.soHoKhau.message}</p>
        )}
        {isEditing && !errors.soHoKhau && (
          <p className="mt-1 text-xs text-gray-500">Số hộ khẩu được cố định và không thể thay đổi.</p>
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