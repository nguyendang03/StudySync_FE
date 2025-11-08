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
  const [showMore, setShowMore] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedGroups, setRequestedGroups] = useState(new Set());
  const [joinRequestModal, setJoinRequestModal] = useState({ visible: false, groupId: null, groupName: '' });
  const [customMessage, setCustomMessage] = useState('');
  const navigate = useNavigate();

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

  const visibleGroups = showMore ? filteredGroups : filteredGroups.slice(0, 3);

  return (
    <>
      <div 
        className="min-h-screen p-8" 
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Khám phá nhóm học tập
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/80"
            >
              Tìm kiếm và tham gia các nhóm học tập phù hợp với bạn
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 text-white rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm font-medium shadow-lg"
              >
                <UsergroupAddOutlined className="mr-2" style={{ fontSize: '16px' }} />
                Danh sách nhóm ({filteredGroups.length})
              </motion.button>
              <motion.button 
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-purple-600 rounded-full hover:bg-gray-100 transition-all duration-300 font-medium shadow-lg"
              >
                <PlusOutlined className="mr-2" style={{ fontSize: '16px' }} />
                Tạo nhóm
              </motion.button>
            </div>
            
            <div className="relative">
              <SearchOutlined 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" 
                style={{ fontSize: '18px' }}
              />
              <input
                type="text"
                placeholder="Bạn tìm nhóm nào?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white/20 text-white placeholder-white/70 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 w-96 backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          )}

          {/* Groups List */}
          {!loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg"
            >
              <div className="p-8">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {searchTerm ? 'Không tìm thấy nhóm nào phù hợp' : 'Chưa có nhóm nào'}
                    </p>
                    {!searchTerm && (
                      <p className="text-gray-400 text-sm mt-2">
                        Hãy là người đầu tiên tạo nhóm!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {visibleGroups.map((group, index) => (
                      <motion.div 
                        key={group.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Group Header */}
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-2xl font-bold text-gray-800">
                                {group.groupName}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <UsergroupAddOutlined className="mr-1" style={{ fontSize: '14px' }} />
                                  {group.memberCount || 0} thành viên
                                </span>
                              </div>
                            </div>
                            
                            {/* Leader and Status Badges */}
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="inline-flex px-4 py-2 rounded-full text-white font-medium bg-purple-600 shadow-md">
                                👑 {group.leader?.username || 'Leader'}
                              </span>
                              {group.isMember && (
                                <span className="inline-flex px-4 py-2 rounded-full text-green-700 bg-green-100 font-medium">
                                  ✓ Đã tham gia
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                              {group.description || 'Chưa có mô tả'}
                            </p>
                            
                            {/* Timestamps */}
                            <div className="mt-3 text-xs text-gray-500">
                              Tạo lúc: {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="ml-8 flex-shrink-0">
                            {group.isMember ? (
                              <motion.button 
                                onClick={() => handleViewGroup(group.id)}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center gap-2"
                              >
                                <CheckCircleOutlined />
                                VÀO NHÓM
                              </motion.button>
                            ) : requestedGroups.has(group.id) ? (
                              <motion.button 
                                disabled
                                className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full font-semibold cursor-not-allowed transition-all duration-300 shadow-lg flex items-center gap-2 opacity-75"
                              >
                                <ClockCircleOutlined className="animate-pulse" />
                                ĐÃ GỬI YÊU CẦU
                              </motion.button>
                            ) : (
                              <motion.button 
                                onClick={() => handleOpenJoinRequestModal(group.id, group.groupName)}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full font-semibold hover:from-pink-500 hover:to-pink-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                              >
                                <SendOutlined />
                                XIN THAM GIA
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Show More Button */}
                {filteredGroups.length > 3 && (
                  <div className="text-center mt-10">
                    <motion.button
                      onClick={() => setShowMore(!showMore)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-6 py-3 text-purple-600 font-semibold hover:text-purple-700 transition-colors bg-purple-50 rounded-full hover:bg-purple-100"
                    >
                      {showMore ? 'ẨN BỚT' : `HIỂN THỊ THÊM (${filteredGroups.length - 3} nhóm)`}
                      <DownOutlined 
                        className={`ml-2 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
                        style={{ fontSize: '14px' }}
                      />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
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
            <SendOutlined className="text-pink-500" />
            <span>Gửi yêu cầu tham gia nhóm</span>
          </div>
        }
        open={joinRequestModal.visible}
        onCancel={handleCloseJoinRequestModal}
        onOk={handleSubmitJoinRequest}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{
          className: "bg-pink-500 hover:bg-pink-600",
          disabled: !customMessage.trim()
        }}
        width={600}
      >
        <div className="py-4">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Bạn muốn tham gia nhóm: <strong className="text-purple-600">{joinRequestModal.groupName}</strong>
            </p>
            <p className="text-sm text-gray-500">
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
              💡 <strong>Gợi ý:</strong> Lời nhắn tốt nên bao gồm: giới thiệu ngắn gọn về bản thân, lý do muốn tham gia, và điều bạn có thể đóng góp cho nhóm.
            </p>
          </div>
        </div>
      </Modal>
      
    </>
  );
}