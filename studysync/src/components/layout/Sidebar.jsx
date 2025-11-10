import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Search, 
  Users, 
  Calendar, 
  Bot,
  User,
  Settings,
  Home,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UploadOutlined } from '@ant-design/icons';


export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = [
    {
      title: 'Chính',
      items: [
        {
          icon: Home,
          label: 'Trang chủ',
          path: '/home',
          description: 'Trang chủ chính'
        },
        {
          icon: Search,
          label: 'Khám phá nhóm',
          path: '/groups',
          description: 'Tìm nhóm học tập'
        },
        {
          icon: Users,
          label: 'Nhóm của tôi',
          path: '/my-groups',
          description: 'Quản lý nhóm'
        }
      ]
    },
    {
      title: 'Công cụ học tập',
      items: [
        {
          icon: Calendar,
          label: 'Thời khóa biểu',
          path: '/schedule',
          description: 'Lịch học & sự kiện'
        },
        {
          icon: Target,
          label: 'Phân chia Task',
          path: '/task-distribution',
          description: 'Quản lý công việc'
        },
        {
          icon: Bot,
          label: 'AI Trợ lý',
          path: '/chatbot',
          description: 'Trợ lý thông minh'
        },
        {
      icon: UploadOutlined, // 🆕 icon tải file
      label: 'Tải tệp lên',
      path: '/files', // 🆕 trỏ tới trang upload của bạn
      description: 'Quản lý & tải tệp học tập'
    }
      ]
    },
    {
      title: 'Cá nhân',
      items: [
        {
          icon: Crown,
          label: 'Gói dịch vụ',
          path: '/subscriptions',
          description: 'Nâng cấp tài khoản'
        },
        {
          icon: User,
          label: 'Hồ sơ',
          path: '/profile',
          description: 'Thông tin cá nhân'
        }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 flex flex-col overflow-x-hidden"
      style={{
        boxShadow: '2px 0 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-x-hidden">
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
             
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-purple-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-purple-400" />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 mb-2"
              >
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'hover:bg-slate-700/70 text-slate-300'
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
                        flex-shrink-0 ${active ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Label & Description */}
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
                                ${active ? 'text-white' : 'text-slate-200'}
                              `}>
                                {item.label}
                              </p>
                              <p className={`
                                text-xs truncate
                                ${active ? 'text-white/80' : 'text-slate-400'}
                              `}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg
                                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                                      whitespace-nowrap z-50 shadow-xl">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-slate-300">{item.description}</div>
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
    </motion.div>
  );
}