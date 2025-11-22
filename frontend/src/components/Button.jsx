// src/components/Button.jsx
import React from "react";

const Button = ({ label, onClick, loading = false, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full py-2 rounded-lg text-white font-semibold transition ${
        loading || disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Đang xử lý..." : label}
    </button>
  );
};

export default Button;
