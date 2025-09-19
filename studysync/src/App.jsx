import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import ForgotPassword from './pages/common/ForgotPassword';
import Profile from './pages/profile/Profile';
import GroupDiscovery from './pages/groups/GroupDiscovery';
import GroupDetail from './pages/groups/GroupDetail';
import GiaiDapThacMac from './pages/common/GiaiDapThacMac';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups" element={<GroupDiscovery />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/faq" element={<GiaiDapThacMac />} />
          <Route path="/giai-dap-thac-mac" element={<GiaiDapThacMac />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
