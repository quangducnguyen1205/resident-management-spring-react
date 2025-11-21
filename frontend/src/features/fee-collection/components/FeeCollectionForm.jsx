import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import feePeriodApi from '../../../api/feePeriodApi';
import householdApi from '../../../api/householdApi';
import feeCollectionApi from '../../../api/feeCollectionApi';
import { useAuth } from '../../auth/contexts/AuthContext';

const schema = yup.object().shape({
  hoKhauId: yup.number().required('Vui lòng chọn hộ khẩu'),
  dotThuPhiId: yup.number().required('Vui lòng chọn đợt thu phí'),
  soTienDaThu: yup.number()
    .positive('Số tiền phải lớn hơn 0')
    .required('Vui lòng nhập số tiền đã thu'),
  ngayThu: yup.string().required('Vui lòng nhập ngày thu'),
  ghiChu: yup.string()
});

export const FeeCollectionForm = ({ initialValues, onSubmit }) => {
  const { user } = useAuth();
  const [feePeriods, setFeePeriods] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Check if user has accountant role (Kế toán)
  const hasAccountantRole = user?.role === 'KETOAN';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  const selectedHoKhauId = watch('hoKhauId');
  const selectedDotThuPhiId = watch('dotThuPhiId');

  // Fetch form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [periodsRes, householdsRes] = await Promise.all([
          feePeriodApi.getAll(),
          householdApi.getAll()
        ]);

        setFeePeriods(periodsRes.data.map(period => ({
          value: period.id,
          label: `${period.tenDotThu} (${period.ngayBatDau} - ${period.ngayKetThuc})`
        })));

        setHouseholds(householdsRes.data.map(household => ({
          value: household.id,
          label: `${household.soHoKhau} - ${household.tenChuHo} (${household.soThanhVien} người)`
        })));
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-calculate fee when household or period changes
  useEffect(() => {
    if (selectedHoKhauId && selectedDotThuPhiId) {
      calculateFee();
    }
  }, [selectedHoKhauId, selectedDotThuPhiId]);

  const calculateFee = async () => {
    setCalculating(true);
    try {
      const result = await feeCollectionApi.calculateFee({
        hoKhauId: selectedHoKhauId,
        dotThuPhiId: selectedDotThuPhiId
      });
      setCalculatedFee(result.data);
      // Auto-fill the total fee
      if (!initialValues?.id) {  // Only auto-fill for new records
        setValue('soTienDaThu', result.data.totalFee);
      }
    } catch (error) {
      console.error('Error calculating fee:', error);
      setCalculatedFee(null);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  // Check permission for fee-collection
  if (!hasAccountantRole) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Không có quyền truy cập</h3>
            <p className="text-red-700">
              Chỉ nhân viên <strong>Kế toán</strong> mới có quyền thực hiện các thao tác trên mục <strong>Thu Phí Hộ Khẩu</strong>.
            </p>
            <p className="text-red-600 text-sm mt-2">
              Vui lòng liên hệ quản trị viên nếu bạn cần cấp quyền truy cập.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section: Chọn hộ khẩu và đợt thu phí */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
        <FormSelect
          label="Hộ khẩu"
          register={register}
          name="hoKhauId"
          options={households}
          error={errors.hoKhauId}
          required
        />

        <FormSelect
          label="Đợt thu phí"
          register={register}
          name="dotThuPhiId"
          options={feePeriods}
          error={errors.dotThuPhiId}
          required
        />
      </div>

      {/* Section: Tính phí tự động */}
      {calculatedFee && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">📊 Thông tin tính phí</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Số nhân khẩu</p>
              <p className="font-semibold text-lg">{calculatedFee.memberCount} người</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phí/người/tháng</p>
              <p className="font-semibold text-lg">{new Intl.NumberFormat('vi-VN').format(calculatedFee.monthlyFeePerPerson)} ₫</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số tháng</p>
              <p className="font-semibold text-lg">{calculatedFee.monthsPerYear}</p>
            </div>
            <div className="col-span-2 md:col-span-3 bg-white p-3 rounded border border-green-300">
              <p className="text-xs text-gray-600">Công thức tính</p>
              <p className="font-mono text-sm">
                {new Intl.NumberFormat('vi-VN').format(calculatedFee.monthlyFeePerPerson)} ₫ × {calculatedFee.monthsPerYear} tháng × {calculatedFee.memberCount} người = {new Intl.NumberFormat('vi-VN').format(calculatedFee.totalFee)} ₫
              </p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <p className="text-sm text-gray-600">Tổng phí phải thu</p>
              <p className="text-2xl font-bold text-green-700">{new Intl.NumberFormat('vi-VN').format(calculatedFee.totalFee)} ₫</p>
            </div>
          </div>
        </div>
      )}

      {/* Section: Nhập số tiền đã thu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
        <FormInput
          label="Số tiền đã thu (₫)"
          type="number"
          register={register}
          name="soTienDaThu"
          error={errors.soTienDaThu}
          required
          placeholder={calculatedFee ? `Tổng phí: ${calculatedFee.totalFee}` : 'Nhập số tiền'}
        />

        <FormInput
          label="Ngày thu"
          type="date"
          register={register}
          name="ngayThu"
          error={errors.ngayThu}
          required
        />
      </div>

      {/* Section: Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
        <textarea
          {...register('ghiChu')}
          rows={3}
          placeholder="Nhập ghi chú (ví dụ: Đã thanh toán đủ, Thanh toán một phần...)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Section: Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          💾 Lưu thay đổi
        </button>
      </div>
    </form>
  );
};