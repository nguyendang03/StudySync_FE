import React, { useState, useEffect } from 'react';
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
    // TODO: Add login logic here
    console.log('Login submitted:', formData, { rememberMe });
  };

  return (
    <AuthLayout>
      <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <AuthHeader />
      </div>
      
      <FormContainer>
        <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <AuthToggle activeTab="login" />
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Username Input */}
          <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <InputField
              label="Tên người dùng"
              id="username"
              placeholder="Nhập tên người dùng của bạn"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>

          {/* Password Input */}
          <div className={`transition-all duration-500 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <PasswordInput
              label="Mật khẩu"
              id="password"
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {/* Remember Me and Forgot Password */}
          <div className={`flex items-center justify-between pt-2 transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <label className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 text-purple-600 bg-white/20 border-2 border-white/40 rounded-md focus:ring-white/50 focus:ring-2 accent-white"
              />
              <span className="ml-3 text-sm font-medium text-white">Lưu nhật</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-white hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <div className={`transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AuthButton type="submit">
              Đăng nhập
            </AuthButton>
          </div>
        </form>

        {/* Register Link */}
        <div className={`text-center mt-8 transition-all duration-500 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-white/80">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105 inline-block">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </FormContainer>
    </AuthLayout>
  );
}
