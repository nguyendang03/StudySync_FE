import React, { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { message, Spin, Button, Modal } from 'antd';
import groupService from '../../services/groupService';

export default function InvitationList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

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
      setInvitations(Array.isArray(invitationData) ? invitationData : []);
    } catch (error) {
      console.error('❌ Error fetching invitations:', error);
      message.error(error.message || 'Không thể tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId, groupName) => {
    Modal.confirm({
      title: 'Chấp nhận lời mời',
      content: `Bạn có chắc muốn tham gia nhóm "${groupName}"?`,
      okText: 'Chấp nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setProcessingId(invitationId);
        try {
          await groupService.acceptInvitation(invitationId);
          message.success(`Đã tham gia nhóm "${groupName}" thành công!`);
          // Refresh invitations list
          await fetchInvitations();
        } catch (error) {
          console.error('❌ Error accepting invitation:', error);
          message.error(error.message || 'Không thể chấp nhận lời mời');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleDecline = async (invitationId, groupName) => {
    Modal.confirm({
      title: 'Từ chối lời mời',
      content: `Bạn có chắc muốn từ chối lời mời tham gia nhóm "${groupName}"?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setProcessingId(invitationId);
        try {
          await groupService.declineInvitation(invitationId);
          message.success('Đã từ chối lời mời');
          // Refresh invitations list
          await fetchInvitations();
        } catch (error) {
          console.error('❌ Error declining invitation:', error);
          message.error(error.message || 'Không thể từ chối lời mời');
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách lời mời</h2>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchInvitations}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-5 gap-4 font-semibold text-gray-700">
            <div>Tên nhóm</div>
            <div>Người mời</div>
            <div>Lời nhắn</div>
            <div>Thời gian</div>
            <div>Hành động</div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-500">Đang tải lời mời...</p>
            </div>
          ) : invitations.length === 0 ? (
            /* Empty State */
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lời mời nào</h3>
              <p className="text-gray-500">Bạn chưa nhận được lời mời tham gia nhóm nào.</p>
            </div>
          ) : (
            /* Invitation Items */
            invitations.map((invitation) => (
              <div key={invitation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="font-medium text-gray-900">
                    {invitation.group?.groupName || 'N/A'}
                  </div>
                  <div className="text-gray-700">
                    {invitation.inviter?.username || invitation.inviter?.email || 'N/A'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {invitation.message || <span className="text-gray-400 italic">Không có lời nhắn</span>}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invitation.id, invitation.group?.groupName)}
                      disabled={processingId === invitation.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckOutlined />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleDecline(invitation.id, invitation.group?.groupName)}
                      disabled={processingId === invitation.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CloseOutlined />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}