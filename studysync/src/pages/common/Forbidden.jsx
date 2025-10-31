import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          403
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Không có quyền truy cập</h1>
        <p className="mt-2 text-gray-600">Bạn không có quyền truy cập trang này. Nếu nghĩ đây là nhầm lẫn, hãy liên hệ quản trị viên.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/" className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition">Về trang chủ</Link>
          <Link to="/login" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition">Đăng nhập tài khoản khác</Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;


