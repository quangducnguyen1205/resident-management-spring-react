import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import FormAutocomplete from '../../../components/Form/FormAutocomplete';
import householdApi from '../../../api/householdApi';

const DATE_REG_EXP = /^\d{4}-\d{2}-\d{2}$/;

// Helper function to calculate age from date of birth
const calculateAge = (birthDate) => {
  if (!birthDate || !DATE_REG_EXP.test(birthDate)) return 0;
  const today = new Date();
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const toDateInputValue = (value) => {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    return trimmed.split('T')[0];
  }
  return '';
};

const formatDateForApi = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return null;
};

const trimString = (value) => (typeof value === 'string' ? value.trim() : value);
const trimToNull = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const normalizeId = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const MIN_CCCD_AGE = 14;

const mapDtoToFormValues = (values = {}) => ({
  hoKhauId: values.hoKhauId ?? '',
  hoTen: values.hoTen ?? '',
  ngaySinh: toDateInputValue(values.ngaySinh),
  gioiTinh: values.gioiTinh ?? '',
  danToc: values.danToc ?? '',
  quocTich: values.quocTich ?? '',
  ngheNghiep: values.ngheNghiep ?? '',
  cmndCccd: values.cmndCccd ?? '',
  ngayCap: toDateInputValue(values.ngayCap),
  noiCap: values.noiCap ?? '',
  quanHeChuHo: values.quanHeChuHo ?? '',
  ghiChu: values.ghiChu ?? ''
});

const DEFAULT_FORM_VALUES = mapDtoToFormValues();

const optionalStringSchema = yup.string()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === undefined || originalValue === null) {
      return null;
    }
    return typeof originalValue === 'string' ? originalValue.trim() : originalValue;
  })
  .nullable();

const requiredTrimmedString = (message) => yup.string().trim().required(message);

const dateStringSchema = yup.string()
  .required('Vui lòng nhập ngày theo định dạng YYYY-MM-DD')
  .matches(DATE_REG_EXP, 'Ngày không hợp lệ (YYYY-MM-DD)')
  .test('not-future', 'Ngày không được là ngày trong tương lai', (value) => {
    if (!value || !DATE_REG_EXP.test(value)) return false;
    return new Date(value) <= new Date();
  });

const schema = yup.object().shape({
  hoKhauId: yup.number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === undefined || originalValue === null) {
        return undefined;
      }
      const parsed = Number(originalValue);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .typeError('Vui lòng chọn hộ khẩu hợp lệ')
    .required('Vui lòng chọn hộ khẩu'),
  hoTen: requiredTrimmedString('Vui lòng nhập họ tên'),
  ngaySinh: dateStringSchema,
  gioiTinh: yup.string()
    .oneOf(['Nam', 'Nữ', 'Khác'], 'Giới tính không hợp lệ')
    .required('Vui lòng chọn giới tính'),
  danToc: requiredTrimmedString('Vui lòng nhập dân tộc'),
  quocTich: requiredTrimmedString('Vui lòng nhập quốc tịch'),
  ngheNghiep: requiredTrimmedString('Vui lòng nhập nghề nghiệp'),
  cmndCccd: yup.string()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === undefined || originalValue === null) {
        return null;
      }
      return typeof originalValue === 'string' ? originalValue.trim() : originalValue;
    })
    .nullable()
    .test('cccd-format', 'CMND/CCCD phải có 9-12 chữ số', (value) => {
      if (!value) return true;
      return /^\d{9,12}$/.test(value);
    }),
  ngayCap: yup.string()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === undefined || originalValue === null) {
        return null;
      }
      return typeof originalValue === 'string' ? originalValue.trim() : originalValue;
    })
    .nullable()
    .test('ngayCap-format', 'Ngày cấp không hợp lệ (YYYY-MM-DD)', (value) => {
      if (!value) return true;
      return DATE_REG_EXP.test(value);
    })
    .test('ngayCap-not-future', 'Ngày cấp không được là ngày trong tương lai', (value) => {
      if (!value || !DATE_REG_EXP.test(value)) return true;
      return new Date(value) <= new Date();
    }),
  noiCap: optionalStringSchema,
  quanHeChuHo: requiredTrimmedString('Vui lòng chọn quan hệ với chủ hộ'),
  ghiChu: optionalStringSchema
});

const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' }
];

const relationshipOptions = [
  { value: 'Chủ hộ', label: 'Chủ hộ' },
  { value: 'Vợ/Chồng', label: 'Vợ/Chồng' },
  { value: 'Con', label: 'Con' },
  { value: 'Cha/Mẹ', label: 'Cha/Mẹ' },
  { value: 'Anh/Chị/Em', label: 'Anh/Chị/Em' },
  { value: 'Ông/Bà', label: 'Ông/Bà' },
  { value: 'Cháu', label: 'Cháu' },
  { value: 'Khác', label: 'Khác' }
];

export const CitizenForm = ({
  initialValues = null,
  onSubmit,
  formId,
  showActions = true,
  onCancel,
  submitLabel = 'Lưu thay đổi'
}) => {
  const [submitError, setSubmitError] = useState(null);
  const [households, setHouseholds] = useState([]);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { ...DEFAULT_FORM_VALUES },
    mode: 'onSubmit'
  });

  // Update form values when initialValues changes (edit mode)
  useEffect(() => {
    if (initialValues) {
      reset(mapDtoToFormValues(initialValues));
    } else {
      reset({ ...DEFAULT_FORM_VALUES });
    }
  }, [initialValues, reset]);

  const ngaySinh = watch('ngaySinh');
  const selectedHoKhauId = watch('hoKhauId');
  const age = calculateAge(ngaySinh);
  const showCccdFields = age >= MIN_CCCD_AGE;

  // Fetch households for autocomplete
  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await householdApi.getAll();
        const householdList = Array.isArray(response) ? response : response?.data || [];
        
        // Transform to autocomplete format: [soHoKhau] - [tenChuHo] - [diaChi]
        const options = householdList.map(h => ({
          value: h.id,
          label: `${h.soHoKhau} - ${h.tenChuHo} - ${h.diaChi}`
        }));
        
        setHouseholds(options);
      } catch (error) {
        console.error('Error fetching households:', error);
      }
    };
    
    fetchHouseholds();
  }, []);

  // Clear CCCD fields when age < 14
  useEffect(() => {
    if (age > 0 && age < MIN_CCCD_AGE) {
      setValue('cmndCccd', '', { shouldValidate: true });
      setValue('ngayCap', '', { shouldValidate: true });
      setValue('noiCap', '', { shouldValidate: true });
    }
  }, [age, setValue]);

  const onSubmitHandler = async (formValues) => {
    console.log('CITIZEN_FORM_VALUES', formValues);
    setSubmitError(null);

    const normalizedNgaySinh = formatDateForApi(formValues.ngaySinh);
    const currentAge = calculateAge(normalizedNgaySinh);
    const normalizedHoKhauId = normalizeId(formValues.hoKhauId);

    if (!normalizedHoKhauId) {
      setSubmitError('Vui lòng chọn hộ khẩu hợp lệ từ danh sách');
      return;
    }

    const hoKhauExists = households.some((option) => String(option.value) === String(normalizedHoKhauId));
    if (!hoKhauExists) {
      setSubmitError('Hộ khẩu đã chọn không tồn tại trong danh sách hiện tại');
      return;
    }

    const payload = {
      hoKhauId: normalizedHoKhauId,
      hoTen: trimString(formValues.hoTen) || '',
      ngaySinh: normalizedNgaySinh,
      gioiTinh: formValues.gioiTinh,
      danToc: trimString(formValues.danToc) || '',
      quocTich: trimString(formValues.quocTich) || '',
      ngheNghiep: trimString(formValues.ngheNghiep) || '',
      quanHeChuHo: trimString(formValues.quanHeChuHo) || '',
      ghiChu: trimToNull(formValues.ghiChu)
    };

    if (currentAge >= MIN_CCCD_AGE) {
      payload.cmndCccd = trimToNull(formValues.cmndCccd);
      payload.ngayCap = formatDateForApi(formValues.ngayCap);
      payload.noiCap = trimToNull(formValues.noiCap);
    } else {
      payload.cmndCccd = null;
      payload.ngayCap = null;
      payload.noiCap = null;
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lưu dữ liệu';
      setSubmitError(errorMessage);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div>
            <strong>Lỗi:</strong> {submitError}
          </div>
        </div>
      )}

      {/* Section 1: Thông tin hộ khẩu */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Thông tin hộ khẩu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormAutocomplete
              label="Hộ khẩu"
              name="hoKhauId"
              options={households}
              register={register}
              setValue={setValue}
              error={errors.hoKhauId}
              placeholder="Tìm kiếm theo số hộ khẩu, tên chủ hộ hoặc địa chỉ..."
              defaultValue={selectedHoKhauId ?? ''}
              required
            />
          </div>
          <FormSelect
            label="Quan hệ với chủ hộ"
            register={register}
            name="quanHeChuHo"
            options={relationshipOptions}
            error={errors.quanHeChuHo}
            required
          />
        </div>
      </div>

      {/* Section 2: Thông tin cơ bản */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Họ và tên"
              register={register}
              name="hoTen"
              error={errors.hoTen}
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>
          <FormInput
            label="Ngày sinh"
            type="date"
            register={register}
            name="ngaySinh"
            error={errors.ngaySinh}
            required
          />
          <FormSelect
            label="Giới tính"
            register={register}
            name="gioiTinh"
            options={genderOptions}
            error={errors.gioiTinh}
            required
          />
          <FormInput
            label="Dân tộc"
            register={register}
            name="danToc"
            error={errors.danToc}
            placeholder="Ví dụ: Kinh"
            required
          />
          <FormInput
            label="Quốc tịch"
            register={register}
            name="quocTich"
            error={errors.quocTich}
            placeholder="Ví dụ: Việt Nam"
            required
          />
          <div className="md:col-span-2">
            <FormInput
              label="Nghề nghiệp"
              register={register}
              name="ngheNghiep"
              error={errors.ngheNghiep}
              placeholder="Ví dụ: Kỹ sư"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Thông tin CMND/CCCD - Only show if age >= 14 */}
      <div className={showCccdFields ? "bg-green-50 p-6 rounded-lg border border-green-200" : "bg-gray-100 p-6 rounded-lg border border-gray-300 opacity-60"}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${showCccdFields ? 'text-green-700' : 'text-gray-500'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Thông tin CMND/CCCD {showCccdFields ? '(Bắt buộc từ 14 tuổi)' : '(Chỉ áp dụng từ 14 tuổi)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="CMND/CCCD"
            register={register}
            name="cmndCccd"
            error={errors.cmndCccd}
            placeholder="9-12 chữ số"
            disabled={!showCccdFields}
          />
          <FormInput
            label="Ngày cấp"
            type="date"
            register={register}
            name="ngayCap"
            error={errors.ngayCap}
            disabled={!showCccdFields}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Nơi cấp"
              register={register}
              name="noiCap"
              error={errors.noiCap}
              placeholder="Ví dụ: Công an TP. Hà Nội"
              disabled={!showCccdFields}
            />
          </div>
        </div>
      </div>

      {/* Age notification for users under 14 */}
      {!showCccdFields && ngaySinh && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div className="text-sm text-blue-700">
              <strong>Lưu ý:</strong> Người dưới 14 tuổi chưa được cấp CMND/CCCD. 
              Các trường thông tin CMND/CCCD sẽ được bỏ qua khi lưu.
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Ghi chú */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Thông tin bổ sung
        </h3>
        <FormInput
          label="Ghi chú"
          register={register}
          name="ghiChu"
          error={errors.ghiChu}
          placeholder="Thông tin bổ sung (không bắt buộc)"
        />
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 ${
              isSubmitting 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSubmitting ? 'Đang lưu...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};