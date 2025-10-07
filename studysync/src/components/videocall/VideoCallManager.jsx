import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Users, Plus, PhoneIncoming, Phone, X, 
  Clock, UserCheck, Send, Link as LinkIcon, Copy
} from 'lucide-react';
import { Modal, notification } from 'antd';
import VideoCall from './VideoCall';
import CallInitiator from './CallInitiator';
import InvitationModal from './InvitationModal';
import { useAuthStore, useVideoCallStore, useGroupsStore } from '../../stores';
import toast from 'react-hot-toast';

const VideoCallManager = ({ 
  groupId, 
  groupName, 
  members = [], 
  className = '' 
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInitiatorModalOpen, setIsInitiatorModalOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [callLink, setCallLink] = useState('');
  
  const { user, isAuthenticated } = useAuthStore();
  const { activeCall, isInCall, startCall } = useVideoCallStore();
  const { currentGroup } = useGroupsStore();

  // Generate unique call link
  useEffect(() => {
    if (groupId) {
      const baseUrl = window.location.origin;
      const callId = `${groupId}_${Date.now()}`;
      setCallLink(`${baseUrl}/join-call/${callId}`);
    }
  }, [groupId]);

  // Check for incoming invitations (simulate real-time)
  useEffect(() => {
    const checkInvitations = () => {
      // Simulate incoming invitations - in real app, this would be WebSocket/SSE
      const simulatedInvitations = [
        // Example invitation structure
        // {
        //   id: 'inv_123',
        //   from: { id: 'user_456', name: 'Nguyễn Văn A', avatar: '/avatar1.jpg' },
        //   groupName: 'Nhóm Toán Cao Cấp',
        //   channelName: 'group_123',
        //   timestamp: Date.now() - 30000
        // }
      ];
      setPendingInvitations(simulatedInvitations);
    };

    if (isAuthenticated) {
      checkInvitations();
      const interval = setInterval(checkInvitations, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleStartCall = (callData) => {
    const channelName = `group_${groupId}_${Date.now()}`;
    
    startCall({
      channelName,
      groupId,
      groupName,
      participants: members,
      isHost: true,
      callLink: `${window.location.origin}/join-call/${channelName}`
    });
    
    setIsCallActive(true);
    setIsInitiatorModalOpen(false);
    
    toast.success('Cuộc gọi đã được khởi tạo!');
  };

  const handleJoinCall = (invitation) => {
    startCall({
      channelName: invitation.channelName,
      groupId,
      groupName: invitation.groupName,
      participants: members,
      isHost: false
    });
    
    setIsCallActive(true);
    
    // Remove the invitation after joining
    setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    
    toast.success(`Đã tham gia cuộc gọi từ ${invitation.from.name}`);
  };

  const handleDeclineInvitation = (invitationId) => {
    setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.success('Đã từ chối lời mời');
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    toast.success('Cuộc gọi đã kết thúc');
  };

  const handleInviteSent = (invitedUsers) => {
    toast.success(`Đã gửi lời mời đến ${invitedUsers.length} người`);
    setIsInviteModalOpen(false);
  };

  const copyCallLink = () => {
    navigator.clipboard.writeText(callLink);
    toast.success('Đã sao chép link cuộc gọi!');
  };

  const shareCallLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Tham gia cuộc gọi - ${groupName}`,
        text: `Bạn được mời tham gia cuộc gọi video nhóm ${groupName}`,
        url: callLink,
      });
    } else {
      copyCallLink();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center ${className}`}>
        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">Đăng nhập để sử dụng tính năng gọi video</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pending Invitations */}
      <AnimatePresence>
        {pendingInvitations.map((invitation) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <PhoneIncoming className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Lời mời gọi video từ <span className="text-blue-600">{invitation.from.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">Nhóm: {invitation.groupName}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor((Date.now() - invitation.timestamp) / 60000)} phút trước
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJoinCall(invitation)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 mr-1 inline" />
                  Tham gia
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeclineInvitation(invitation.id)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  <X className="w-4 h-4 mr-1 inline" />
                  Từ chối
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Video Call Controls */}
      {!isCallActive && !isInCall && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cuộc gọi video nhóm</h3>
              <p className="text-sm text-gray-600">Khởi tạo hoặc mời thành viên tham gia</p>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{members.length} thành viên</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Start Call */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsInitiatorModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Video className="w-5 h-5" />
              <span>Bắt đầu cuộc gọi</span>
            </motion.button>

            {/* Invite Members */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Mời thành viên</span>
            </motion.button>
          </div>

          {/* Call Link Section */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Link tham gia nhanh</label>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyCallLink}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareCallLink}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white rounded border">
              <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={callLink}
                readOnly
                className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chia sẻ link này để mời người khác tham gia cuộc gọi
            </p>
          </div>
        </div>
      )}

      {/* Active Call Status */}
      {(isCallActive || isInCall) && activeCall && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900">Cuộc gọi đang hoạt động</p>
                <p className="text-sm text-green-700">
                  {activeCall.groupName} • {activeCall.participants?.length || 0} người tham gia
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-1 inline" />
              Mời thêm
            </motion.button>
          </div>
        </div>
      )}

      {/* Call Initiator Modal */}
      <Modal
        title={null}
        open={isInitiatorModalOpen}
        onCancel={() => setIsInitiatorModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <CallInitiator
          groupId={groupId}
          groupName={groupName}
          members={members}
          onStartCall={handleStartCall}
          onCancel={() => setIsInitiatorModalOpen(false)}
        />
      </Modal>

      {/* Invitation Modal */}
      <Modal
        title={null}
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose={true}
      >
        <InvitationModal
          groupId={groupId}
          groupName={groupName}
          members={members}
          activeCall={activeCall}
          onInviteSent={handleInviteSent}
          onCancel={() => setIsInviteModalOpen(false)}
        />
      </Modal>

      {/* Active Video Call */}
      <Modal
        title={null}
        open={isCallActive}
        onCancel={handleCallEnd}
        footer={null}
        width="100vw"
        style={{ 
          top: 0, 
          padding: 0, 
          maxWidth: '100vw' 
        }}
        bodyStyle={{ 
          padding: 0, 
          height: '100vh' 
        }}
        destroyOnClose={true}
        maskClosable={false}
        keyboard={false}
        closable={false}
      >
        {activeCall && (
          <VideoCall
            channelName={activeCall.channelName}
            onCallEnd={handleCallEnd}
            isHost={activeCall.isHost}
            groupMembers={activeCall.participants}
            groupName={activeCall.groupName}
          />
        )}
      </Modal>
    </div>
  );
};

export default VideoCallManager;