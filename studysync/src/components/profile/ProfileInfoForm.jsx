import React, { useState } from 'react';
import { 
  EditOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined, 
  IdcardOutlined, 
  BookOutlined 
} from '@ant-design/icons';

export default function ProfileInfoForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    studentId: '',
    major: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Thông tin cá nhân</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <UserOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
            Họ và tên
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="Nhập họ và tên của bạn"
          />
        </div>

        {/* Email and Phone in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MailOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <PhoneOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="0123456789"
            />
          </div>
        </div>

        {/* University */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <BankOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
            Trường Đại Học
          </label>
          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="Nhập tên trường đại học"
          />
        </div>

        {/* Student ID and Major in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <IdcardOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
              Mã Số Sinh Viên
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="MSSV của bạn"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <BookOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
              Chuyên Ngành
            </label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Chuyên ngành của bạn"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg"
          >
            <EditOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            Chỉnh sửa
          </button>
        </div>
      </form>
    </div>
  );
}