import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff, 
  Monitor, Users, Settings, MessageSquare, X, MonitorOff,
  Maximize2, Minimize2, UserPlus, Brain
} from 'lucide-react';
import { Modal, Tooltip, Badge } from 'antd';
import agoraService from '../../services/agoraService';
import { useVideoCallStore } from '../../stores';
import { useAuth } from '../../hooks/useAuth';
import InvitationModal from './InvitationModal';
import VideoCallChat from './VideoCallChat';
import VideoCallAIChat from './VideoCallAIChat';
import toast from 'react-hot-toast';

const VideoCall = ({ 
  channelName, 
  onCallEnd, 
  isHost = false, 
  groupMembers = [],
  groupName = '',
  groupId // Add groupId prop for chat API
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [screenShareUser, setScreenShareUser] = useState(null);
  const [isScreenShareFullscreen, setIsScreenShareFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  const { user: currentUser } = useAuth();

  // Helper function to get username from UID
  const getUsernameByUid = (uid) => {
    // Debug log to see what we're working with
    console.log('[VideoCall] getUsernameByUid called:', { 
      uid, 
      uidType: typeof uid,
      groupMembersCount: groupMembers?.length,
      groupMembersPreview: groupMembers?.slice(0, 3)
    });

    if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0) {
      console.log('[VideoCall] No group members available');
      return `Thành viên ${uid}`;
    }

    const normalizeId = (value) => {
      if (value === undefined || value === null) return null;
      // Convert to string, remove any extra spaces, and convert to lowercase
      return String(value).trim().toLowerCase();
    };

    const uidKey = normalizeId(uid);
    if (!uidKey) {
      console.log('[VideoCall] UID normalization failed');
      return `Thành viên ${uid}`;
    }

    const resolveMemberId = (member) => {
      const possibleIds = [
        member?.id,
        member?.userId,
        member?.memberId,
        member?.user?.id,
        member?.user?.userId,
        member?.user?.profile?.userId,
        member?.UserId,
        member?.User?.id,
        member?.User?.userId,
        member?.profile?.userId,
        member?.user?.user?.id, // Nested user object
        member?.user?.user?.userId, // Nested user object
      ];

      for (const candidate of possibleIds) {
        if (candidate === undefined || candidate === null) continue;
        const normalized = normalizeId(candidate);
        if (normalized) {
          return normalized;
        }
      }

      return null;
    };

    const resolveDisplayName = (member) => {
      // Try nested user first
      if (member?.user?.user) {
        const displayName = member.user.user.username || 
                           member.user.user.fullName || 
                           member.user.user.name ||
                           (member.user.user.email ? member.user.user.email.split('@')[0] : null);
        if (displayName) return displayName;
      }
      
      // Try direct user object
      if (member?.user) {
        const displayName = member.user.username || 
                           member.user.fullName || 
                           member.user.name ||
                           (member.user.email ? member.user.email.split('@')[0] : null);
        if (displayName) return displayName;
      }
      
      // Try direct fields (for transformed members from GroupDetail)
      const displayName = member?.username || 
                         member?.fullName || 
                         member?.name ||
                         (member?.email ? member.email.split('@')[0] : null);
      
      return displayName || `Thành viên ${uid}`;
    };

    // First, try to find exact match
    const matchedMember = groupMembers.find((member) => {
      const memberId = resolveMemberId(member);
      console.log('[VideoCall] Checking member:', { 
        memberId, 
        uidKey,
        match: memberId && memberId === uidKey,
        memberPreview: { id: member?.id, name: member?.name }
      });
      return memberId && memberId === uidKey;
    });

    if (matchedMember) {
      const displayName = resolveDisplayName(matchedMember);
      console.log('[VideoCall] Exact match found:', displayName);
      return displayName;
    }

    // If no direct match found, try fuzzy matching (partial string match)
    const fuzzyMatch = groupMembers.find((member) => {
      const memberId = resolveMemberId(member);
      if (!memberId) return false;
      // Check if uid contains memberId or vice versa (handles cases where UUID is shortened)
      return memberId.includes(uidKey) || uidKey.includes(memberId);
    });

    if (fuzzyMatch) {
      const displayName = resolveDisplayName(fuzzyMatch);
      console.log('[VideoCall] Fuzzy match found:', displayName);
      return displayName;
    }

    // If still no match, return default
    console.log('[VideoCall] No match found, using default name');
    return `Thành viên ${uid}`;
  };
  
  const localVideoRef = useRef(null);
  const localScreenRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const remoteScreenRefs = useRef({});
  const callStartTime = useRef(null);

  const { startCall, endCall } = useVideoCallStore();

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);

  // Initialize call
  useEffect(() => {
    isMountedRef.current = true;
    
    // Debug: Log group members structure
    console.log('👥 Group members for video call:', groupMembers);
    
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
        const users = event.detail.users;
        console.log('[VideoCall] Remote users updated:', users);
        setRemoteUsers(users);
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
      if (video && localVideoRef.current && !isVideoMuted) {
        video.play(localVideoRef.current);
      }
    };

    if (isCallStarted) {
      playLocalVideo();
    }
  }, [isCallStarted, isVideoMuted]);

  // Play local screen share
  useEffect(() => {
    const playLocalScreen = async () => {
      try {
        const screenTrack = agoraService.getScreenTrack();
        if (screenTrack && localScreenRef.current) {
          console.log('🖥️ Playing local screen share...');
          screenTrack.play(localScreenRef.current);
        }
      } catch (error) {
        console.error('❌ Failed to play local screen:', error);
      }
    };

    if (isCallStarted && isScreenSharing) {
      playLocalScreen();
    }
  }, [isCallStarted, isScreenSharing]);

  // Play remote videos and screens
  useEffect(() => {
    remoteUsers.forEach(user => {
      try {
        // Play video track
        if (user.videoTrack && remoteVideoRefs.current[user.uid]) {
          user.videoTrack.play(remoteVideoRefs.current[user.uid]);
        }
        
        // Play screen track
        if (user.screenTrack && remoteScreenRefs.current[user.uid]) {
          console.log('🖥️ Playing remote screen share from user:', user.uid);
          user.screenTrack.play(remoteScreenRefs.current[user.uid]);
          // Set the screen share user
          if (!screenShareUser || screenShareUser.uid !== user.uid) {
            setScreenShareUser(user);
          }
        }
      } catch (error) {
        console.error('❌ Failed to play tracks for user', user.uid, error);
      }
    });

    // Check if screen share user stopped sharing
    const stillSharing = remoteUsers.find(u => u.screenTrack && u.hasScreen);
    if (!stillSharing && screenShareUser) {
      console.log('🛑 Screen share ended');
      setScreenShareUser(null);
    }
  }, [remoteUsers, screenShareUser]);

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
      
      const rawUserId = currentUser?.data?.id ?? currentUser?.id ?? currentUser?.userId;
      const preferredUid = rawUserId ? String(rawUserId) : null;
      
      // Debug logging
      console.log('👤 Current user data:', {
        userId: rawUserId,
        preferredUid: preferredUid,
        groupMembers: groupMembers?.length || 0,
        groupMemberIds: groupMembers?.map(m => ({ id: m?.id, userId: m?.userId, user: m?.user?.id }))
      });
      
      if (!preferredUid) {
        console.warn('⚠️ Falling back to Agora auto-generated UID - user id missing or invalid');
      }

      const uid = await agoraService.joinChannel(channelName, preferredUid);
      
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
    try {
      if (isScreenSharing) {
        console.log('🛑 Stopping screen share...');
        const success = await agoraService.stopScreenShare();
        if (success) {
          setIsScreenSharing(false);
        }
      } else {
        console.log('🖥️ Starting screen share...');
        const success = await agoraService.startScreenShare();
        if (success) {
          setIsScreenSharing(true);
        }
      }
    } catch (error) {
      console.error('❌ Screen share toggle failed:', error);
      toast.error('Lỗi khi thay đổi trạng thái chia sẻ màn hình');
    }
  };

  const handleInviteSent = (invitedUsers) => {
    toast.success(`Đã gửi lời mời đến ${invitedUsers.length} người 📧`);
    setShowInviteModal(false);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0);
    }
  };

  const handleNewMessage = () => {
    if (!isChatOpen) {
      setUnreadMessages(prev => prev + 1);
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
          {(isScreenSharing || screenShareUser) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                {isScreenSharing ? 'Bạn đang chia sẻ màn hình' : `${screenShareUser?.uid} đang chia sẻ màn hình`}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm font-mono">
            {formatDuration(callDuration)}
          </div>
          
          {/* Invite Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mời thêm</span>
          </motion.button>

          {/* Chat Toggle */}
          <Tooltip title={isChatOpen ? "Đóng chat" : "Mở chat"}>
            <button
              onClick={toggleChat}
              className="p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors relative"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessages > 0 && (
                <Badge 
                  count={unreadMessages} 
                  className="absolute -top-1 -right-1"
                />
              )}
            </button>
          </Tooltip>
          
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
        {/* Screen Share View - Takes Priority */}
        {(isScreenSharing || screenShareUser) && (
          <div className="absolute inset-0 bg-black">
            {/* Main Screen Share Display */}
            <div className="h-full w-full flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-7xl mx-auto">
                {/* Screen Share Video */}
                {isScreenSharing ? (
                  <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
                    <div 
                      ref={localScreenRef}
                      className="w-full h-full bg-black"
                    />
                    {!agoraService.getScreenTrack() && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Monitor className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white text-lg">Đang khởi tạo chia sẻ màn hình...</p>
                        </div>
                      </div>
                    )}
                    {/* Screen Share Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                      <Monitor className="w-5 h-5" />
                      <span className="font-medium">Bạn đang chia sẻ màn hình</span>
                      <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500 shadow-2xl shadow-purple-500/20">
                    <div 
                      ref={el => remoteScreenRefs.current[screenShareUser?.uid] = el}
                      className="w-full h-full bg-black"
                    />
                    {!screenShareUser?.screenTrack && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Monitor className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white text-lg">Đang tải chia sẻ màn hình...</p>
                        </div>
                      </div>
                    )}
                    {/* Remote Screen Share Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
                      <Monitor className="w-5 h-5" />
                      <span className="font-medium">{getUsernameByUid(screenShareUser?.uid)} đang chia sẻ màn hình</span>
                      <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Fullscreen Toggle */}
                    <Tooltip title={isScreenShareFullscreen ? "Thu nhỏ" : "Toàn màn hình"}>
                      <button
                        onClick={() => setIsScreenShareFullscreen(!isScreenShareFullscreen)}
                        className="absolute top-4 right-4 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition-colors backdrop-blur-sm"
                      >
                        {isScreenShareFullscreen ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Video Thumbnails Sidebar During Screen Share */}
            <div className={`absolute top-4 space-y-3 max-h-[calc(100%-2rem)] overflow-y-auto w-64 transition-all duration-300 ${
              isChatOpen ? 'right-[25rem]' : 'right-4'
            }`}>
              {/* Local Video Thumbnail */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-purple-500 transition-colors relative group"
              >
                <div className="aspect-video">
                  <div 
                    ref={localVideoRef}
                    className="w-full h-full bg-gray-900"
                  />
                  {isVideoMuted && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <VideoOff className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                {/* Local User Label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Bạn</span>
                    <div className={`p-1 rounded-full ${isAudioMuted ? 'bg-red-600' : 'bg-green-600'}`}>
                      {isAudioMuted ? (
                        <MicOff className="w-3 h-3 text-white" />
                      ) : (
                        <Mic className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Remote Users Thumbnails */}
              {remoteUsers.map((user, index) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-blue-500 transition-colors relative group"
                >
                  <div className="aspect-video">
                    <div 
                      ref={el => remoteVideoRefs.current[user.uid] = el}
                      className="w-full h-full bg-gray-900"
                    />
                    {!user.hasVideo && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <VideoOff className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Remote User Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">
                        {getUsernameByUid(user.uid)}
                      </span>
                      <div className={`p-1 rounded-full ${user.hasAudio ? 'bg-green-600' : 'bg-red-600'}`}>
                        {user.hasAudio ? (
                          <Mic className="w-3 h-3 text-white" />
                        ) : (
                          <MicOff className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Normal Video View - No Screen Share */}
        {!isScreenSharing && !screenShareUser && (
          <>
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
              <div className={`absolute top-4 space-y-3 max-h-96 overflow-y-auto transition-all duration-300 ${
                isChatOpen ? 'right-[25rem]' : 'right-4'
              }`}>
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
                      {getUsernameByUid(user.uid)}
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
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900/90 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <Tooltip title={isAudioMuted ? "Bật mic" : "Tắt mic"}>
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
          </Tooltip>

          {/* Video Toggle */}
          <Tooltip title={isVideoMuted ? "Bật camera" : "Tắt camera"}>
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
          </Tooltip>

          {/* Screen Share */}
          <Tooltip title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all duration-200 relative ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isScreenSharing ? (
                <>
                  <MonitorOff className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </>
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </Tooltip>

          {/* Chat Toggle */}
          <Tooltip title={isChatOpen ? "Đóng chat" : "Mở chat"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
              className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-600/25 relative"
            >
              <MessageSquare className="w-6 h-6 text-white" />
              {unreadMessages > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadMessages}
                </div>
              )}
            </motion.button>
          </Tooltip>

          {/* AI Chat Toggle */}
          <Tooltip title={isAIChatOpen ? "Đóng AI trợ lý" : "AI trợ lý"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsAIChatOpen(!isAIChatOpen);
                if (isChatOpen) setIsChatOpen(false);
              }}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg relative ${
                isAIChatOpen 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-purple-600/25' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Brain className="w-6 h-6 text-white" />
              {isAIChatOpen && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </motion.button>
          </Tooltip>

          {/* Participants Toggle */}
          <Tooltip title={showParticipants ? "Đóng danh sách" : "Người tham gia"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg relative ${
                showParticipants 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Users className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                {remoteUsers.length + 1}
              </div>
            </motion.button>
          </Tooltip>

          {/* Invite Button */}
          <Tooltip title="Mời thêm người tham gia">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowInviteModal(true)}
              className="p-4 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-600/25"
            >
              <UserPlus className="w-6 h-6 text-white" />
            </motion.button>
          </Tooltip>

          {/* End Call */}
          <Tooltip title="Kết thúc cuộc gọi">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={leaveCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/25"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
          </Tooltip>
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

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <VideoCallChat
            channelName={channelName}
            groupId={groupId}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            participants={[...remoteUsers.map(u => ({ uid: u.uid })), { uid: 'local' }]}
            onNewMessage={handleNewMessage}
          />
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isAIChatOpen && (
          <VideoCallAIChat
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
            groupId={groupId}
            groupName={groupName}
          />
        )}
      </AnimatePresence>

      {/* Participants Panel */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Người tham gia
                </h3>
                <p className="text-purple-100 text-sm mt-1">
                  {remoteUsers.length + 1} thành viên
                </p>
              </div>
              <button 
                onClick={() => setShowParticipants(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Current User */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser?.username?.substring(0, 2).toUpperCase() || 'ME'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {currentUser?.username || 'Bạn'}
                      </span>
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        Bạn
                      </span>
                      {isHost && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center gap-1 text-xs ${isAudioMuted ? 'text-red-400' : 'text-green-400'}`}>
                        {isAudioMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        {isAudioMuted ? 'Tắt mic' : 'Bật mic'}
                      </div>
                      <span className="text-gray-500">•</span>
                      <div className={`flex items-center gap-1 text-xs ${isVideoMuted ? 'text-red-400' : 'text-green-400'}`}>
                        {isVideoMuted ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {isVideoMuted ? 'Tắt cam' : 'Bật cam'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Remote Users */}
              {remoteUsers.map((user, index) => {
                const username = getUsernameByUid(user.uid);
                const initials = username.substring(0, 2).toUpperCase();
                
                return (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/50 border border-gray-700 hover:border-gray-600 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{username}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`flex items-center gap-1 text-xs ${user.hasAudio ? 'text-green-400' : 'text-red-400'}`}>
                            {user.hasAudio ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                            {user.hasAudio ? 'Bật mic' : 'Tắt mic'}
                          </div>
                          <span className="text-gray-500">•</span>
                          <div className={`flex items-center gap-1 text-xs ${user.hasVideo ? 'text-green-400' : 'text-red-400'}`}>
                            {user.hasVideo ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                            {user.hasVideo ? 'Bật cam' : 'Tắt cam'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty State */}
              {remoteUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">Chưa có người tham gia khác</p>
                  <p className="text-gray-500 text-xs mt-1">Mời bạn bè tham gia cuộc gọi</p>
                </div>
              )}
            </div>

            {/* Footer with Group Members Info */}
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <div className="text-xs text-gray-400 mb-2">Thành viên nhóm: {groupMembers?.length || 0}</div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg py-2 px-4 font-medium transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Mời thêm người
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitation Modal */}
      <Modal
        title={null}
        open={showInviteModal}
        onCancel={() => setShowInviteModal(false)}
        footer={null}
        width={700}
        destroyOnClose={true}
        className="z-[60]"
      >
        <InvitationModal
          groupId={channelName}
          groupName={groupName}
          members={groupMembers}
          activeCall={{
            channelName,
            groupName,
            participants: groupMembers,
            isHost
          }}
          onInviteSent={handleInviteSent}
          onCancel={() => setShowInviteModal(false)}
        />
      </Modal>
    </div>
  );
};

export default VideoCall;