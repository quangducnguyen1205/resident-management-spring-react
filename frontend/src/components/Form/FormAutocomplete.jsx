import React, { useState, useRef, useEffect } from 'react';

/**
 * FormAutocomplete Component
 * A searchable dropdown component for React Hook Form
 * 
 * @param {string} label - Field label
 * @param {string} name - Field name
 * @param {Array} options - Array of {value, label} objects
 * @param {Object} register - React Hook Form register function
 * @param {Function} setValue - React Hook Form setValue function
 * @param {Object} error - Validation error object
 * @param {string} placeholder - Input placeholder
 * @param {any} defaultValue - Default selected value
 */
const FormAutocomplete = ({ 
  label, 
  name, 
  options = [], 
  register, 
  setValue, 
  error, 
  placeholder = 'Tìm kiếm...', 
  defaultValue,
  required = false
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const wrapperRef = useRef(null);

  // Initialize with default value
  useEffect(() => {
    if (defaultValue && options.length > 0) {
      const option = options.find(opt => opt.value === defaultValue);
      if (option) {
        setSelectedOption(option);
        setSearch(option.label);
      }
    }
  }, [defaultValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedOption(option);
    setSearch(option.label);
    setValue(name, option.value, { shouldValidate: true });
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setIsOpen(true);
    // Clear selection if user types
    if (selectedOption) {
      setSelectedOption(null);
      setValue(name, '', { shouldValidate: true });
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="mb-4" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Hidden input for React Hook Form */}
      <input type="hidden" {...register(name)} />
      
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        
        {/* Dropdown icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Dropdown list */}
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  selectedOption?.value === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {isOpen && search && filteredOptions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default FormAutocomplete;
