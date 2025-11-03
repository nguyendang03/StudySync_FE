import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Star,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = [
    {
      title: 'Chính',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Bảng điều khiển',
          path: '/admin/dashboard',
          description: 'Tổng quan & Phân tích'
        },
        {
          icon: Home,
          label: 'Về trang chủ',
          path: '/',
          description: 'Ứng dụng chính'
        }
      ]
    },
    {
      title: 'Người dùng & Nội dung',
      items: [
        {
          icon: Users,
          label: 'Tất cả người dùng',
          path: '/admin/users',
          description: 'Quản lý người dùng'
        },
        {
          icon: Star,
          label: 'Đánh giá',
          path: '/admin/reviews',
          description: 'Kiểm duyệt đánh giá'
        }
      ]
    },
    {
      title: 'Thương mại',
      items: [
        {
          icon: CreditCard,
          label: 'Thanh toán',
          path: '/admin/payments',
          description: 'Lịch sử & hoàn tiền'
        },
        {
          icon: Calendar,
          label: 'Gói subscription',
          path: '/admin/subscriptions',
          description: 'Gói & quyền lợi'
        }
      ]
    },
    // Only MVP sections kept; unused tabs removed
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return 'A';
    const name = user.username.split(' ');
    if (name.length >= 2) {
      return (name[0][0] + name[name.length - 1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-gradient-to-b from-purple-50 to-blue-50 border-r border-gray-200 flex flex-col"
      style={{
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Quản trị viên
              </h1>
              <p className="text-xs text-gray-500 mt-1">Quản lý StudySync</p>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-purple-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-purple-600" />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 mb-2"
              >
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </motion.div>
            )}
            
            <div className="space-y-1 px-3">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={itemIndex} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                        transition-all duration-200 group
                        ${active 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                          : 'hover:bg-white/70 text-gray-700'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 ${active ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Label & Badge */}
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`
                                text-sm font-medium truncate
                                ${active ? 'text-white' : 'text-gray-900'}
                              `}>
                                {item.label}
                              </p>
                              <p className={`
                                text-xs truncate
                                ${active ? 'text-white/80' : 'text-gray-500'}
                              `}>
                                {item.description}
                              </p>
                            </div>
                            
                            {item.badge && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`
                                  ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                                  ${active 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-purple-100 text-purple-600'
                                  }
                                `}
                              >
                                {item.badge}
                              </motion.span>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                                      whitespace-nowrap z-50 shadow-xl">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-300">{item.description}</div>
                          {item.badge && (
                            <div className="text-xs text-purple-300 mt-1">({item.badge})</div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {/* Admin Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 
                            flex items-center justify-center text-white font-semibold shadow-lg">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username || 'Quản trị viên'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@studysync.com'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 
                       bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl
                       hover:shadow-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 
                     text-white hover:shadow-lg transition-all duration-200 group relative"
          >
            <LogOut className="w-5 h-5 mx-auto" />
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
                          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                          whitespace-nowrap z-50 shadow-xl">
              Đăng xuất
            </div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
