import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import AuthButton from '../../components/AuthButton';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Axios instance - using relative path to work with Vite proxy
const api = axios.create({
  baseURL: '/api/v1/auth',
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập email!', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/forgot-password', { email });
      toast.success(response.data.message || 'OTP đã được gửi đến email! 📧', { autoClose: 3000 });
      console.log(`OTP request sent for ${email}`);

      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1200);
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <AuthLayout>
        <AuthHeader />
        <FormContainer>
          <ToastContainer />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quên mật khẩu?</h2>
            <p className="text-white/80 text-lg">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email"
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </AuthButton>

            <div className="text-center pt-4">
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-white/80 underline underline-offset-2 transition-colors"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </FormContainer>
      </AuthLayout>
      <Footer />
    </>
  );
}
