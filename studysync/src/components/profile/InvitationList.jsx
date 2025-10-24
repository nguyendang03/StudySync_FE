import React, { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined, ReloadOutlined, MailOutlined, UserOutlined, ClockCircleOutlined, TeamOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin, Button, Modal, Empty, Badge, Pagination } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast, commonToasts } from '../../utils/toast';
import groupService from '../../services/groupService';

export default function InvitationList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3); // Changed from 5 to 3 for better demonstration
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // Fetch invitations on mount
  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await groupService.getReceivedInvitations();
      const invitationData = response?.data || response;
      setInvitations(invitationData || []);
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
      showToast.error('Không thể tải lời mời. ' + (error.message || 'Vui lòng thử lại sau'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId, groupName) => {
    setProcessingId(invitationId);
    try {
      await groupService.acceptInvitation(invitationId);
      commonToasts.groupJoined(groupName);
      // Refresh invitations list and reset to first page if needed
      await fetchInvitations();
      // If current page becomes empty after deletion, go to previous page
      const updatedInvitations = Array.isArray(invitations) 
        ? invitations 
        : Object.values(invitations || {});
      const remainingInvitations = updatedInvitations.length - 1;
      const maxPage = Math.ceil(remainingInvitations / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
      showToast.error('Không thể chấp nhận lời mời. ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId, groupName) => {
    setSelectedInvitation({ id: invitationId, name: groupName });
    setDeclineModalVisible(true);
  };

  const confirmDecline = async () => {
    if (!selectedInvitation) return;
    
    setProcessingId(selectedInvitation.id);
    setDeclineModalVisible(false);
    
    try {
      const response = await groupService.declineInvitation(selectedInvitation.id);
      
      showToast.success(`Đã từ chối lời mời tham gia nhóm "${selectedInvitation.name}"`);
      
      // Refresh invitations list and adjust page if needed
      await fetchInvitations();
      const updatedInvitations = Array.isArray(invitations) 
        ? invitations 
        : Object.values(invitations || {});
      const remainingInvitations = updatedInvitations.length - 1;
      const maxPage = Math.ceil(remainingInvitations / pageSize);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (error) {
      console.error('❌ Error declining invitation:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      showToast.error('Không thể từ chối lời mời. ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setProcessingId(null);
      setSelectedInvitation(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} phút trước`;
      }
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate paginated data - handle both array and object
  const invitationsArray = Array.isArray(invitations) ? invitations : Object.values(invitations || {});
  const invitationsCount = invitationsArray.length;
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvitations = invitationsArray.slice(startIndex, endIndex);

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MailOutlined className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lời mời tham gia nhóm
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Các lời mời từ nhóm trưởng</p>
          </div>
          {invitationsCount > 0 && (
            <Badge 
              count={invitationsCount} 
              showZero={false}
              style={{ 
                backgroundColor: '#7c3aed'
              }}
              className="ml-2"
            />
          )}
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchInvitations}
          loading={loading}
          className="flex items-center gap-2 h-10 rounded-lg border border-gray-300 hover:border-purple-500 hover:text-purple-600"
        >
          Làm mới
        </Button>
      </div>
      
      {loading ? (
        /* Loading State */
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải lời mời...</p>
        </div>
      ) : invitationsCount === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-12"
        >
          <Empty
            image={
              <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <MailOutlined className="text-5xl text-purple-400" />
              </div>
            }
            description={
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Không có lời mời nào</h3>
                <p className="text-gray-500">Bạn chưa nhận được lời mời tham gia nhóm nào.</p>
                <p className="text-sm text-gray-400">Các lời mời từ nhóm trưởng sẽ xuất hiện ở đây.</p>
              </div>
            }
          />
        </motion.div>
      ) : (
        /* Invitation Cards */
        <>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {paginatedInvitations.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  {/* Card Header */}
                  <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                          <TeamOutlined className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {invitation.groupName || 'N/A'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <ClockCircleOutlined className="text-purple-500" />
                            <span>{formatDate(invitation.invitedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        status="processing" 
                        text="Đang chờ" 
                        className="font-medium"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Inviter Info */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium uppercase">Người mời</p>
                          <p className="font-semibold text-gray-900">
                            {invitation.invitedBy || 'N/A'}
                          </p>
                          {invitation.inviteEmail && (
                            <p className="text-xs text-gray-500">{invitation.inviteEmail}</p>
                          )}
                        </div>
                      </div>

                      {/* Message (if exists) */}
                      {invitation.message && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <MailOutlined className="text-white text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Lời nhắn</p>
                              <p className="text-gray-700 leading-relaxed">{invitation.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Group Info Tags */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {invitation.groupDescription && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            <TeamOutlined className="text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {invitation.groupDescription}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-3">
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleAccept(invitation.id, invitation.groupName)}
                        loading={processingId === invitation.id}
                        disabled={processingId && processingId !== invitation.id}
                        className="flex-1 h-11 bg-green-500 hover:bg-green-600 border-0 rounded-lg font-semibold"
                        size="large"
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleDecline(invitation.id, invitation.groupName)}
                        loading={processingId === invitation.id}
                        disabled={processingId && processingId !== invitation.id}
                        className="flex-1 h-11 rounded-lg font-semibold"
                        size="large"
                      >
                        Từ chối
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {invitationsCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex justify-center"
            >
              <div className="bg-white rounded-lg shadow-md px-6 py-4 border border-gray-200">
                <Pagination
                  current={currentPage}
                  total={invitationsCount}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  showTotal={(total, range) => (
                    <span className="text-sm text-gray-600">
                      Hiển thị {range[0]}-{range[1]} / {total} lời mời
                    </span>
                  )}
                  pageSizeOptions={['3', '5', '10', '20']}
                />
              </div>
            </motion.div>
          )}
        </>
      )}
      
      {/* Decline Confirmation Modal */}
      <Modal
        title="Từ chối lời mời"
        open={declineModalVisible}
        onOk={confirmDecline}
        onCancel={() => {
          setDeclineModalVisible(false);
          setSelectedInvitation(null);
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okType="danger"
        centered
        confirmLoading={processingId === selectedInvitation?.id}
      >
        <p>Bạn có chắc muốn từ chối lời mời tham gia nhóm <strong>"{selectedInvitation?.name}"</strong>?</p>
      </Modal>
    </div>
  );
}