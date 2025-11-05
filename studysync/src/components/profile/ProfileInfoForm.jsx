import React, { useState, useEffect } from 'react';
import { 
  EditOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined, 
  BookOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Spin } from 'antd';
import { toast } from 'sonner';
import useAuthStore from '../../stores/authStore';
import userService from '../../services/userService';

export default function ProfileInfoForm() {
  const { user, fetchUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    studentId: '',
    major: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      if (profile) {
        setFormData({
          username: profile.username || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          studentId: profile.studentId || '',
          major: profile.major || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data for update (only send fields that can be updated)
      const updateData = {
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        studentId: formData.studentId,
        major: formData.major
      };

      await userService.updateProfile(updateData);
      
      // Refresh user profile from server
      await fetchUserProfile();
      
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#9333ea' }} spin />} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <EditOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
            Chỉnh sửa
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <UserOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
            Tên người dùng
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="Nhập tên người dùng"
          />
        </div>

        {/* Email */}
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
            disabled={true}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed transition-colors"
            placeholder="example@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <PhoneOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
              !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="0123456789"
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
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
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
              disabled={!isEditing}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Chuyên ngành của bạn"
            />
          </div>
        </div>

        {/* Submit and Cancel Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                loadUserProfile(); // Reset form data
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
              ) : (
                <SaveOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
              )}
              Lưu thay đổi
            </button>
          </div>
        )}
      </form>
    </div>
  );
}