import React, { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined, ReloadOutlined, MailOutlined, UserOutlined, ClockCircleOutlined, TeamOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin, Button, Modal, Empty, Badge, Pagination } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import groupService from '../../services/groupService';

export default function InvitationList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3); // Changed from 5 to 3 for better demonstration

  // Fetch invitations on mount
  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await groupService.getReceivedInvitations();
      const invitationData = response?.data || response;
      console.log('📥 Fetched invitations:', invitationData);
      console.log('📊 Response structure:', { response, data: response?.data, isArray: Array.isArray(invitationData) });
      
      const processedInvitations = Array.isArray(invitationData) ? invitationData : [];
      console.log('✅ Processed invitations:', invitationData);
      setInvitations(invitationData);
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
      toast.error(
        (t) => (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CloseOutlined className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Không thể tải lời mời</p>
              <p className="text-sm text-gray-600 mt-1">{error.message || 'Vui lòng thử lại sau'}</p>
            </div>
          </div>
        ),
        {
          duration: 3000,
          style: {
            padding: '16px',
            maxWidth: '400px',
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId, groupName) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <CheckOutlined className="text-green-500" />
          <span>Chấp nhận lời mời</span>
        </div>
      ),
      content: (
        <div className="mt-4">
          <p>Bạn có chắc muốn tham gia nhóm</p>
          <p className="font-semibold text-purple-600 mt-2">"{groupName}"?</p>
        </div>
      ),
      okText: 'Chấp nhận',
      cancelText: 'Hủy',
      okButtonProps: {
        className: 'bg-green-500 hover:bg-green-600',
      },
      onOk: async () => {
        setProcessingId(invitationId);
        try {
          await groupService.acceptInvitation(invitationId);
          toast.success(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckOutlined className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đã tham gia nhóm! 🎉</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Chào mừng bạn đến với nhóm <span className="font-medium text-purple-600">"{groupName}"</span>
                  </p>
                </div>
              </div>
            ),
            {
              duration: 4000,
              style: {
                padding: '16px',
                maxWidth: '500px',
              },
            }
          );
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
          toast.error(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CloseOutlined className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Không thể chấp nhận lời mời</p>
                  <p className="text-sm text-gray-600 mt-1">{error.message || 'Vui lòng thử lại'}</p>
                </div>
              </div>
            ),
            {
              duration: 3000,
              style: {
                padding: '16px',
                maxWidth: '400px',
              },
            }
          );
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleDecline = async (invitationId, groupName) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <CloseOutlined className="text-red-500" />
          <span>Từ chối lời mời</span>
        </div>
      ),
      content: (
        <div className="mt-4">
          <p>Bạn có chắc muốn từ chối lời mời tham gia nhóm</p>
          <p className="font-semibold text-purple-600 mt-2">"{groupName}"?</p>
        </div>
      ),
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setProcessingId(invitationId);
        try {
          await groupService.declineInvitation(invitationId);
          toast.success(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CloseOutlined className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đã từ chối lời mời</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Lời mời tham gia nhóm <span className="font-medium">"{groupName}"</span> đã bị từ chối
                  </p>
                </div>
              </div>
            ),
            {
              duration: 3000,
              style: {
                padding: '16px',
                maxWidth: '450px',
              },
            }
          );
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
          toast.error(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CloseOutlined className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Không thể từ chối lời mời</p>
                  <p className="text-sm text-gray-600 mt-1">{error.message || 'Vui lòng thử lại'}</p>
                </div>
              </div>
            ),
            {
              duration: 3000,
              style: {
                padding: '16px',
                maxWidth: '400px',
              },
            }
          );
        } finally {
          setProcessingId(null);
        }
      }
    });
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

  console.log('🔍 Pagination Debug:', {
    invitationsType: Array.isArray(invitations) ? 'array' : 'object',
    invitationsCount,
    currentPage,
    pageSize,
    startIndex,
    endIndex,
    paginatedCount: paginatedInvitations.length,
    paginatedData: paginatedInvitations
  });

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
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Lời mời tham gia nhóm
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Các lời mời từ nhóm trưởng</p>
          </div>
          {invitationsCount > 0 && (
            <Badge 
              count={invitationsCount} 
              showZero={false}
              style={{ 
                backgroundColor: '#7c3aed',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
              }}
              className="ml-2"
            />
          )}
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchInvitations}
          loading={loading}
          className="flex items-center gap-2 h-10 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:text-purple-600 transition-all shadow-sm hover:shadow-md"
        >
          Làm mới
        </Button>
      </div>
      
      {loading ? (
        /* Loading State */
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Đang tải lời mời...</p>
        </div>
      ) : invitationsCount === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-12"
        >
          <Empty
            image={
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <MailOutlined className="text-6xl text-purple-400" />
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
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-200"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 px-6 py-4 border-b-2 border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                          <TeamOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors">
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
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <UserOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Người mời</p>
                          <p className="font-semibold text-gray-900 text-base">
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
                          className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MailOutlined className="text-white text-sm" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Lời nhắn</p>
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
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-100">
                    <div className="flex gap-3">
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleAccept(invitation.id, invitation.groupName)}
                        loading={processingId === invitation.id}
                        disabled={processingId && processingId !== invitation.id}
                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 rounded-xl shadow-lg hover:shadow-xl font-semibold text-base transition-all"
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
                        className="flex-1 h-12 rounded-xl shadow-lg hover:shadow-xl font-semibold text-base transition-all"
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
              className="mt-8 flex justify-center"
            >
              <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border-2 border-gray-100">
                <Pagination
                  current={currentPage}
                  total={invitationsCount}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  showTotal={(total, range) => (
                    <span className="text-sm text-gray-600 font-medium">
                      Hiển thị {range[0]}-{range[1]} trong tổng số {total} lời mời
                    </span>
                  )}
                  pageSizeOptions={['3', '5', '10', '20']}
                  className="custom-pagination"
                  itemRender={(page, type, originalElement) => {
                    if (type === 'prev') {
                      return (
                        <Button 
                          className="flex items-center gap-1 rounded-lg border-purple-200 hover:border-purple-400 hover:text-purple-600"
                          icon={<LeftOutlined />}
                        >
                          Trước
                        </Button>
                      );
                    }
                    if (type === 'next') {
                      return (
                        <Button 
                          className="flex items-center gap-1 rounded-lg border-purple-200 hover:border-purple-400 hover:text-purple-600"
                        >
                          Sau
                          <RightOutlined />
                        </Button>
                      );
                    }
                    return originalElement;
                  }}
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}