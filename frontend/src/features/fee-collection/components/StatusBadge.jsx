import React from 'react';

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'DA_NOP', label: 'Đã nộp' },
  { value: 'CHUA_NOP', label: 'Chưa nộp' }
];

export const ALL_STATUS_OPTIONS = [
  ...PAYMENT_STATUS_OPTIONS,
  { value: 'KHONG_AP_DUNG', label: 'Không áp dụng' }
];

const STATUS_META = {
  DA_NOP: { label: 'Đã nộp', color: 'bg-green-100 text-green-800', icon: '✅' },
  CHUA_NOP: { label: 'Chưa nộp', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  KHONG_AP_DUNG: { label: 'Không áp dụng', color: 'bg-gray-100 text-gray-600', icon: '➖' }
};

const SIZE_CLASS = {
  sm: 'text-xs px-2 py-1',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-4 py-2'
};

export const getStatusMeta = (status) => STATUS_META[status] || { label: 'Chưa xác định', color: 'bg-gray-100 text-gray-600', icon: '•' };

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const meta = getStatusMeta(status);
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;

  return (
    <span className={`${sizeClass} rounded-full font-medium inline-flex items-center gap-1 ${meta.color}`}>
      {showIcon && <span>{meta.icon}</span>}
      {meta.label}
    </span>
  );
};

export default StatusBadge;
