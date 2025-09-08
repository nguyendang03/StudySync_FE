import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import AuthToggle from '../../components/AuthToggle';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import AuthButton from '../../components/AuthButton';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add login logic here
    console.log('Login submitted:', formData, { rememberMe });
  };

  return (
    <AuthLayout>
      <AuthHeader />
      
      <FormContainer>
        <AuthToggle activeTab="login" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <InputField
            label="Tên người dùng"
            id="username"
            placeholder="Nhập tên người dùng của bạn"
            value={formData.username}
            onChange={handleInputChange}
          />

          {/* Password Input */}
          <PasswordInput
            label="Mật khẩu"
            id="password"
            placeholder="Nhập mật khẩu của bạn"
            value={formData.password}
            onChange={handleInputChange}
          />

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-purple-600 bg-white/20 border-2 border-white/40 rounded-md focus:ring-white/50 focus:ring-2 accent-white"
              />
              <span className="ml-3 text-sm font-medium text-white">Lưu nhật</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-white hover:text-white/80 underline underline-offset-2 transition-colors">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <AuthButton type="submit">
            Đăng nhập
          </AuthButton>
        </form>
      </FormContainer>
    </AuthLayout>
  );
}
