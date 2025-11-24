import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-red-500 text-center mb-4">
        <p className="text-lg font-semibold">Đã xảy ra lỗi</p>
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;