import React, { useState } from 'react';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import AuthToggle from '../../components/AuthToggle';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import AuthButton from '../../components/AuthButton';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
      <AuthHeader />
      
      <FormContainer>
        <AuthToggle activeTab="register" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <InputField
            label="Họ và tên"
            id="fullName"
            placeholder="Nhập họ và tên của bạn"
            value={formData.fullName}
            onChange={handleInputChange}
          />

          {/* Email Input */}
          <InputField
            label="Email"
            type="email"
            id="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
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

          {/* Confirm Password Input */}
          <PasswordInput
            label="Xác nhận mật khẩu"
            id="confirmPassword"
            placeholder="Nhập lại mật khẩu của bạn"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />

          {/* Register Button */}
          <AuthButton type="submit">
            Đăng ký
          </AuthButton>
        </form>
      </FormContainer>
    </AuthLayout>
  );
}
