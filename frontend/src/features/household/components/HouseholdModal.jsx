import React, { useMemo, useId } from 'react';
import { HouseholdForm } from './HouseholdForm';

export const HouseholdModal = ({ isOpen, onClose, onSave, household }) => {
  if (!isOpen) return null;

  const initialValues = useMemo(() => household || null, [household]);
  const householdFormId = useId();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {household ? 'Sửa hộ khẩu' : 'Thêm hộ khẩu mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <HouseholdForm
          key={initialValues?.id || 'new-household'}
          initialValues={initialValues || undefined}
          onSubmit={onSave}
          formId={householdFormId}
          showActions={false}
        />

        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form={householdFormId}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};