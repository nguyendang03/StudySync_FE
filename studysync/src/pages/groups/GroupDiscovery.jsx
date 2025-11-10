import React, { useState, useEffect } from 'react';
import { SearchOutlined, DownOutlined, UsergroupAddOutlined, PlusOutlined, SendOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spin, message, Modal, Input } from 'antd';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import groupService from '../../services/groupService';

const { TextArea } = Input;

export default function GroupDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 groups per page (3 rows of 2)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedGroups, setRequestedGroups] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('requestedGroups');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [joinRequestModal, setJoinRequestModal] = useState({ visible: false, groupId: null, groupName: '' });
  const [customMessage, setCustomMessage] = useState('');
  const navigate = useNavigate();

  // Save requestedGroups to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('requestedGroups', JSON.stringify([...requestedGroups]));
  }, [requestedGroups]);

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAllGroups();
      console.log('📦 Full response:', response);
      
      // Backend returns array but transform interceptor spreads it into object: {0: {}, 1: {}, ...}
      const responseData = response?.data;
      console.log('📋 Response data:', responseData);
      
      let groupsArray;
      
      // Check if it's already an array
      if (Array.isArray(responseData)) {
        groupsArray = responseData;
      }
      // Check if data has a groups property
      else if (Array.isArray(responseData?.groups)) {
        groupsArray = responseData.groups;
      }
      // Convert object with numeric keys back to array
      else if (responseData && typeof responseData === 'object') {
        const keys = Object.keys(responseData);
        // Check if keys are numeric (0, 1, 2, ...)
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        
        if (isNumericKeys && keys.length > 0) {
          // Convert {0: item, 1: item} back to [item, item]
          groupsArray = Object.values(responseData);
          console.log('📋 Converted object to array:', groupsArray.length, 'items');
        } else {
          // Might be a single object or other structure
          groupsArray = [];
        }
      } else {
        groupsArray = [];
      }
      
      console.log('📋 Final groups array:', groupsArray);
      
      if (Array.isArray(groupsArray)) {
        setGroups(groupsArray);
        console.log('✅ Successfully loaded', groupsArray.length, 'groups');
        
        // Clean up requestedGroups - remove groups that user is now a member of
        const memberGroupIds = new Set(
          groupsArray.filter(g => g.isMember).map(g => g.id)
        );
        setRequestedGroups(prev => {
          const updated = new Set([...prev].filter(id => !memberGroupIds.has(id)));
          return updated;
        });
      } else {
        console.error('❌ Could not extract groups array');
        message.error('Không thể tải danh sách nhóm');
        setGroups([]);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      message.error(error.message || 'Không thể tải danh sách nhóm');
      setIsLoaded(true);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.createGroup(groupData);
      message.success('Tạo nhóm thành công!');
      // Refresh the groups list
      await fetchAllGroups();
      handleCloseCreateModal();
    } catch (error) {
      console.error('Error creating group:', error);
      message.error(error.message || 'Không thể tạo nhóm');
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleOpenJoinRequestModal = (groupId, groupName) => {
    setJoinRequestModal({ visible: true, groupId, groupName });
    setCustomMessage('Xin chào! Tôi muốn tham gia nhóm này để cùng học tập và chia sẻ kiến thức.');
  };

  const handleCloseJoinRequestModal = () => {
    setJoinRequestModal({ visible: false, groupId: null, groupName: '' });
    setCustomMessage('');
  };

  const handleSubmitJoinRequest = async () => {
    try {
      const requestMessage = customMessage.trim() || 'Tôi muốn tham gia nhóm này';
      
      await groupService.requestJoinGroup(joinRequestModal.groupId, { 
        message: requestMessage 
      });
      
      message.success('✅ Đã gửi yêu cầu tham gia nhóm!');
      
      // Add to requested groups set
      setRequestedGroups(prev => new Set([...prev, joinRequestModal.groupId]));
      
      // Close modal
      handleCloseJoinRequestModal();
      
      // Optionally refresh to update the isMember status
      await fetchAllGroups();
    } catch (error) {
      console.error('Error requesting to join:', error);
      message.error(error.message || 'Không thể gửi yêu cầu tham gia');
    }
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter(group => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.groupName?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower) ||
      group.leader?.username?.toLowerCase().includes(searchLower)
    );
  });

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of groups section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Khám phá nhóm học tập
              </h1>
              <p className="text-gray-600">
                Tìm kiếm và tham gia các nhóm học tập phù hợp với bạn
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            {/* Left side - Stats */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                <span className="text-sm font-medium">
                  {filteredGroups.length} nhóm
                </span>
              </div>
              {filteredGroups.length > 0 && (
                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </div>
              )}
              <motion.button 
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center gap-2"
              >
                <PlusOutlined />
                Tạo nhóm mới
              </motion.button>
            </div>
            
            {/* Right side - Search */}
            <div className="relative w-full sm:w-96">
              <SearchOutlined 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Tìm kiếm nhóm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white text-gray-900 placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          )}

          {/* Groups Grid */}
          {!loading && (
            <AnimatePresence>
              {filteredGroups.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border border-gray-200 p-12 text-center"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UsergroupAddOutlined className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm nào'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm 
                        ? 'Thử tìm kiếm với từ khóa khác hoặc tạo nhóm mới' 
                        : 'Hãy là người đầu tiên tạo nhóm học tập!'
                      }
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentGroups.map((group, index) => (
                    <motion.div 
                      key={group.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="group"
                    >
                      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-300 h-full flex flex-col">
                        {/* Group Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              {group.groupName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <UsergroupAddOutlined className="text-gray-400" />
                                {group.memberCount || 0} thành viên
                              </span>
                              {group.isMember && (
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200">
                                  Đã tham gia
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Leader */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {group.leader?.username?.charAt(0).toUpperCase() || 'L'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {group.leader?.username || 'Leader'}
                              </p>
                              <p className="text-xs text-gray-500">Trưởng nhóm</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                          {group.description || 'Chưa có mô tả'}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          
                          {/* Action Button */}
                          {group.isMember ? (
                            <motion.button 
                              onClick={() => handleViewGroup(group.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                            >
                              Vào nhóm
                            </motion.button>
                          ) : requestedGroups.has(group.id) ? (
                            <button 
                              disabled
                              className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium text-sm flex items-center gap-1.5"
                            >
                              <ClockCircleOutlined />
                              Đã gửi yêu cầu
                            </button>
                          ) : (
                            <motion.button 
                              onClick={() => handleOpenJoinRequestModal(group.id, group.groupName)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm"
                            >
                              Xin tham gia
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  {/* Previous Button */}
                  <motion.button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Trước
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                      
                      // Show ellipsis
                      const showEllipsisBefore = pageNumber === currentPage - 2 && currentPage > 3;
                      const showEllipsisAfter = pageNumber === currentPage + 2 && currentPage < totalPages - 2;

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span key={pageNumber} className="px-3 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <motion.button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Sau
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateGroup={handleCreateGroup}
      />

      {/* Join Request Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SendOutlined className="text-purple-600" />
            <span>Gửi yêu cầu tham gia nhóm</span>
          </div>
        }
        open={joinRequestModal.visible}
        onCancel={handleCloseJoinRequestModal}
        onOk={handleSubmitJoinRequest}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-purple-600 hover:bg-purple-700",
          disabled: !customMessage.trim()
        }}
        width={600}
      >
        <div className="py-4">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Bạn muốn tham gia nhóm: <strong className="text-purple-600">{joinRequestModal.groupName}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Hãy viết một lời nhắn ngắn gọn để giới thiệu bản thân và lý do muốn tham gia nhóm.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lời nhắn của bạn <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ví dụ: Xin chào! Tôi là sinh viên năm 2 chuyên ngành CNTT. Tôi rất quan tâm đến chủ đề này và muốn cùng các bạn học tập..."
              rows={5}
              maxLength={500}
              showCount
              className="resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Gợi ý:</strong> Lời nhắn tốt nên bao gồm giới thiệu ngắn gọn về bản thân, lý do muốn tham gia, và điều bạn có thể đóng góp cho nhóm.
            </p>
          </div>
        </div>
      </Modal>
      
    </>
  );
}