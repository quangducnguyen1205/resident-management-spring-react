import React from 'react';
import { HouseholdForm } from './HouseholdForm';

export const HouseholdModal = ({ isOpen, onClose, onSave, household }) => {
  if (!isOpen) return null;

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
          initialValues={household || {}}
          onSubmit={onSave}
        />
      </div>
    </div>
  );
};