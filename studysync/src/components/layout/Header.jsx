import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Menu, Avatar, Badge, Divider } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  DownOutlined,
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Users, Bot, HelpCircle, Info, Phone, Settings, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Features dropdown menu items
  const featuresMenu = {
    items: [
      {
        key: 'my-groups',
        icon: <TeamOutlined className="text-purple-600" />,
        label: (
          <Link to="/my-groups" className="flex items-center gap-3 py-1">
            <span>Nhóm của tôi</span>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">4</span>
          </Link>
        ),
      },
      {
        key: 'chatbot',
        icon: <MessageOutlined className="text-blue-600" />,
        label: (
          <Link to="/chatbot" className="flex items-center gap-3 py-1">
            <span>AI Trợ lý</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">New</span>
          </Link>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'groups',
        icon: <SearchOutlined className="text-green-600" />,
        label: <Link to="/groups">Khám phá nhóm</Link>,
      },
    ],
  };

  // Support dropdown menu items
  const supportMenu = {
    items: [
      {
        key: 'faq',
        icon: <QuestionCircleOutlined className="text-orange-600" />,
        label: <Link to="/faq">Câu hỏi thường gặp</Link>,
      },
      {
        key: 'contact',
        icon: <PhoneOutlined className="text-green-600" />,
        label: <a href="#contact">Liên hệ hỗ trợ</a>,
      },
      {
        key: 'about',
        icon: <InfoCircleOutlined className="text-blue-600" />,
        label: <a href="#about">Về StudySync</a>,
      },
    ],
  };

  // User menu for authenticated users
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Hồ sơ cá nhân</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link to="/settings">Cài đặt</Link>,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined className="text-red-500" />,
        label: <span className="text-red-500">Đăng xuất</span>,
      },
    ],
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img 
              src="/authLogo.png" 
              alt="StudySync Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StudySync
            </span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <HomeOutlined className="text-lg" />
              Trang chủ
            </Link>
            
            {/* Features Dropdown with Ant Design */}
            <Dropdown 
              menu={featuresMenu}
              trigger={['hover', 'click']}
              placement="bottomLeft"
              arrow
              overlayClassName="custom-dropdown"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <AppstoreOutlined className="text-lg" />
                Tính năng
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </Dropdown>
            
            {/* Support Dropdown */}
            <Dropdown 
              menu={supportMenu}
              trigger={['hover', 'click']}
              placement="bottomLeft"
              arrow
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <QuestionCircleOutlined className="text-lg" />
                Hỗ trợ
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </Dropdown>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge count={notifications} size="small">
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                  <BellOutlined className="text-xl" />
                </button>
              </Badge>
            </motion.div>

            {/* User Menu - Show if authenticated, otherwise show auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* For demonstration, showing auth buttons. Replace with user menu when authenticated */}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Đăng nhập
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Đăng ký
                </Link>
              </motion.div>
              
              {/* Uncomment when user is authenticated */}
              {/* <Dropdown 
                menu={userMenu}
                trigger={['click']}
                placement="bottomRight"
                arrow
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <Avatar 
                    size={36}
                    icon={<UserOutlined />}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.button>
              </Dropdown> */}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                <MenuOutlined className="text-xl" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeOutlined />
                  Trang chủ
                </Link>
                <Link 
                  to="/my-groups" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TeamOutlined />
                  Nhóm của tôi
                </Link>
                <Link 
                  to="/chatbot" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageOutlined />
                  AI Trợ lý
                </Link>
                <Link 
                  to="/faq" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <QuestionCircleOutlined />
                  Hỗ trợ
                </Link>
                <Divider className="my-4" />
                <div className="px-4 space-y-3">
                  <Link 
                    to="/login" 
                    className="block w-full text-center text-purple-600 hover:text-purple-700 border border-purple-600 hover:border-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}