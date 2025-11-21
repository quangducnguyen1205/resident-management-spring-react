import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';

const schema = yup.object().shape({
  hoKhauId: yup.number().typeError('Vui lòng chọn hộ khẩu').required('Vui lòng chọn hộ khẩu'),
  hoTen: yup.string().required('Vui lòng nhập họ tên'),
  ngaySinh: yup.date().required('Vui lòng nhập ngày sinh'),
  gioiTinh: yup.string().required('Vui lòng chọn giới tính'),
  danToc: yup.string().required('Vui lòng nhập dân tộc'),
  quocTich: yup.string().required('Vui lòng nhập quốc tịch'),
  ngheNghiep: yup.string().required('Vui lòng nhập nghề nghiệp'),
  cmndCccd: yup.string()
    .matches(/^\d{9,12}$/, 'CMND/CCCD phải có 9-12 chữ số')
    .required('Vui lòng nhập CMND/CCCD'),
  ngayCap: yup.date().required('Vui lòng nhập ngày cấp'),
  noiCap: yup.string().required('Vui lòng nhập nơi cấp'),
  quanHeChuHo: yup.string().required('Vui lòng nhập quan hệ với chủ hộ'),
  ghiChu: yup.string(),
  trangThai: yup.string().required('Vui lòng chọn trạng thái')
});

const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' }
];

const statusOptions = [
  { value: 'THUONG_TRU', label: 'Thường trú' },
  { value: 'TAM_TRU', label: 'Tạm trú' },
  { value: 'TAM_VANG', label: 'Tạm vắng' }
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

// Helper: Transform giá trị giới tính - try multiple formats
const transformGender = (value) => {
  // Format 1: Giữ nguyên (Nam, Nữ)
  return value;
  
  // Nếu cần, có thể thử:
  // Format 2: Uppercase (NAM, NỮ)
  // return value.toUpperCase();
  
  // Format 3: Số (0, 1)
  // return value === 'Nam' ? '0' : '1';
  
  // Format 4: English (MALE, FEMALE)
  // return value === 'Nam' ? 'MALE' : 'FEMALE';
};

export const CitizenForm = ({ initialValues, onSubmit, householdOptions = [] }) => {
  const [submitError, setSubmitError] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  const onSubmitHandler = (data) => {
    // Clear previous errors
    setSubmitError(null);
    
    // Transform data: giữ camelCase format (backend expect camelCase, không phải snake_case!)
    const submitData = {
      hoKhauId: parseInt(data.hoKhauId, 10), // Convert string to number
      hoTen: data.hoTen,
      ngaySinh: data.ngaySinh instanceof Date 
        ? data.ngaySinh.toISOString().split('T')[0]
        : data.ngaySinh,
      gioiTinh: transformGender(data.gioiTinh),
      danToc: data.danToc,
      quocTich: data.quocTich,
      ngheNghiep: data.ngheNghiep,
      cmndCccd: data.cmndCccd,
      ngayCap: data.ngayCap instanceof Date 
        ? data.ngayCap.toISOString().split('T')[0]
        : data.ngayCap,
      noiCap: data.noiCap,
      quanHeChuHo: data.quanHeChuHo,
      ghiChu: data.ghiChu || '',
      trangThai: data.trangThai
    };
    
    console.log('Form submitted with data (camelCase):', submitData);
    
    try {
      onSubmit(submitData);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
      console.error('Submit error:', err);
    }
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
            <FormSelect
              label="Hộ khẩu"
              register={register}
              name="hoKhauId"
              options={householdOptions}
              error={errors.hoKhauId}
            />
          </div>
          <FormSelect
            label="Quan hệ với chủ hộ"
            register={register}
            name="quanHeChuHo"
            options={relationshipOptions}
            error={errors.quanHeChuHo}
          />
          <FormSelect
            label="Trạng thái"
            register={register}
            name="trangThai"
            options={statusOptions}
            error={errors.trangThai}
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
            />
          </div>
          <FormInput
            label="Ngày sinh"
            type="date"
            register={register}
            name="ngaySinh"
            error={errors.ngaySinh}
          />
          <FormSelect
            label="Giới tính"
            register={register}
            name="gioiTinh"
            options={genderOptions}
            error={errors.gioiTinh}
          />
          <FormInput
            label="Dân tộc"
            register={register}
            name="danToc"
            error={errors.danToc}
            placeholder="Ví dụ: Kinh"
          />
          <FormInput
            label="Quốc tịch"
            register={register}
            name="quocTich"
            error={errors.quocTich}
            placeholder="Ví dụ: Việt Nam"
          />
          <div className="md:col-span-2">
            <FormInput
              label="Nghề nghiệp"
              register={register}
              name="ngheNghiep"
              error={errors.ngheNghiep}
              placeholder="Ví dụ: Kỹ sư"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Thông tin CMND/CCCD */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Thông tin CMND/CCCD
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="CMND/CCCD"
            register={register}
            name="cmndCccd"
            error={errors.cmndCccd}
            placeholder="9-12 chữ số"
          />
          <FormInput
            label="Ngày cấp"
            type="date"
            register={register}
            name="ngayCap"
            error={errors.ngayCap}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Nơi cấp"
              register={register}
              name="noiCap"
              error={errors.noiCap}
              placeholder="Ví dụ: Công an TP. Hà Nội"
            />
          </div>
        </div>
      </div>

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
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
};