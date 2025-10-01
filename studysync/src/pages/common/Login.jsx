import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoaded(true);
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic form validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe
      });
      
      toast.success('Đăng nhập thành công!');
      
      // Redirect to the page user was trying to access, or home if none
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errorMessage);
      toast.error(errorMessage);
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
          <AuthToggle activeTab="login" />
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Email Input */}
          <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
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
            <AuthButton type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
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
      <Footer />
    </>
  );
}
