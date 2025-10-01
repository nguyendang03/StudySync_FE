import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthLayout from '../../components/AuthLayout';
import AuthHeader from '../../components/AuthHeader';
import FormContainer from '../../components/FormContainer';
import InputField from '../../components/InputField';
import AuthButton from '../../components/AuthButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add forgot password logic here
    console.log('Forgot password submitted:', { email });
  };

  return (
    <>
      <Header />
      <AuthLayout>
        <AuthHeader />
      
      <FormContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quên mật khẩu?</h2>
          <p className="text-white/80 text-lg">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <InputField
            label="Email"
            type="email"
            id="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Submit Button */}
          <AuthButton type="submit">
            Gửi liên kết đặt lại
          </AuthButton>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <Link to="/login" className="text-sm font-medium text-white hover:text-white/80 underline underline-offset-2 transition-colors">
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
