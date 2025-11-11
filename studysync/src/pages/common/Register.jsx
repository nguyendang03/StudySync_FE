import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
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
      const errorMsg = 'Vui lòng nhập họ và tên';
      setError(errorMsg);
      return false;
    }
    if (!formData.email.trim()) {
      const errorMsg = 'Vui lòng nhập email';
      setError(errorMsg);
      return false;
    }
    if (!formData.password) {
      const errorMsg = 'Vui lòng nhập mật khẩu';
      setError(errorMsg);
      return false;
    }
    if (formData.password.length < 6) {
      const errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự';
      setError(errorMsg);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Mật khẩu xác nhận không khớp';
      setError(errorMsg);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Prepare data for backend (backend expects username, email, password)
      const registerData = {
        username: formData.username, // Using username as username
        email: formData.email,
        password: formData.password
      };

      await register(registerData);
      
      // Always navigate to verify-email after successful registration
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản 📧');
      
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          message: 'Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.'
        } 
      });

    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error types
      let errorMessage;
      if (err.message.includes('email')) {
        errorMessage = 'Email này đã được sử dụng';
      } else if (err.message.includes('username')) {
        errorMessage = 'Tên người dùng này đã được sử dụng';
      } else {
        errorMessage = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
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
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng ký...
                </div>
              ) : (
                'Đăng ký'
              )}
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
      <Footer />
    </>
  );
}
