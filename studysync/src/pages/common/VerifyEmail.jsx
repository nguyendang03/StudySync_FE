import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import AuthButton from '../../components/AuthButton';

export default function VerifyEmail() {
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [resendEmail, setResendEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from register page)
  useEffect(() => {
    setIsLoaded(true);
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setFormData(prev => ({ ...prev, email: emailFromState }));
    }
  }, [location.state]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!formData.otp.trim()) {
      setError('Vui lòng nhập mã OTP');
      return false;
    }
    if (formData.otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
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
      await verifyEmail({
        email: formData.email,
        otp: formData.otp
      });
      
      setSuccess('Xác thực email thành công! Đang chuyển hướng...');
      toast.success('Xác thực email thành công!');
      
      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email đã được xác thực. Vui lòng đăng nhập.',
            email: formData.email 
          } 
        });
      }, 2000);

    } catch (err) {
      console.error('Email verification error:', err);
      
      if (err.message.includes('expired')) {
        setError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
      } else if (err.message.includes('invalid')) {
        setError('Mã OTP không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        setError(err.message || 'Xác thực thất bại. Vui lòng thử lại.');
      }
      toast.error(err.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email trước khi yêu cầu mã mới');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await resendOTP({ email: formData.email });
      toast.success('Mã OTP mới đã được gửi đến email của bạn');
      setCountdown(60); // 60 seconds countdown
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
      toast.error(err.message || 'Gửi lại mã OTP thất bại');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendWithDifferentEmail = async () => {
    if (!resendEmail.trim()) {
      setError('Vui lòng nhập email để gửi lại mã OTP');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resendEmail)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await resendOTP({ email: resendEmail });
      toast.success(`Mã OTP mới đã được gửi đến ${resendEmail}`);
      
      // Update the main email field with the new email
      setFormData(prev => ({ ...prev, email: resendEmail }));
      setShowResendForm(false);
      setResendEmail('');
      setCountdown(60); // 60 seconds countdown
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
      toast.error(err.message || 'Gửi lại mã OTP thất bại');
    } finally {
      setResendLoading(false);
    }
  };

  const toggleResendForm = () => {
    setShowResendForm(!showResendForm);
    setResendEmail('');
    setError('');
  };

  return (
    <AuthLayout>
      <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <AuthHeader />
      </div>
      
      <FormContainer>
        <div className={`text-center mb-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-bold text-white mb-2">Xác thực Email</h2>
          <p className="text-white/80">
            Chúng tôi đã gửi mã OTP 6 chữ số đến email của bạn. 
            Vui lòng nhập mã để xác thực tài khoản.
          </p>
          {formData.email && (
            <div className="mt-3 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 inline-block">
              <p className="text-sm text-white/90">
                📧 <span className="font-medium">{formData.email}</span>
              </p>
            </div>
          )}
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
          {/* Email Input */}
          <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
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

          {/* OTP Input */}
          <div className={`transition-all duration-500 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <InputField
              label="Mã OTP"
              type="text"
              id="otp"
              placeholder="Nhập mã OTP 6 chữ số"
              value={formData.otp}
              onChange={handleInputChange}
              maxLength={6}
              required
            />
          </div>

          {/* Verify Button */}
          <div className={`transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực Email'}
            </AuthButton>
          </div>
        </form>

        {/* Resend OTP */}
        <div className={`text-center mt-6 transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-white/80 mb-3">
            Không nhận được mã?
          </p>
          
          {/* Current Email Resend */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading || countdown > 0}
              className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 block mx-auto"
            >
              {resendLoading ? 'Đang gửi...' : countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
            </button>
            
            {/* Toggle Different Email Form */}
            <button
              type="button"
              onClick={toggleResendForm}
              disabled={resendLoading}
              className="text-sm text-white/60 hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showResendForm ? 'Ẩn form' : 'Gửi đến email khác'}
            </button>
          </div>

          {/* Resend to Different Email Form */}
          {showResendForm && (
            <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="space-y-4">
                <div>
                  <label htmlFor="resendEmail" className="block text-sm font-medium text-white mb-2">
                    Email để nhận mã OTP mới
                  </label>
                  <input
                    type="email"
                    id="resendEmail"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Nhập email khác để nhận mã OTP"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                    disabled={resendLoading}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleResendWithDifferentEmail}
                    disabled={resendLoading || !resendEmail.trim()}
                    className="flex-1 py-2 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {resendLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={toggleResendForm}
                    disabled={resendLoading}
                    className="px-4 py-2 text-white/60 hover:text-white/80 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        <div className={`text-center mt-8 transition-all duration-500 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/login" className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-all duration-200 hover:scale-105 inline-block">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </FormContainer>
    </AuthLayout>
  );
}