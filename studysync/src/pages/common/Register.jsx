import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for backend (backend expects username, email, password)
      const registerData = {
        username: formData.username, // Using username as username
        email: formData.email,
        password: formData.password
      };

      await register(registerData);
      
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error types
      if (err.message.includes('email')) {
        setError('Email này đã được sử dụng');
      } else if (err.message.includes('username')) {
        setError('Tên người dùng này đã được sử dụng');
      } else {
        setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Full Name Input */}
          <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <InputField
              label="Họ và tên"
              id="username"
              placeholder="Nhập họ và tên của bạn"
              value={formData.username}
              onChange={handleInputChange}
              required
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
              required
            />
          </div>

          {/* Password Input */}
          <div className={`transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <PasswordInput
              label="Mật khẩu"
              id="password"
              placeholder="Nhập mật khẩu của bạn (ít nhất 6 ký tự)"
              value={formData.password}
              onChange={handleInputChange}
              required
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
              required
            />
          </div>

          {/* Register Button */}
          <div className={`transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
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
