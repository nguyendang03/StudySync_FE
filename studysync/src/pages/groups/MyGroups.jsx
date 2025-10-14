import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined, 
  UserOutlined, 
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  MessageOutlined,
  SettingOutlined,
  EyeOutlined,
  TrophyOutlined,
  MenuOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  HeartFilled,
  StarFilled
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Tag, Progress, Avatar, Tooltip, Button, Dropdown, Spin } from 'antd';
import toast from 'react-hot-toast';
import { Users, Award, BookOpen, Activity } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { VideoCallButton } from '../../components/videocall';
import groupService from '../../services/groupService';
import { useAuth } from '../../hooks/useAuth';

export default function MyGroups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedsubject, setSelectedsubject] = useState('all');  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set([1, 3]));
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
    if (isAuthenticated) {
      fetchMyGroups();
    }
  }, [isAuthenticated]);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching groups for authenticated user...');
      
      const response = await groupService.getMyGroups();
      console.log('📝 Groups API response:', response);
      
      // Transform backend data to match frontend structure
      const groupsData = response?.data || response || [];
      const transformedGroups = Array.isArray(groupsData) ? groupsData.map((group, index) => ({
        id: group.id || index + 1,
        name: group.groupName || group.name || 'Nhóm không tên',
        description: group.description || 'Không có mô tả',
        members: group.memberCount || group.members || 0,
        subject: group.subject || 'Chưa xác định',
        progress: Math.floor(Math.random() * 100), // Mock progress for now
        isActive: true,
        avatar: (group.groupName || group.name || 'GR').substring(0, 2).toUpperCase(),
        bgColor: getRandomGradient(),
        lastActivity: formatLastActivity(group.updatedAt || group.createdAt),
        rating: 4.5 + Math.random() * 0.5,
        tags: ['Học tập', 'Nhóm']
      })) : [];

      setMyGroups(transformedGroups);
      
      if (transformedGroups.length > 0) {
        toast.success(`✅ Đã tải ${transformedGroups.length} nhóm của bạn`);
      } else {
        toast('Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới!', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      
      // Show specific error messages
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        toast.error('🔌 Không thể kết nối đến server. Vui lòng kiểm tra backend.');
      } else if (error.message?.includes('Authentication required') || error.message?.includes('Session expired')) {
        toast.error('🔑 Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      } else {
        toast.error(`❌ Lỗi tải nhóm: ${error.message}`);
      }
      
      // Fallback to empty array on error
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getRandomGradient = () => {
    const gradients = [
      "from-yellow-400 to-orange-500",
      "from-blue-400 to-purple-500", 
      "from-pink-400 to-red-500",
      "from-green-400 to-blue-500",
      "from-purple-400 to-pink-500",
      "from-indigo-400 to-blue-500"
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Chưa có hoạt động';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Không xác định';
    }
  };



  const categories = [
    { id: 'all', name: 'Tất cả nhóm', count: myGroups.length },
    { id: 'active', name: 'Đang hoạt động', count: myGroups.filter(g => g.isActive).length },
    { id: 'programming', name: 'Lập trình', count: myGroups.filter(g => g.subject === 'Lập trình').length },
    { id: 'design', name: 'Thiết kế', count: myGroups.filter(g => g.subject === 'Thiết kế').length },
    { id: 'data', name: 'Khoa học dữ liệu', count: myGroups.filter(g => g.subject === 'Khoa học dữ liệu').length }
  ];

  // Utility functions
  const toggleFavorite = (groupId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(groupId)) {
      newFavorites.delete(groupId);
      toast.success('Đã xóa khỏi yêu thích');
    } else {
      newFavorites.add(groupId);
      toast.success('Đã thêm vào yêu thích');
    }
    setFavorites(newFavorites);
  };

  const handleCreateGroup = () => {
    toast.success('Chức năng tạo nhóm đang được phát triển!');
  };

  const handleRefreshGroups = () => {
    if (isAuthenticated) {
      fetchMyGroups();
    } else {
      toast.error('Vui lòng đăng nhập để tải danh sách nhóm');
    }
  };

  const sortItems = [
    { key: 'name', label: 'Tên nhóm' },
    { key: 'members', label: 'Số thành viên' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'activity', label: 'Hoạt động gần nhất' }
  ];

  const filteredGroups = myGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedsubject === 'all') return matchesSearch;
    if (selectedsubject === 'active') return matchesSearch && group.isActive;
    if (selectedsubject === 'programming') return matchesSearch && group.subject === 'Lập trình';
    if (selectedsubject === 'design') return matchesSearch && group.subject === 'Thiết kế';
    if (selectedsubject === 'data') return matchesSearch && group.subject === 'Khoa học dữ liệu';
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'members': return b.members - a.members;
      case 'progress': return b.progress - a.progress;
      case 'activity': return new Date(b.lastActivity) - new Date(a.lastActivity);
      default: return a.name.localeCompare(b.name);
    }
  });

  return (
    <>
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
      <Sidebar />

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-lg"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <MenuOutlined />
      </button>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8 min-h-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Nhóm của tôi</h1>
                <p className="text-white/80">Quản lý và theo dõi tiến độ học tập của bạn</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateGroup}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
                  size="large"
                >
                  Tạo nhóm mới
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  title: 'Tổng nhóm', 
                  value: myGroups.length, 
                  icon: <Users className="w-6 h-6" />,
                },
                { 
                  title: 'Đang hoạt động', 
                  value: myGroups.filter(g => g.isActive).length, 
                  icon: <Activity className="w-6 h-6" />,
                },
                { 
                  title: 'Thành viên', 
                  value: myGroups.reduce((sum, g) => sum + g.members, 0), 
                  icon: <UserOutlined className="text-xl" />,
                },
                { 
                  title: 'Tiến độ trung bình', 
                  value: `${Math.round(myGroups.reduce((sum, g) => sum + g.progress, 0) / myGroups.length)}%`, 
                  icon: <Award className="w-6 h-6" />,
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/25 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Groups Grid */}
          <AnimatePresence>
            {filteredGroups.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/25 hover:border-white/40 transition-all duration-300 hover:shadow-2xl cursor-pointer group"
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar
                          size={60}
                          className={`bg-gradient-to-r ${group.bgColor} flex items-center justify-center text-white font-bold text-lg`}
                        >
                          {group.avatar}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-yellow-200 transition-colors">
                              {group.name}
                            </h3>
                            <Tooltip title={favorites.has(group.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleFavorite(group.id)}
                                className="text-white/60 hover:text-red-400 transition-colors"
                              >
                                <HeartFilled 
                                  className={`text-sm ${
                                    favorites.has(group.id) ? 'text-red-400' : 'text-white/40'
                                  }`} 
                                />
                              </motion.button>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/70 mb-2">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.members} thành viên
                            </span>
                            <div className="flex items-center gap-1">
                              <StarFilled className="text-yellow-400 text-xs" />
                              <span>{group.rating}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {group.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} size="small" className="bg-white/20 text-white border-white/30">
                                {tag}
                              </Tag>
                            ))}
                            {group.tags.length > 2 && (
                              <Tag size="small" className="bg-white/20 text-white border-white/30">
                                +{group.tags.length - 2}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <VideoCallButton
                          groupId={group.id}
                          groupName={group.name}
                          members={[]}
                          isHost={group.id === 1} // Example: first group user is host
                          className="text-xs px-3 py-1"
                        />
                        <Button 
                          type="primary"
                          icon={<EyeOutlined />}
                          className="bg-pink-500 hover:bg-pink-600 border-pink-500"
                          onClick={() => toast.success(`Đang vào nhóm ${group.name}`)}
                        >
                          VÀO XEM
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-sm leading-relaxed mb-4 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {group.description}
                    </p>

                    {/* Progress with Ant Design Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm">Tiến độ học tập</span>
                        <span className="text-white font-semibold text-sm">{group.progress}%</span>
                      </div>
                      <Progress 
                        percent={group.progress} 
                        showInfo={false}
                        strokeColor={{
                          '0%': '#ffffff',
                          '100%': '#f472b6',
                        }}
                        trailColor="rgba(255, 255, 255, 0.2)"
                        size="small"
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Tag 
                          color={group.isActive ? 'green' : 'default'}
                          className="border-0"
                        >
                          {group.isActive ? 'Đang hoạt động' : 'Tạm nghỉ'}
                        </Tag>
                        <span className="text-white/60 text-xs">{group.subject}</span>
                      </div>
                      <span className="text-white/50 text-xs">{group.lastActivity}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-6xl mb-6"
                >
                  📚
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">Không tìm thấy nhóm</h3>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                  Không có nhóm nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục.
                </p>
                <Button 
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleCreateGroup}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  Tạo nhóm mới
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More */}
          {filteredGroups.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Button 
                size="large"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white px-8"
                onClick={() => toast.success('Đang tải thêm nhóm...')}
              >
                HIỂN THỊ THÊM...
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}