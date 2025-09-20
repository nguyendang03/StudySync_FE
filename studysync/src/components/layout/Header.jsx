import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/authLogo.png" 
              alt="StudySync Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="ml-3 text-2xl font-bold text-gray-900">StudySync</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link 
              to="/groups" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Nhóm học
            </Link>
            <Link 
              to="/chatbot" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              AI Trợ lý
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Hỗ trợ
            </Link>
            <a 
              href="#" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Về chúng tôi
            </a>
            <a 
              href="#" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Liên hệ
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-purple-600 hover:text-purple-700 px-4 py-2 text-sm font-medium transition-colors"
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Đăng ký
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}