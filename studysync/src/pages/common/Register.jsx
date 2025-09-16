import React, { useState, useEffect } from 'react';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import AuthToggle from '../../components/AuthToggle';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import AuthButton from '../../components/AuthButton';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add register logic here
    console.log('Register submitted:', formData);
  };

  return (
    <AuthLayout>
      <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <AuthHeader />
      </div>
      
      <FormContainer>
        <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <AuthToggle activeTab="register" />
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Full Name Input */}
          <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <InputField
              label="Họ và tên"
              id="fullName"
              placeholder="Nhập họ và tên của bạn"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          {/* Email Input */}
          <div className={`transition-all duration-500 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <InputField
              label="Email"
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {/* Password Input */}
          <div className={`transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <PasswordInput
              label="Mật khẩu"
              id="password"
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {/* Confirm Password Input */}
          <div className={`transition-all duration-500 delay-900 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <PasswordInput
              label="Xác nhận mật khẩu"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu của bạn"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          {/* Register Button */}
          <div className={`transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AuthButton type="submit">
              Đăng ký
            </AuthButton>
          </div>
        </form>

        {/* Login Link */}
        <div className={`text-center mt-8 transition-all duration-500 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-white/80">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105 inline-block">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </FormContainer>
    </AuthLayout>
  );
}
