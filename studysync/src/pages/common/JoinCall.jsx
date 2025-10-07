import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, Users, Clock, PhoneIncoming, Phone, X,
  CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import VideoCall from '../../components/videocall/VideoCall';
import { useAuthStore, useVideoCallStore } from '../../stores';
import toast from 'react-hot-toast';

const JoinCall = () => {
  const { callId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [callInfo, setCallInfo] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callError, setCallError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated } = useAuthStore();
  const { startCall } = useVideoCallStore();

  const groupName = searchParams.get('group') || 'Nhóm học tập';

  // Simulate fetching call information
  useEffect(() => {
    const fetchCallInfo = async () => {
      setIsLoading(true);
      try {
        // Simulate API call to get call information
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock call info - in real app, this would come from your backend
        const mockCallInfo = {
          id: callId,
          channelName: callId,
          groupName: groupName,
          hostName: 'Nguyễn Văn A',
          startTime: Date.now() - 300000, // Started 5 minutes ago
          participantCount: 3,
          isActive: true,
          participants: [
            { id: 'host', name: 'Nguyễn Văn A', isHost: true },
            { id: 'user_1', name: 'Trần Thị B', isHost: false },
            { id: 'user_2', name: 'Lê Văn C', isHost: false }
          ]
        };
        
        setCallInfo(mockCallInfo);
      } catch (error) {
        console.error('Failed to fetch call info:', error);
        setCallError('Không thể tải thông tin cuộc gọi');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchCallInfo();
    } else {
      setCallError('ID cuộc gọi không hợp lệ');
      setIsLoading(false);
    }
  }, [callId, groupName]);

  const handleJoinCall = async () => {
    if (!isAuthenticated) {
      toast.error('Bạn cần đăng nhập để tham gia cuộc gọi');
      navigate('/login');
      return;
    }

    if (!callInfo) {
      toast.error('Thông tin cuộc gọi không hợp lệ');
      return;
    }

    setIsJoining(true);
    
    try {
      // Start the call
      startCall({
        channelName: callInfo.channelName,
        groupName: callInfo.groupName,
        participants: callInfo.participants,
        isHost: false
      });
      
      setIsCallActive(true);
      toast.success('Đã tham gia cuộc gọi!');
    } catch (error) {
      console.error('Failed to join call:', error);
      toast.error('Không thể tham gia cuộc gọi');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeclineCall = () => {
    navigate('/');
    toast.success('Đã từ chối tham gia cuộc gọi');
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    navigate('/');
  };

  const formatDuration = (startTime) => {
    const duration = Math.floor((Date.now() - startTime) / 60000);
    return duration > 0 ? `${duration} phút` : 'Vừa bắt đầu';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin cuộc gọi...</p>
        </div>
      </div>
    );
  }

  if (callError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tham gia cuộc gọi</h2>
            <p className="text-gray-600 mb-6">{callError}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Về trang chủ
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isCallActive && callInfo) {
    return (
      <VideoCall
        channelName={callInfo.channelName}
        onCallEnd={handleCallEnd}
        isHost={false}
        groupMembers={callInfo.participants}
        groupName={callInfo.groupName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full mx-4"
      >
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIncoming className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Lời mời tham gia cuộc gọi</h1>
            <p className="text-blue-100">Bạn được mời tham gia cuộc gọi video</p>
          </div>

          {/* Call Info */}
          {callInfo && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {callInfo.groupName}
                </h2>
                <p className="text-gray-600 mb-4">
                  Được mời bởi <span className="font-medium text-blue-600">{callInfo.hostName}</span>
                </p>
                
                {/* Call Status */}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Đang diễn ra</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(callInfo.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{callInfo.participantCount} người</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Người tham gia:</h3>
                  <div className="space-y-2">
                    {callInfo.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-700">{participant.name}</span>
                        </div>
                        {participant.isHost && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Host
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Authentication Check */}
              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Bạn cần đăng nhập để tham gia cuộc gọi</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeclineCall}
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Từ chối</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinCall}
                  disabled={isJoining || !callInfo.isActive}
                  className={`
                    flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2
                    ${isJoining || !callInfo.isActive
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  `}
                >
                  {isJoining ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Đang tham gia...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      <span>Tham gia</span>
                    </>
                  )}
                </motion.button>
              </div>

              {!callInfo.isActive && (
                <p className="text-center text-red-600 text-sm mt-4">
                  Cuộc gọi đã kết thúc
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JoinCall;