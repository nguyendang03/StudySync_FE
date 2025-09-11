import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';

export default function ProfilePictureUpload() {
  const [profileImage, setProfileImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-full"></div>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Ảnh đại diện</h3>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        Tải lên ảnh đại diện để cá nhân hóa hồ sơ của bạn
      </p>
      
      <label className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-medium cursor-pointer hover:bg-purple-700 transition-colors">
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