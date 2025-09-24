import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User, 
  Target 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { icon: Home, text: 'Trang chủ', path: '/home' },
    { icon: Users, text: 'Khám phá nhóm', path: '/groups' },
    { icon: Users, text: 'Nhóm của tôi', path: '/my-groups' },
    { icon: Calendar, text: 'Lịch trình', path: '/schedule' },
    { icon: Target, text: 'Phân chia Task', path: '/task-distribution' },
    { icon: MessageSquare, text: 'Giải Đáp Thắc Mắc', path: '/chatbot' },
    { icon: User, text: 'Hồ sơ cá nhân', path: '/profile' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 min-h-screen p-6"
    >
      <div className="space-y-3">
        {navigationItems.map((item, index) => (
          <motion.button
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-white/20 text-white shadow-lg border border-white/30'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
