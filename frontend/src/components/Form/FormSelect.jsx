import React from 'react';

const FormSelect = ({
  label,
  error,
  register,
  name,
  options,
  placeholder = 'Vui lòng chọn...',
  required = false,
  ...rest
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        {...register(name)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options && options.length > 0 && options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default FormSelect;