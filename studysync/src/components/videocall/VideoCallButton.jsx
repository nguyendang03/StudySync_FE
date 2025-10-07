import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Lock } from 'lucide-react';
import { Modal } from 'antd';
import VideoCall from './VideoCall';
import { useAuthStore } from '../../stores';
import toast from 'react-hot-toast';

const VideoCallButton = ({ 
  groupId, 
  groupName, 
  members = [], 
  isHost = false,
  disabled = false,
  className = '' 
}) => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const startVideoCall = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Bạn cần đăng nhập để tham gia cuộc gọi video');
      return;
    }

    if (disabled) {
      toast.error('Tính năng video call hiện không khả dụng');
      return;
    }

    setIsStartingCall(true);
    
    try {
      // Simulate preparation time
      setTimeout(() => {
        setIsCallModalOpen(true);
        setIsStartingCall(false);
      }, 500);
      
      toast.success('Đang khởi tạo cuộc gọi video...');
    } catch (error) {
      console.error('Failed to start video call:', error);
      toast.error('Không thể bắt đầu cuộc gọi video');
      setIsStartingCall(false);
    }
  };

  const handleCallEnd = () => {
    setIsCallModalOpen(false);
    toast.success('Cuộc gọi đã kết thúc');
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startVideoCall}
        disabled={disabled || isStartingCall || !isAuthenticated}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${disabled || !isAuthenticated
            ? 'bg-gray-500 cursor-not-allowed opacity-60' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/25'
          }
          ${className}
        `}
      >
        {!isAuthenticated ? (
          <>
            <Lock className="w-5 h-5" />
            <span>Đăng nhập để gọi</span>
          </>
        ) : (
          <>
            <Video className="w-5 h-5" />
            <span>
              {isStartingCall ? 'Đang kết nối...' : 'Gọi video nhóm'}
            </span>
            {members.length > 0 && isAuthenticated && (
              <div className="flex items-center space-x-1 ml-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{members.length}</span>
              </div>
            )}
          </>
        )}
      </motion.button>

      {/* Video Call Modal */}
      <Modal
        title={null}
        open={isCallModalOpen}
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
        <VideoCall
          channelName={`group_${groupId}`}
          onCallEnd={handleCallEnd}
          isHost={isHost}
          groupMembers={members}
          groupName={groupName}
        />
      </Modal>
    </>
  );
};

export default VideoCallButton;