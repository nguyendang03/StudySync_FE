import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined, 
  BookOutlined,
  EyeOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Progress, Button, Tooltip, Pagination } from 'antd';
import { showToast, commonToasts } from '../../utils/toast';
import { Users, BookOpen, Activity } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import InviteMemberModal from '../../components/groups/InviteMemberModal';
import groupService from '../../services/groupService';
import { useAuth } from '../../hooks/useAuth';

// Custom pagination styles
const paginationStyles = `
  .custom-pagination .ant-pagination-item {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    font-weight: 500;
  }
  .custom-pagination .ant-pagination-item:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  .custom-pagination .ant-pagination-item-active {
    background: white;
    border-color: white;
    color: #9333ea;
    font-weight: 600;
  }
  .custom-pagination .ant-pagination-item-active:hover {
    background: white;
    border-color: white;
  }
  .custom-pagination .ant-pagination-item a {
    color: inherit;
  }
  .custom-pagination .ant-pagination-prev button,
  .custom-pagination .ant-pagination-next button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 8px;
  }
  .custom-pagination .ant-pagination-prev:hover button,
  .custom-pagination .ant-pagination-next:hover button {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }
  .custom-pagination .ant-pagination-disabled button {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.4);
  }
  .custom-pagination .ant-select-selector {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: white !important;
    border-radius: 8px !important;
  }
  .custom-pagination .ant-select-arrow {
    color: white;
  }
  .custom-pagination .ant-pagination-options-quick-jumper input {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 8px;
  }
`;

export default function MyGroups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedsubject, setSelectedsubject] = useState('all');  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // 6 cards per page
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    if (isAuthenticated && !hasFetched) {
      fetchMyGroups();
    }
  }, [isAuthenticated]);

  // Reset to page 1 when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedsubject, sortBy]);

  const fetchMyGroups = async (showToastMessage = true) => {
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
      
      const transformedGroups = Array.isArray(groupsData) ? groupsData.map((group) => ({
        id: group.id,
        groupName: group.groupName || 'Nhóm không tên',
        description: group.description || 'Không có mô tả',
        leaderId: group.leaderId,
        isActive: group.isActive,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        // Calculate member count from storageLimit
        storageUsed: group.storageUsed || 0,
        storageLimit: group.storageLimit || 10240,
        totalStorageUsedMb: group.totalStorageUsedMb || '0.00'
      })) : [];

      setMyGroups(transformedGroups);
      setHasFetched(true);
      
      // Only show toast if we haven't shown it before AND showToastMessage is true
      if (!hasFetched && showToastMessage) {
        if (transformedGroups.length > 0) {
          showToast.success(`Đã tải ${transformedGroups.length} nhóm của bạn`);
        } else {
          showToast.info('Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới!');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      
      // Only show error toasts if showToastMessage is true
      if (showToastMessage) {
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
  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Chưa có hoạt động';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hôm nay';
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Không xác định';
    }
  };

  const formatStorageUsed = (mb) => {
    const num = parseFloat(mb);
    if (num < 1) return `${(num * 1024).toFixed(0)} KB`;
    return `${num.toFixed(2)} MB`;
  };

  const getStoragePercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };



  const categories = [
    { id: 'all', name: 'Tất cả nhóm', count: myGroups.length },
    { id: 'active', name: 'Đang hoạt động', count: myGroups.filter(g => g.isActive).length },
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
    { key: 'createdAt', label: 'Ngày tạo' },
    { key: 'updatedAt', label: 'Cập nhật gần nhất' }
  ];

  const filteredGroups = myGroups.filter(group => {
    const matchesSearch = group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedsubject === 'all') return matchesSearch;
    if (selectedsubject === 'active') return matchesSearch && group.isActive;
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'createdAt': return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updatedAt': return new Date(b.updatedAt) - new Date(a.updatedAt);
      default: return a.groupName.localeCompare(b.groupName);
    }
  });

  // Pagination
  const totalGroups = filteredGroups.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
    // Scroll to top of groups section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <>
    {/* Custom Pagination Styles */}
    <style>{paginationStyles}</style>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  title: 'Tổng dung lượng', 
                  value: `${myGroups.reduce((sum, g) => sum + parseFloat(g.totalStorageUsedMb), 0).toFixed(2)} MB`, 
                  icon: <BookOpen className="w-6 h-6" />,
                  color: 'from-purple-500 to-purple-600',
                  iconBg: 'bg-purple-500/20'
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
            {paginatedGroups.length > 0 ? (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {paginatedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                            {group.groupName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              group.isActive 
                                ? 'bg-green-400/30 text-white border border-green-300/50' 
                                : 'bg-gray-400/30 text-white border border-gray-300/50'
                            }`}>
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {group.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Tooltip title="Xem chi tiết">
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              size="small"
                              className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/groups/${group.id}`);
                              }}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {group.description}
                        </p>
                      </div>

                      {/* Storage Info */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <BookOutlined className="text-purple-500" />
                            Dung lượng sử dụng
                          </span>
                          <span className="text-xs font-bold text-purple-600">
                            {formatStorageUsed(group.totalStorageUsedMb)} / {(group.storageLimit / 1024).toFixed(0)} GB
                          </span>
                        </div>
                        <Progress 
                          percent={getStoragePercentage(group.storageUsed, group.storageLimit)} 
                          showInfo={false}
                          strokeColor={{
                            '0%': '#9333ea',
                            '100%': '#a855f7',
                          }}
                          trailColor="#e5e7eb"
                          strokeWidth={8}
                        />
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">📅</span>
                          <span>Tạo: {formatLastActivity(group.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">🔄</span>
                          <span>Cập nhật: {formatLastActivity(group.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalGroups > pageSize && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mt-8"
                >
                  <Pagination
                    current={currentPage}
                    total={totalGroups}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                    showSizeChanger
                    showTotal={(total, range) => (
                      <span className="text-white/90 font-medium">
                        {range[0]}-{range[1]} của {total} nhóm
                      </span>
                    )}
                    pageSizeOptions={[6, 9, 12, 18, 24]}
                    className="custom-pagination"
                    style={{
                      padding: '16px 24px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </motion.div>
              )}
            </>
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