import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/authLogo.png" 
                alt="StudySync Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="ml-3 text-xl font-bold">StudySync</span>
            </div>
            <p className="text-gray-400 mb-4">
              Ứng dụng công nghệ AI mang lại hiệu quả học tập tốt hơn cho mọi người.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Khóa học
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 StudySync. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}