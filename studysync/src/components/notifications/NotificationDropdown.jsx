import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Tabs, Empty, Spin, Button, Dropdown } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  TeamOutlined,
  MessageOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  CrownOutlined,
  EditOutlined,
  MailOutlined,
} from '@ant-design/icons';
import notificationService from '../../services/notificationService';
import useNotificationStore from '../../stores/notificationStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Get state and actions from store
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      const params = { limit: 20 };
      
      switch (activeTab) {
        case 'unread':
          params.isRead = false;
          response = await notificationService.getNotifications(params);
          break;
        case 'chat':
          response = await notificationService.getChatNotifications(params);
          break;
        case 'system':
          response = await notificationService.getSystemNotifications(params);
          break;
        default:
          response = await notificationService.getNotifications(params);
      }
      
      setLocalNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead([notificationId]);
      setLocalNotifications(localNotifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      fetchUnreadCount();
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setLocalNotifications(localNotifications.map(n => ({ ...n, isRead: true })));
      fetchUnreadCount();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setLocalNotifications(localNotifications.filter(n => n.id !== notificationId));
      fetchUnreadCount();
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.relatedType === 'group' && notification.relatedId) {
      navigate(`/groups/${notification.relatedId}`);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconConfig = {
      'invite_received': { icon: UserAddOutlined, color: 'text-blue-600', bg: 'bg-blue-50' },
      'join_request': { icon: MailOutlined, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      'member_joined': { icon: TeamOutlined, color: 'text-green-600', bg: 'bg-green-50' },
      'member_left': { icon: UserDeleteOutlined, color: 'text-orange-600', bg: 'bg-orange-50' },
      'member_removed': { icon: UserDeleteOutlined, color: 'text-red-600', bg: 'bg-red-50' },
      'group_updated': { icon: EditOutlined, color: 'text-amber-600', bg: 'bg-amber-50' },
      'leadership_transferred': { icon: CrownOutlined, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      'leadership_received': { icon: CrownOutlined, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      'leadership_changed': { icon: CrownOutlined, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      'new_message': { icon: MessageOutlined, color: 'text-purple-600', bg: 'bg-purple-50' },
      'message_reply': { icon: MessageOutlined, color: 'text-purple-600', bg: 'bg-purple-50' },
    };

    const config = iconConfig[type] || { icon: BellOutlined, color: 'text-gray-600', bg: 'bg-gray-50' };
    const IconComponent = config.icon;

    return (
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
        <IconComponent className={`text-lg ${config.color}`} />
      </div>
    );
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return notifDate.toLocaleDateString('vi-VN');
  };

  const tabItems = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'chat', label: 'Tin nhắn' },
    { key: 'system', label: 'Hệ thống' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Badge 
          count={unreadCount} 
          size="small" 
          offset={[-2, 2]}
          className="notification-badge"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              isOpen 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/70'
            }`}
          >
            <BellOutlined className="text-[20px]" />
          </button>
        </Badge>
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[420px] bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden z-50"
            style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckOutlined className="mr-1" />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-3 pt-2">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="small"
                className="notification-tabs"
              />
            </div>

            {/* Notifications List */}
            <div className="max-h-[450px] overflow-y-auto notification-list">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spin size="large" />
                </div>
              ) : localNotifications.length === 0 ? (
                <Empty
                  description={
                    <span className="text-gray-500 text-sm">
                      {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-12"
                />
              ) : (
                <div>
                  {localNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`relative px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-all duration-150 cursor-pointer group ${
                        !notification.isRead 
                          ? 'bg-purple-50/40 hover:bg-purple-50/60' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread indicator dot */}
                      {!notification.isRead && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}

                      <div className="flex items-start gap-3.5 ml-1">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug ${
                              !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {notification.content}
                          </p>
                        </div>

                        {/* Actions - Show on hover */}
                        <Dropdown
                          menu={{
                            items: [
                              ...(!notification.isRead ? [{
                                key: 'mark-read',
                                label: 'Đánh dấu đã đọc',
                                icon: <CheckOutlined />,
                                onClick: (e) => {
                                  e.domEvent.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                },
                              }] : []),
                              {
                                key: 'delete',
                                label: 'Xóa',
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: (e) => {
                                  e.domEvent.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                },
                              },
                            ],
                          }}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <button
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreOutlined />
                          </button>
                        </Dropdown>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {localNotifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <button
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page if you have one
                    // navigate('/notifications');
                  }}
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;

