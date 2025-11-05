import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import userService from '../../services/userService';

const PasswordField = ({ 
  label, 
  name, 
  value, 
  placeholder, 
  showField, 
  error,
  onToggleVisibility,
  onChange,
  icon = <LockOutlined style={{ fontSize: '16px', marginRight: '8px', color: '#9333ea' }} />
}) => (
  <div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      {icon}
      {label}
    </label>
    <div className="relative">
      <input
        type={showField ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-purple-500 transition-colors ${
          error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-gray-200 focus:border-purple-500'
        }`}
        placeholder={placeholder}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
      >
        {showField ? (
          <EyeInvisibleOutlined style={{ fontSize: '18px' }} />
        ) : (
          <EyeOutlined style={{ fontSize: '18px' }} />
        )}
      </button>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await userService.updatePassword({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        
        // Reset form on success
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Reset password visibility
        setShowPasswords({
          current: false,
          new: false,
          confirm: false
        });
        
        toast.success('Mật khẩu đã được thay đổi thành công!', {
          duration: 4000,
          icon: '🔒'
        });
      } catch (error) {
        console.error('Failed to change password:', error);
        
        // Handle specific error messages
        if (error.message.includes('Old password is incorrect') || 
            error.message.includes('incorrect')) {
          setErrors({
            currentPassword: 'Mật khẩu hiện tại không đúng'
          });
          toast.error('Mật khẩu hiện tại không đúng!');
        } else {
          toast.error(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!');
        }
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Đổi mật khẩu</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
        <PasswordField
          label="Mật khẩu cũ"
          name="currentPassword"
          value={formData.currentPassword}
          placeholder="Nhập mật khẩu hiện tại"
          showField={showPasswords.current}
          error={errors.currentPassword}
          onChange={handleInputChange}
          onToggleVisibility={() => togglePasswordVisibility('current')}
        />

        <PasswordField
          label="Mật khẩu mới"
          name="newPassword"
          value={formData.newPassword}
          placeholder="Nhập mật khẩu mới"
          showField={showPasswords.new}
          error={errors.newPassword}
          onChange={handleInputChange}
          onToggleVisibility={() => togglePasswordVisibility('new')}
        />

        <PasswordField
          label="Nhập lại mật khẩu mới"
          name="confirmPassword"
          value={formData.confirmPassword}
          placeholder="Xác nhận mật khẩu mới"
          showField={showPasswords.confirm}
          error={errors.confirmPassword}
          onChange={handleInputChange}
          onToggleVisibility={() => togglePasswordVisibility('confirm')}
        />

        <div className="pt-6 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingOutlined style={{ fontSize: '18px', marginRight: '8px' }} spin />
                Đang xử lý...
              </>
            ) : (
              <>
                <LockOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
                Xác nhận
              </>
            )}
          </button>
        </div>
      </form>

      {/* Password requirements */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg w-full max-w-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">Yêu cầu mật khẩu:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Ít nhất 6 ký tự</li>
          <li>• Khác với mật khẩu hiện tại</li>
          <li>• Nên bao gồm chữ hoa, chữ thường và số</li>
          <li>• Tránh sử dụng thông tin cá nhân dễ đoán</li>
        </ul>
      </div>
    </div>
  );
}