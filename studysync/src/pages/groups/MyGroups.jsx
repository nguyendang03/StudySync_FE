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
  StarFilled,
  UserAddOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Tag, Progress, Avatar, Tooltip, Button, Dropdown, Spin } from 'antd';
import { showToast, commonToasts } from '../../utils/toast';
import { Users, Award, BookOpen, Activity } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { VideoCallButton } from '../../components/videocall';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import InviteMemberModal from '../../components/groups/InviteMemberModal';
import groupService from '../../services/groupService';
import { useAuth } from '../../hooks/useAuth';

export default function MyGroups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedsubject, setSelectedsubject] = useState('all');  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    if (isAuthenticated && !hasFetched) {
      fetchMyGroups();
    }
  }, [isAuthenticated]);

  const fetchMyGroups = async (showToast = true) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching groups for authenticated user...');
      
      const response = await groupService.getMyGroups();
      console.log('📝 Groups API response:', response);
      
      // Extract data from response (axios already extracts response.data)
      let groupsData = response?.data || response || [];
      
      // Convert object with numeric keys to array if needed
      if (groupsData && typeof groupsData === 'object' && !Array.isArray(groupsData)) {
        groupsData = Object.values(groupsData);
      }
      
      console.log('📝 Groups data after extraction:', groupsData);
      
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
        rating: Number((4.5 + Math.random() * 0.5).toFixed(1)), // Fixed to 1 decimal place
        tags: ['Học tập', 'Nhóm']
      })) : [];

      setMyGroups(transformedGroups);
      setHasFetched(true);
      
      // Only show toast if we haven't shown it before AND showToast is true
      if (!hasFetched && showToast) {
        if (transformedGroups.length > 0) {
          showToast.success(`Đã tải ${transformedGroups.length} nhóm của bạn`);
        } else {
          showToast.info('Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới!');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      
      // Only show error toasts if showToast is true
      if (showToast) {
        if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
          showToast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend.');
        } else if (error.message?.includes('Authentication required') || error.message?.includes('Session expired')) {
          showToast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        } else {
          showToast.error(`Lỗi tải nhóm: ${error.message}`);
        }
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateGroupSubmit = async (groupData) => {
    try {
      console.log('🔄 Creating new group:', groupData);
      
      // Call backend API to create group
      const response = await groupService.createGroup({
        groupName: groupData.groupName,
        description: groupData.description
      });
      
      console.log('✅ Group created successfully:', response);
      
      commonToasts.groupCreated(groupData.groupName);
      
      // Refresh the groups list (without showing toast to avoid duplicates)
      setHasFetched(false);
      await fetchMyGroups(false);
      
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('❌ Error creating group:', error);
      showToast.error(`Lỗi tạo nhóm: ${error.message || 'Không thể tạo nhóm'}`);
    }
  };

  const handleRefreshGroups = () => {
    if (isAuthenticated) {
      setHasFetched(false); // Allow toast on manual refresh
      fetchMyGroups();
    } else {
      showToast.error('Vui lòng đăng nhập để tải danh sách nhóm');
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
    {/* Create Group Modal */}
    <CreateGroupModal 
      isOpen={isCreateModalOpen}
      onClose={handleCloseModal}
      onCreateGroup={handleCreateGroupSubmit}
    />

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
                  color: 'from-blue-500 to-blue-600',
                  iconBg: 'bg-blue-500/20'
                },
                { 
                  title: 'Đang hoạt động', 
                  value: myGroups.filter(g => g.isActive).length, 
                  icon: <Activity className="w-6 h-6" />,
                  color: 'from-green-500 to-green-600',
                  iconBg: 'bg-green-500/20'
                },
                { 
                  title: 'Thành viên', 
                  value: myGroups.reduce((sum, g) => sum + g.members, 0), 
                  icon: <UserOutlined className="text-xl" />,
                  color: 'from-purple-500 to-purple-600',
                  iconBg: 'bg-purple-500/20'
                },
                { 
                  title: 'Tiến độ trung bình', 
                  value: myGroups.length > 0 ? `${Math.round(myGroups.reduce((sum, g) => sum + g.progress, 0) / myGroups.length)}%` : '0%', 
                  icon: <Award className="w-6 h-6" />,
                  color: 'from-pink-500 to-pink-600',
                  iconBg: 'bg-pink-500/20'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 hover:bg-white/30 hover:border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/90 text-sm mb-2 font-medium tracking-wide">{stat.title}</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 ${stat.iconBg} backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-lg border border-white/20`}>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white/25 backdrop-blur-md rounded-2xl p-6 border border-white/40 hover:bg-white/30 hover:border-white/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <Avatar
                            size={64}
                            className={`bg-gradient-to-br ${group.bgColor} flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white/30`}
                          >
                            {group.avatar}
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">
                              {group.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-white/90 mb-3">
                            <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full font-medium">
                              <Users className="w-3.5 h-3.5" />
                              {group.members}
                            </span>
                            <span className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1 rounded-full font-semibold">
                              <StarFilled className="text-yellow-400 text-sm" />
                              {group.rating}
                            </span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {group.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} className="bg-white/20 text-white border-white/40 font-medium px-3 py-0.5 rounded-full">
                                {tag}
                              </Tag>
                            ))}
                            {group.tags.length > 2 && (
                              <Tag className="bg-purple-500/30 text-white border-white/40 font-medium px-3 py-0.5 rounded-full">
                                +{group.tags.length - 2}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {/* Invite button - only for leaders */}
                        {user && group.leaderId === user.id && (
                          <Tooltip title="Mời thành viên">
                            <Button
                              icon={<UserAddOutlined />}
                              className="bg-green-500 hover:bg-green-600 border-green-500 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGroup(group);
                                setShowInviteModal(true);
                              }}
                            />
                          </Tooltip>
                        )}
                        
                        <Button 
                          type="primary"
                          icon={<EyeOutlined />}
                          className="bg-pink-500 hover:bg-pink-600 border-pink-500"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          VÀO XEM
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/25">
                      <p className="text-white/95 text-sm leading-relaxed overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {group.description}
                      </p>
                    </div>

                    {/* Progress with Ant Design Progress */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/25">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/95 text-sm font-medium flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Tiến độ học tập
                        </span>
                        <span className="text-white font-bold text-base bg-white/25 px-3 py-1 rounded-full">
                          {group.progress}%
                        </span>
                      </div>
                      <Progress 
                        percent={group.progress} 
                        showInfo={false}
                        strokeColor={{
                          '0%': '#60a5fa',
                          '50%': '#a78bfa',
                          '100%': '#ec4899',
                        }}
                        trailColor="rgba(255, 255, 255, 0.2)"
                        strokeWidth={10}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-3">
                        <Tag 
                          className={`border-0 font-medium px-4 py-1 rounded-full ${
                            group.isActive 
                              ? 'bg-green-500/30 text-green-100' 
                              : 'bg-gray-400/30 text-gray-200'
                          }`}
                        >
                          <span className="mr-1">{group.isActive ? '●' : '○'}</span>
                          {group.isActive ? 'Đang hoạt động' : 'Tạm nghỉ'}
                        </Tag>
                        <span className="text-white/80 text-sm font-medium bg-white/15 px-3 py-1 rounded-full">
                          {group.subject}
                        </span>
                      </div>
                      <span className="text-white/70 text-xs font-medium bg-white/15 px-3 py-1 rounded-full flex items-center gap-1">
                        <span>⏰</span>
                        {group.lastActivity}
                      </span>
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
                onClick={() => showToast.success('Đang tải thêm nhóm...')}
              >
                HIỂN THỊ THÊM...
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedGroup(null);
        }}
        groupId={selectedGroup?.id}
        groupName={selectedGroup?.name}
        onSuccess={() => {
          fetchMyGroups(false); // Refresh list silently
        }}
      />
    </div>
    </>
  );
}