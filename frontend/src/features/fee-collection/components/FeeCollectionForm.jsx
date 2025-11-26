import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation } from 'react-router-dom';
import * as yup from 'yup';
import FormInput from '../../../components/Form/FormInput';
import FormSelect from '../../../components/Form/FormSelect';
import feePeriodApi from '../../../api/feePeriodApi';
import householdApi from '../../../api/householdApi';
import feeCollectionApi from '../../../api/feeCollectionApi';
import { useAuth } from '../../auth/contexts/AuthContext';

/**
 * FeeCollectionForm - Refactored 2025
 * 
 * REMOVED FIELDS:
 * - soTienDaThu (backend calculates automatically)
 * - periodDescription (no longer exists)
 * 
 * NEW BEHAVIOR:
 * - Auto-calls /calculate endpoint when household + period selected
 * - Displays amount summary card with formula breakdown
 * - Only allows editing ngayThu and ghiChu (backend enforces)
 * - Shows inline errors (no full-page navigation on error)
 */
const schema = yup.object().shape({
  hoKhauId: yup.number().required('Vui lòng chọn hộ khẩu'),
  dotThuPhiId: yup.number().required('Vui lòng chọn đợt thu phí'),
  ngayThu: yup.string().required('Vui lòng nhập ngày thu'),
  ghiChu: yup.string(),
});

export const FeeCollectionForm = ({
  initialValues,
  onSubmit,
  submitting = false,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [feePeriods, setFeePeriods] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);

  const hasAccountantRole = user?.role === 'KETOAN';
  const isEditMode = initialValues && initialValues.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError: setFormError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  // Initialize form with existing values when editing
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const selectedHoKhauId = watch('hoKhauId');
  const selectedDotThuPhiId = watch('dotThuPhiId');

  // Fetch options for selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [periodsRes, householdsRes] = await Promise.all([
          feePeriodApi.getAll(),
          householdApi.getAll(),
        ]);

        setFeePeriods(
          periodsRes.data.map((period) => ({
            value: period.id,
            label: `${period.tenDot || period.tenDotThu || 'Không có tên'} (${
              period.ngayBatDau
            } - ${period.ngayKetThuc})`,
          }))
        );

        setHouseholds(
          householdsRes.data.map((household) => ({
            value: household.id,
            label: `${household.soHoKhau} - ${household.tenChuHo}`,
          }))
        );
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refetch periods when navigating within fee-collection
  useEffect(() => {
    if (location.pathname.includes('/fee-collection')) {
      const refetchPeriods = async () => {
        try {
          const periodsRes = await feePeriodApi.getAll();
          setFeePeriods(
            periodsRes.data.map((period) => ({
              value: period.id,
              label: `${
                period.tenDot || period.tenDotThu || 'Không có tên'
              } (${period.ngayBatDau} - ${period.ngayKetThuc})`,
            }))
          );
        } catch (error) {
          console.error('Error re-fetching periods:', error);
        }
      };
      refetchPeriods();
    }
  }, [location.pathname]);

  // Auto-calculate fee when both household and period are selected
  useEffect(() => {
    if (selectedHoKhauId && selectedDotThuPhiId) {
      calculateFee();
    } else {
      setCalculatedFee(null);
      setCalculationError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHoKhauId, selectedDotThuPhiId]);

  const calculateFee = async () => {
    setCalculating(true);
    setCalculationError(null);
    
    try {
      const result = await feeCollectionApi.calculateFee(
        selectedHoKhauId,
        selectedDotThuPhiId
      );
      setCalculatedFee(result.data);
    } catch (error) {
      console.error('Error calculating fee:', error);
      const errorMsg = error.response?.data?.message || 'Không thể tính phí. Vui lòng thử lại.';
      setCalculationError(errorMsg);
      setCalculatedFee(null);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (!hasAccountantRole) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Không có quyền truy cập
            </h3>
            <p className="text-red-700">
              Chỉ nhân viên <strong>Kế toán</strong> mới có quyền thực hiện các
              thao tác trên mục <strong>Thu Phí Hộ Khẩu</strong>.
            </p>
            <p className="text-red-600 text-sm mt-2">
              Vui lòng liên hệ quản trị viên nếu bạn cần cấp quyền truy cập.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (data) => {
    await onSubmit(data, setFormError);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Household & Period Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
        <FormSelect
          label="Hộ khẩu"
          register={register}
          name="hoKhauId"
          options={households}
          error={errors.hoKhauId}
          required
          disabled={isEditMode}
        />

        <FormSelect
          label="Đợt thu phí"
          register={register}
          name="dotThuPhiId"
          options={feePeriods}
          error={errors.dotThuPhiId}
          required
          disabled={isEditMode}
        />
      </div>

      {isEditMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Lưu ý:</strong> Không thể thay đổi hộ khẩu và đợt thu phí sau khi đã tạo bản ghi. 
            Chỉ có thể cập nhật ngày thu và ghi chú.
          </p>
        </div>
      )}

      {/* Calculation Loading State */}
      {calculating && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Đang tính toán phí...</p>
          </div>
        </div>
      )}

      {/* Calculation Error */}
      {calculationError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Lỗi tính phí</h4>
              <p className="text-sm text-red-700">{calculationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Amount Summary Card */}
      {calculatedFee && !calculating && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Thông tin tính phí
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Số nhân khẩu</p>
              <p className="font-bold text-lg text-gray-900">
                {calculatedFee.memberCount} <span className="text-sm font-normal">người</span>
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Định mức/tháng</p>
              <p className="font-bold text-lg text-gray-900">
                {new Intl.NumberFormat('vi-VN').format(calculatedFee.monthlyFeePerPerson)} ₫
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Số tháng</p>
              <p className="font-bold text-lg text-gray-900">
                {calculatedFee.months} <span className="text-sm font-normal">tháng</span>
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Kỳ thu</p>
              <p className="text-xs text-gray-700">
                {new Date(calculatedFee.periodStart).toLocaleDateString('vi-VN')} - {new Date(calculatedFee.periodEnd).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-300 mb-3">
            <p className="text-xs text-gray-600 mb-2">Công thức tính</p>
            <p className="font-mono text-sm text-gray-800 mb-2">
              {calculatedFee.formula}
            </p>
          </div>

          <div className="bg-green-600 text-white p-4 rounded-lg text-center">
            <p className="text-sm font-medium mb-1">TỔNG PHÍ PHẢI THU</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('vi-VN').format(calculatedFee.totalFee)} ₫
            </p>
          </div>
        </div>
      )}

      {/* Payment Date and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-lg">
        <FormInput
          label="Ngày thu"
          type="date"
          register={register}
          name="ngayThu"
          error={errors.ngayThu}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            {...register('ghiChu')}
            rows={3}
            placeholder="Nhập ghi chú (nếu có)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.ghiChu && (
            <p className="mt-1 text-sm text-red-600">{errors.ghiChu.message}</p>
          )}
        </div>
      </div>

      {/* Backend Error Display (inline) */}
      {errors.root && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Lỗi</h4>
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="submit"
          disabled={submitting || calculating || !calculatedFee}
          className={`px-6 py-3 rounded-lg transition font-medium shadow-md ${
            submitting || calculating || !calculatedFee
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang lưu...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              💾 {isEditMode ? 'Cập nhật' : 'Lưu thu phí'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default FeeCollectionForm;