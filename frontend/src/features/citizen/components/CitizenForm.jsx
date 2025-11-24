import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import FormAutocomplete from '../../../components/Form/FormAutocomplete';
import householdApi from '../../../api/householdApi';

// Helper function to calculate age from date of birth
const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const schema = yup.object().shape({
  hoKhauId: yup.number().typeError('Vui lòng chọn hộ khẩu').required('Vui lòng chọn hộ khẩu'),
  hoTen: yup.string().required('Vui lòng nhập họ tên'),
  ngaySinh: yup.date()
    .required('Vui lòng nhập ngày sinh')
    .max(new Date(), 'Ngày sinh không được là ngày trong tương lai')
    .typeError('Ngày sinh không hợp lệ'),
  gioiTinh: yup.string().required('Vui lòng chọn giới tính'),
  danToc: yup.string().required('Vui lòng nhập dân tộc'),
  quocTich: yup.string().required('Vui lòng nhập quốc tịch'),
  ngheNghiep: yup.string().required('Vui lòng nhập nghề nghiệp'),
  cmndCccd: yup.string()
    .nullable()
    .transform((value, originalValue) => {
      console.log('cmndCccd transform - original:', originalValue, 'transformed:', value === '' ? null : value);
      return value === '' || value === undefined ? null : value;
    })
    .when(['ngaySinh'], {
      is: (ngaySinh) => {
        const age = calculateAge(ngaySinh);
        console.log('cmndCccd validation - age:', age, 'ngaySinh:', ngaySinh);
        return age >= 14;
      },
      then: (schema) => schema
        .matches(/^\d{9,12}$/, 'CMND/CCCD phải có 9-12 chữ số')
        .required('Người từ 14 tuổi trở lên phải có CMND/CCCD'),
      otherwise: (schema) => schema.optional()
    }),
  ngayCap: yup.mixed()
    .nullable()
    .transform((value, originalValue) => {
      // Transform empty string to null to prevent date parsing issues
      console.log('ngayCap transform - original:', originalValue, 'type:', typeof originalValue);
      if (originalValue === '' || originalValue === undefined || originalValue === null) {
        console.log('ngayCap transform - returning null for empty value');
        return null;
      }
      console.log('ngayCap transform - returning:', originalValue);
      return originalValue;
    })
    .when(['ngaySinh'], {
      is: (ngaySinh) => {
        const age = calculateAge(ngaySinh);
        console.log('ngayCap validation - age:', age, 'ngaySinh:', ngaySinh);
        return age >= 14;
      },
      then: (schema) => schema
        .required('Người từ 14 tuổi trở lên phải có ngày cấp CMND/CCCD')
        .test('is-valid-date', 'Ngày cấp không hợp lệ', function(value) {
          if (!value) return false; // Required field
          const date = new Date(value);
          return !isNaN(date.getTime()); // Check if valid date
        })
        .test('min-age-14', 'Ngày cấp phải sau ngày sinh ít nhất 14 năm', function(value) {
          const { ngaySinh } = this.parent;
          if (!ngaySinh || !value) return true;
          const birthDate = new Date(ngaySinh);
          const issueDate = new Date(value);
          if (isNaN(issueDate.getTime())) return false; // Invalid date
          const minIssueDate = new Date(birthDate);
          minIssueDate.setFullYear(birthDate.getFullYear() + 14);
          return issueDate >= minIssueDate;
        })
        .test('max-today', 'Ngày cấp không được là ngày trong tương lai', function(value) {
          if (!value) return true;
          const issueDate = new Date(value);
          if (isNaN(issueDate.getTime())) return false;
          return issueDate <= new Date();
        }),
      otherwise: (schema) => schema.optional()
    }),
  noiCap: yup.string()
    .nullable()
    .transform((value, originalValue) => {
      console.log('noiCap transform - original:', originalValue, 'transformed:', value === '' ? null : value);
      return value === '' || value === undefined ? null : value;
    })
    .when(['ngaySinh'], {
      is: (ngaySinh) => {
        const age = calculateAge(ngaySinh);
        console.log('noiCap validation - age:', age);
        return age >= 14;
      },
      then: (schema) => schema.required('Người từ 14 tuổi trở lên phải có nơi cấp CMND/CCCD'),
      otherwise: (schema) => schema.optional()
    }),
  quanHeChuHo: yup.string().required('Vui lòng nhập quan hệ với chủ hộ'),
  ghiChu: yup.string()
});

const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' }
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

export const CitizenForm = ({ initialValues, onSubmit, householdOptions = [] }) => {
  const [submitError, setSubmitError] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
    mode: 'onSubmit'
  });

  // Log validation errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('=== FORM VALIDATION ERRORS ===');
      console.log('Errors:', errors);
      console.log('Fields with errors:', Object.keys(errors));
    }
  }, [errors]);

  // Update form values when initialValues changes (edit mode)
  useEffect(() => {
    if (initialValues) {
      // Convert date strings to YYYY-MM-DD format for date inputs
      const formattedValues = {
        ...initialValues,
        ngaySinh: initialValues.ngaySinh ? 
          (initialValues.ngaySinh.split('T')[0]) : '',
        ngayCap: initialValues.ngayCap ? 
          (initialValues.ngayCap.split('T')[0]) : ''
      };
      reset(formattedValues);
    }
  }, [initialValues, reset]);

  const ngaySinh = watch('ngaySinh');
  const age = calculateAge(ngaySinh);
  const showCccdFields = age >= 14;

  // Fetch households for autocomplete
  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await householdApi.getAll();
        const householdList = response.data || [];
        
        // Transform to autocomplete format: [soHoKhau] - [tenChuHo] - [diaChi]
        const options = householdList.map(h => ({
          value: h.id,
          label: `${h.soHoKhau} - ${h.tenChuHo} - ${h.diaChi}`
        }));
        
        setHouseholds(options);
      } catch (error) {
        console.error('Error fetching households:', error);
      } finally {
        setLoadingHouseholds(false);
      }
    };
    
    fetchHouseholds();
  }, []);

  // Clear CCCD fields when age < 14
  useEffect(() => {
    if (age < 14) {
      setValue('cmndCccd', '');
      setValue('ngayCap', '');
      setValue('noiCap', '');
    }
  }, [age, setValue]);

  const onSubmitHandler = async (data) => {
    console.log('\n=== CITIZEN FORM SUBMIT HANDLER CALLED ===');
    console.log('onSubmitHandler ENTRY - data received:', data);
    console.log('Current form errors:', errors);
    console.log('isSubmitting:', isSubmitting);
    
    // Clear previous errors
    setSubmitError(null);
    
    console.log('Raw form data:', data);
    console.log('Calculated age from ngaySinh:', age);
    console.log('Age >= 14:', age >= 14);
    console.log('Raw ngayCap value:', data.ngayCap, 'Type:', typeof data.ngayCap);
    
    // Transform ngayCap properly - ensure null for age < 14, valid YYYY-MM-DD for age >= 14
    let transformedNgayCap = null;
    if (age >= 14 && data.ngayCap) {
      // Only process ngayCap if age >= 14 and value exists
      if (data.ngayCap instanceof Date) {
        transformedNgayCap = data.ngayCap.toISOString().split('T')[0];
      } else if (typeof data.ngayCap === 'string' && data.ngayCap.trim() !== '') {
        // Validate it's a proper date string
        const testDate = new Date(data.ngayCap);
        if (!isNaN(testDate.getTime())) {
          transformedNgayCap = data.ngayCap;
        } else {
          console.warn('ngayCap is invalid date string:', data.ngayCap);
          transformedNgayCap = null;
        }
      }
    }
    console.log('Transformed ngayCap:', transformedNgayCap);
    
    // Transform data: giữ camelCase format (backend expect camelCase, không phải snake_case!)
    const submitData = {
      hoKhauId: parseInt(data.hoKhauId, 10), // Convert string to number
      hoTen: data.hoTen,
      ngaySinh: data.ngaySinh instanceof Date 
        ? data.ngaySinh.toISOString().split('T')[0]
        : data.ngaySinh,
      gioiTinh: data.gioiTinh,
      danToc: data.danToc,
      quocTich: data.quocTich,
      ngheNghiep: data.ngheNghiep,
      cmndCccd: age >= 14 ? (data.cmndCccd || null) : null,
      ngayCap: transformedNgayCap, // Use the safely transformed value
      noiCap: age >= 14 ? (data.noiCap || null) : null,
      quanHeChuHo: data.quanHeChuHo,
      ghiChu: data.ghiChu || ''
    };
    
    console.log('Final payload to API:', submitData);
    console.log('CCCD fields (should be null for age < 14):', {
      cmndCccd: submitData.cmndCccd,
      ngayCap: submitData.ngayCap,
      noiCap: submitData.noiCap
    });
    
    try {
      console.log('Calling onSubmit prop with submitData...');
      await onSubmit(submitData);
      console.log('onSubmit completed successfully!');
    } catch (err) {
      console.error('=== SUBMIT ERROR ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi lưu dữ liệu';
      setSubmitError(errorMessage);
      console.error('Submit error set to:', errorMessage);
    }
    
    console.log('=== SUBMIT HANDLER EXIT ===\n');
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
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
              defaultValue={initialValues?.hoKhauId}
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
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            console.log('Cancel button clicked');
            window.history.back();
          }}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => console.log('Submit button clicked, isSubmitting:', isSubmitting)}
          className={`px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};