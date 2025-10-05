import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff, 
  Monitor, Users, Settings, MessageSquare, X 
} from 'lucide-react';
import agoraService from '../../services/agoraService';
import { useVideoCallStore } from '../../stores';
import toast from 'react-hot-toast';

const VideoCall = ({ 
  channelName, 
  onCallEnd, 
  isHost = false, 
  groupMembers = [],
  groupName = ''
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const callStartTime = useRef(null);

  const { startCall, endCall } = useVideoCallStore();

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Initialize call
  useEffect(() => {
    isMountedRef.current = true;
    
    const initCall = async () => {
      try {
        if (initializingRef.current) {
          console.log('Already initializing, skipping...');
          return;
        }
        
        initializingRef.current = true;
        console.log('🚀 Starting video call initialization...', { channelName, groupName });
        setIsConnecting(true);
        
        // Check if component is still mounted
        if (!isMountedRef.current) {
          console.log('Component unmounted during init, aborting...');
          return;
        }
        
        // Initialize Agora service
        console.log('🔧 Initializing Agora service...');
        const success = await agoraService.init();
        if (!success) {
          throw new Error('Failed to initialize Agora service');
        }
        
        // Check if component is still mounted before joining
        if (!isMountedRef.current) {
          console.log('Component unmounted before join, aborting...');
          return;
        }
        
        console.log('📞 Joining video call...');
        await joinCall();
        
      } catch (error) {
        console.error('❌ Failed to initialize call:', error);
        if (isMountedRef.current) {
          toast.error('Không thể khởi tạo cuộc gọi: ' + error.message);
          setIsConnecting(false);
        }
      } finally {
        initializingRef.current = false;
      }
    };

    // Add a small delay to prevent immediate execution conflicts
    const timeoutId = setTimeout(initCall, 100);

    // Listen for remote user updates
    const handleUserUpdated = (event) => {
      if (isMountedRef.current) {
        setRemoteUsers(event.detail.users);
      }
    };

    window.addEventListener('agoraUserUpdated', handleUserUpdated);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      window.removeEventListener('agoraUserUpdated', handleUserUpdated);
      
      // Only cleanup if we were actually in a call
      if (isCallStarted && !initializingRef.current) {
        console.log('🧹 Cleaning up video call...');
        leaveCall();
      }
    };
  }, [channelName]);

  // Update call duration
  useEffect(() => {
    let interval;
    if (isCallStarted) {
      callStartTime.current = Date.now();
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallStarted]);

  // Play local video
  useEffect(() => {
    const playLocalVideo = async () => {
      const { video } = agoraService.getLocalTracks();
      if (video && localVideoRef.current) {
        video.play(localVideoRef.current);
      }
    };

    if (isCallStarted && !isVideoMuted) {
      playLocalVideo();
    }
  }, [isCallStarted, isVideoMuted]);

  // Play remote videos
  useEffect(() => {
    remoteUsers.forEach(user => {
      if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
        user.videoTrack.play(remoteVideoRefs.current[user.uid]);
      }
    });
  }, [remoteUsers]);

  const joinCall = async () => {
    try {
      if (!isMountedRef.current) {
        console.log('Component unmounted, aborting join call');
        return;
      }

      console.log('🎯 Attempting to join channel:', channelName);
      
      if (!channelName) {
        throw new Error('Channel name is required');
      }
      
      const uid = await agoraService.joinChannel(channelName);
      
      // Check if component is still mounted after async operation
      if (!isMountedRef.current) {
        console.log('Component unmounted during join, cleaning up...');
        await agoraService.leaveChannel();
        return;
      }
      
      console.log('✅ Successfully joined channel with UID:', uid);
      
      setIsCallStarted(true);
      setIsConnecting(false);
      
      // Update store
      startCall({
        channelName,
        groupName,
        participants: groupMembers,
        isHost
      });
      
      console.log('🎉 Video call started successfully');
    } catch (error) {
      console.error('❌ Failed to join call:', error);
      
      if (isMountedRef.current) {
        setIsConnecting(false);
        // Don't show toast error here as it's already shown in agoraService
      }
    }
  };

  const leaveCall = async () => {
    try {
      console.log('🚪 Leaving video call...');
      
      if (isCallStarted) {
        await agoraService.leaveChannel();
        setIsCallStarted(false);
        endCall();
      }
      
      if (onCallEnd) {
        onCallEnd();
      }
      
      console.log('✅ Successfully left video call');
    } catch (error) {
      console.error('❌ Failed to leave call:', error);
      // Still update state even if leave failed
      setIsCallStarted(false);
      if (onCallEnd) onCallEnd();
    }
  };

  const toggleAudio = async () => {
    const newMutedState = await agoraService.toggleAudio();
    setIsAudioMuted(newMutedState);
  };

  const toggleVideo = async () => {
    const newMutedState = await agoraService.toggleVideo();
    setIsVideoMuted(newMutedState);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await agoraService.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      const success = await agoraService.startScreenShare();
      setIsScreenSharing(success);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang kết nối cuộc gọi...</p>
          <p className="text-white/60 text-sm mt-2">Nhóm: {groupName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-xl font-semibold">{groupName || `Video Call - ${channelName}`}</h2>
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span>{remoteUsers.length + 1} người tham gia</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm font-mono">
            {formatDuration(callDuration)}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={leaveCall}
            className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
        {/* Main Video (Local) */}
        <div className="absolute inset-0">
          <div 
            ref={localVideoRef}
            className="w-full h-full bg-gray-800 rounded-lg overflow-hidden"
          />
          {isVideoMuted && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <VideoOff className="w-10 h-10 text-white" />
                </div>
                <p className="text-white">Camera đã tắt</p>
              </div>
            </div>
          )}
          {/* Local user indicator */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-white text-sm font-medium">Bạn</span>
            {isHost && (
              <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Host</span>
            )}
          </div>
        </div>

        {/* Remote Videos Grid */}
        {remoteUsers.length > 0 && (
          <div className="absolute top-4 right-4 space-y-3 max-h-96 overflow-y-auto">
            {remoteUsers.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-52 h-40 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 relative"
              >
                <div 
                  ref={el => remoteVideoRefs.current[user.uid] = el}
                  className="w-full h-full"
                />
                {!user.hasVideo && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <VideoOff className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                  Người dùng {user.uid}
                </div>
                {/* Audio indicator */}
                <div className="absolute top-2 right-2">
                  <div className={`p-1 rounded-full ${user.hasAudio ? 'bg-green-600' : 'bg-red-600'}`}>
                    {user.hasAudio ? (
                      <Mic className="w-3 h-3 text-white" />
                    ) : (
                      <MicOff className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No participants message */}
        {remoteUsers.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-white text-lg mb-2">Đang chờ thành viên khác tham gia</p>
              <p className="text-gray-400 text-sm">Chia sẻ link cuộc gọi để mời thêm người</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900/90 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-200 font-medium ${
              isAudioMuted 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Video Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              isVideoMuted 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoMuted ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Screen Share */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Monitor className="w-6 h-6 text-white" />
          </motion.button>

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/25"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Cài đặt cuộc gọi</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm mb-3 font-medium">Chất lượng video</label>
                <select className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                  <option value="720p">720p (Khuyến nghị)</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-3 font-medium">Thiết bị</label>
                <div className="space-y-3">
                  <select className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    <option>Camera mặc định</option>
                  </select>
                  <select className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    <option>Microphone mặc định</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-3 font-medium">Thông tin cuộc gọi</label>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Kênh:</span>
                    <span className="text-white font-mono">{channelName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Thời gian:</span>
                    <span className="text-white">{formatDuration(callDuration)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Người tham gia:</span>
                    <span className="text-white">{remoteUsers.length + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCall;