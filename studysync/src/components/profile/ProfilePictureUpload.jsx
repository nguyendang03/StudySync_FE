import React, { useState, useEffect } from 'react';
import { UploadOutlined, UserOutlined, MailOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Spin } from 'antd';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function ProfilePictureUpload() {
  const { user, fetchUserProfile } = useAuthStore();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      await fetchUserProfile();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        // TODO: Upload to server
        toast.success('Ảnh đại diện đã được tải lên!');
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-purple-600 overflow-hidden flex items-center justify-center shadow-xl">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserOutlined className="text-white text-5xl" />
          )}
        </div>
        {user?.isVerified && (
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
            <CheckCircleFilled className="text-white text-sm" />
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-1">
        {user?.username || 'Người dùng'}
      </h3>
      <div className="flex items-center justify-center gap-2 mb-2">
        <MailOutlined className="text-gray-500" />
        <p className="text-gray-600 text-sm">
          {user?.email || 'email@example.com'}
        </p>
      </div>
      
      {user?.studentId && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            MSSV: {user.studentId}
          </span>
        </div>
      )}
      
      {user?.isVerified && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircleFilled />
            Tài khoản đã xác thực
          </span>
        </div>
      )}
      
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Tải lên ảnh đại diện để cá nhân hóa hồ sơ của bạn
      </p>
      
      <label className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-medium cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
        <UploadOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
        Tải ảnh lên
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );
}