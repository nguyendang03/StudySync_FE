import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/layout/Layout';
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import VerifyEmail from './pages/common/VerifyEmail';
import ForgotPassword from './pages/common/ForgotPassword';
import Profile from './pages/profile/Profile';
import GroupDiscovery from './pages/groups/GroupDiscovery';
import GroupDetail from './pages/groups/GroupDetail';
import MyGroups from './pages/groups/MyGroups';
import GiaiDapThacMac from './pages/common/GiaiDapThacMac';
import ChatBot from './pages/common/ChatBot';
import Schedule from './pages/common/Schedule';
import TaskDistribution from './pages/groups/TaskDistribution';
import AgoraDebugTest from './pages/common/AgoraDebugTest';
import VideoCall from './pages/common/VideoCall';
import JoinCall from './pages/common/JoinCall';
import ResetPassword from './pages/common/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes - Only accessible when not authenticated */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            
            {/* Public Routes - Anyone can access these */}
            <Route path="/groups" element={<Layout><GroupDiscovery /></Layout>} />
            <Route path="/groups/:id" element={<Layout><GroupDetail /></Layout>} />
            <Route path="/faq" element={<Layout><GiaiDapThacMac /></Layout>} />
            <Route path="/giai-dap-thac-mac" element={<Layout><GiaiDapThacMac /></Layout>} />
            <Route path="/home" element={<Layout><Home /></Layout>} />
            <Route path="/agora-debug" element={<Layout><AgoraDebugTest /></Layout>} />
            
            {/* Protected Routes - Only authenticated users */}
            <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/my-groups" element={<ProtectedRoute><Layout><MyGroups /></Layout></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Layout><ChatBot /></Layout></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Layout><Schedule /></Layout></ProtectedRoute>} />
            <Route path="/task-distribution" element={<ProtectedRoute><Layout><TaskDistribution /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><div>Settings Page - Coming Soon</div></Layout></ProtectedRoute>} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
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
