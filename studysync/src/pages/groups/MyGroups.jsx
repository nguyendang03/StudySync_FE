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
import { Input, Tag, Progress, Avatar, Tooltip, Button, Dropdown } from 'antd';
import toast from 'react-hot-toast';
import { Users, Award, BookOpen, Activity } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Sidebar from '../../components/layout/Sidebar';

export default function MyGroups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedsubject, setSelectedsubject] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set([1, 3]));

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample groups data
  const myGroups = [
    {
      id: 1,
      name: "Tung Tung Tung Sahur",
      description: "JavaScript B: cùng học và ôn tập ngôn ngữ lập trình nhất thế giới hiện nay và các thành viên hoạt động ban trình học hưởng.Cơ sở thiết lập phù hợp với mọi lứa tuổi và kỹ thuật từ cơ bản đến nâng cao.",
      members: 6,
      subject: "EXE101",
      progress: 75,
      isActive: true,
      avatar: "JS",
      bgColor: "from-yellow-400 to-orange-500",
      lastActivity: "2 giờ trước",
      rating: 4.8,
      tags: ["JavaScript", "Frontend", "Beginner"]
    },
    {
      id: 2,
      name: "React Advanced Techniques",
      description: "Học các kỹ thuật nâng cao trong React: Hooks, Context API, Performance Optimization, và các design patterns phổ biến trong thực tế.",
      members: 5,
      subject: "WDP301",
      progress: 60,
      isActive: false,
      avatar: "RT",
      bgColor: "from-blue-400 to-purple-500",
      lastActivity: "1 ngày trước",
      rating: 4.6,
      tags: ["React", "Advanced", "Hooks"]
    },
    {
      id: 3,
      name: "UI/UX Design Fundamentals",
      description: "Khóa học thiết kế giao diện và trải nghiệm người dùng từ cơ bản đến nâng cao. Học cách sử dụng Figma, Adobe XD và các nguyên tắc thiết kế.",
      members: 7,
      subject: "SWP391",
      progress: 45,
      isActive: true,
      avatar: "UI",
      bgColor: "from-pink-400 to-red-500",
      lastActivity: "30 phút trước",
      rating: 4.9,
      tags: ["Design", "Figma", "UI/UX"]
    },
    {
      id: 4,
      name: "Data Science with Python",
      description: "Khám phá thế giới khoa học dữ liệu với Python. Học pandas, numpy, matplotlib và machine learning basics.",
      members: 6,
      subject: "SWD392",
      progress: 30,
      isActive: true,
      avatar: "DS",
      bgColor: "from-green-400 to-blue-500",
      lastActivity: "15 phút trước",
      rating: 4.7,
      tags: ["Python", "Data Science", "ML"]
    }
  ];

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
    <Header/>
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
                      <Button 
                        type="primary"
                        icon={<EyeOutlined />}
                        className="bg-pink-500 hover:bg-pink-600 border-pink-500 shrink-0"
                        onClick={() => toast.success(`Đang vào nhóm ${group.name}`)}
                      >
                        VÀO XEM
                      </Button>
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
    <Footer/>
    </>
  );
}