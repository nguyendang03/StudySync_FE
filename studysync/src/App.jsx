import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import ForgotPassword from './pages/common/ForgotPassword';
import Profile from './pages/profile/Profile';
import GroupDiscovery from './pages/groups/GroupDiscovery';
import GroupDetail from './pages/groups/GroupDetail';
import MyGroups from './pages/groups/MyGroups';
import GiaiDapThacMac from './pages/common/GiaiDapThacMac';
import ChatBot from './pages/common/ChatBot';
import Schedule from './pages/common/Schedule';
import TaskDistribution from './pages/groups/TaskDistribution';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/groups" element={<GroupDiscovery />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/my-groups" element={<MyGroups />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/task-distribution" element={<TaskDistribution />} />
            <Route path="/faq" element={<GiaiDapThacMac />} />
            <Route path="/giai-dap-thac-mac" element={<GiaiDapThacMac />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
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
  );
}

export default App;
