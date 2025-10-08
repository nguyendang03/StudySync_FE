import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all page components
const Home = lazy(() => import('./pages/common/Home'));
const Login = lazy(() => import('./pages/common/Login'));
const Register = lazy(() => import('./pages/common/Register'));
const VerifyEmail = lazy(() => import('./pages/common/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/common/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/common/ResetPassword'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const GroupDiscovery = lazy(() => import('./pages/groups/GroupDiscovery'));
const GroupDetail = lazy(() => import('./pages/groups/GroupDetail'));
const MyGroups = lazy(() => import('./pages/groups/MyGroups'));
const GiaiDapThacMac = lazy(() => import('./pages/common/GiaiDapThacMac'));
const ChatBot = lazy(() => import('./pages/common/ChatBot'));
const Schedule = lazy(() => import('./pages/common/Schedule'));
const TaskDistribution = lazy(() => import('./pages/groups/TaskDistribution'));
const AgoraDebugTest = lazy(() => import('./pages/common/AgoraDebugTest'));
const VideoCall = lazy(() => import('./pages/common/VideoCall'));
const JoinCall = lazy(() => import('./pages/common/JoinCall'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang khởi tạo ứng dụng..." />}>
            <Routes>
              {/* Public Routes - Only accessible when not authenticated */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tải trang đăng nhập..." />}>
                      <Login />
                    </Suspense>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tải trang đăng ký..." />}>
                      <Register />
                    </Suspense>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/verify-email" 
                element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tải xác thực email..." />}>
                      <VerifyEmail />
                    </Suspense>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tải quên mật khẩu..." />}>
                      <ForgotPassword />
                    </Suspense>
                  </PublicRoute>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tải đặt lại mật khẩu..." />}>
                    <ResetPassword />
                  </Suspense>
                } 
              />

              {/* Public Routes - Anyone can access these */}
              <Route 
                path="/groups" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải danh sách nhóm..." />}>
                      <GroupDiscovery />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/groups/:id" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải thông tin nhóm..." />}>
                      <GroupDetail />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/faq" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải câu hỏi thường gặp..." />}>
                      <GiaiDapThacMac />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/giai-dap-thac-mac" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải câu hỏi thường gặp..." />}>
                      <GiaiDapThacMac />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/home" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang chủ..." />}>
                      <Home />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/agora-debug" 
                element={
                  <Layout>
                    <Suspense fallback={<LoadingSpinner size="large" message="Đang tải debug..." />}>
                      <AgoraDebugTest />
                    </Suspense>
                  </Layout>
                } 
              />
              <Route 
                path="/join-call/:callId" 
                element={
                  <Suspense fallback={<LoadingSpinner size="large" fullScreen={true} message="Đang tham gia cuộc gọi..." />}>
                    <JoinCall />
                  </Suspense>
                } 
              />
              
              {/* Protected Routes - Only authenticated users */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang chủ..." />}>
                        <Home />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải hồ sơ..." />}>
                        <Profile />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-groups" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải nhóm của bạn..." />}>
                        <MyGroups />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chatbot" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải chatbot..." />}>
                        <ChatBot />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/schedule" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải lịch học..." />}>
                        <Schedule />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/task-distribution" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải phân công nhiệm vụ..." />}>
                        <TaskDistribution />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải cài đặt..." />}>
                        <div>Settings Page - Coming Soon</div>
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/video-call" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner size="large" message="Đang tải cuộc gọi video..." />}>
                        <VideoCall />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
          
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
