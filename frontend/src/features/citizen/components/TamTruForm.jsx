import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// Validation schema matching backend DangKyTamTruTamVangRequestDto
const schema = yup.object().shape({
  ngayBatDau: yup
    .date()
    .typeError('Ngày bắt đầu không hợp lệ')
    .required('Vui lòng chọn ngày bắt đầu')
    .min(startOfToday(), 'Ngày bắt đầu phải là ngày hiện tại hoặc trong tương lai'),
  ngayKetThuc: yup
    .date()
    .typeError('Ngày kết thúc không hợp lệ')
    .required('Vui lòng chọn ngày kết thúc')
    .test('future-date', 'Ngày kết thúc phải là ngày trong tương lai', (value) => !!value && value > new Date())
    .when('ngayBatDau', (ngayBatDau, schemaRef) => (
      ngayBatDau
        ? schemaRef.min(ngayBatDau, 'Ngày kết thúc phải sau ngày bắt đầu')
        : schemaRef
    )),
  lyDo: yup
    .string()
    .trim()
    .required('Vui lòng nhập lý do tạm trú')
});

const TamTruForm = ({ initialValues, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues || {
      ngayBatDau: '',
      ngayKetThuc: '',
      lyDo: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày bắt đầu <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('ngayBatDau')}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.ngayBatDau
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}
        />
        {errors.ngayBatDau && (
          <p className="mt-1 text-sm text-red-600">{errors.ngayBatDau.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ngày bắt đầu tạm trú (phải là ngày hiện tại hoặc tương lai)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày kết thúc <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('ngayKetThuc')}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.ngayKetThuc
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}
        />
        {errors.ngayKetThuc && (
          <p className="mt-1 text-sm text-red-600">{errors.ngayKetThuc.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ngày kết thúc tạm trú (phải là ngày trong tương lai)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do tạm trú <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('lyDo')}
          rows={4}
          placeholder="Nhập lý do tạm trú (ví dụ: Làm việc, học tập, thăm thân...)"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.lyDo
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          }`}
        />
        {errors.lyDo && (
          <p className="mt-1 text-sm text-red-600">{errors.lyDo.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Mô tả chi tiết lý do và nơi tạm trú (tối thiểu 10 ký tự)
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang xử lý...
            </>
          ) : (
            'Đăng ký tạm trú'
          )}
        </button>
      </div>
    </form>
  );
};

export default TamTruForm;
