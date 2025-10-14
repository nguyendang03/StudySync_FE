import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1/auth',
});

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin!', { autoClose: 3000 });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const payload = { email, otp, newPassword };
      const res = await api.post('/reset-password', payload);
      toast.success(res.data.message || 'Đặt lại mật khẩu thành công!', { autoClose: 2000 });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!', { autoClose: 3000 });
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
            <h2 className="text-2xl font-bold text-white mb-4">Đặt lại mật khẩu</h2>
            <p className="text-white/80 text-lg">
              Nhập mã OTP bạn nhận được và tạo mật khẩu mới
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
              readOnly={!!location.state?.email}
            />

            <InputField
              label="Mã OTP"
              type="text"
              id="otp"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <InputField
              label="Mật khẩu mới"
              type="password"
              id="newPassword"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <AuthButton type="submit" disabled={loading}>
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
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
