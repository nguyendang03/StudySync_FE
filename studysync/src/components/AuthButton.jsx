import React from 'react';

export default function AuthButton({ children, type = "submit", onClick, ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      {...props}
    >
      {children}
    </button>
  );
}
