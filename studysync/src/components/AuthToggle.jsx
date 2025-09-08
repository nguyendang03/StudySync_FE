import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthToggle({ activeTab }) {
  return (
    <div className="flex bg-white/20 rounded-full p-1.5 mb-8">
      <Link 
        to="/login" 
        className={`flex-1 py-3 px-6 text-sm font-semibold text-white rounded-full transition-all text-center ${
          activeTab === 'login' 
            ? 'bg-white/30 shadow-lg' 
            : 'hover:bg-white/20'
        }`}
      >
        Đăng nhập
      </Link>
      <Link 
        to="/register" 
        className={`flex-1 py-3 px-6 text-sm font-semibold text-white rounded-full transition-all text-center ${
          activeTab === 'register' 
            ? 'bg-white/30 shadow-lg' 
            : 'hover:bg-white/20'
        }`}
      >
        Đăng ký
      </Link>
    </div>
  );
}
