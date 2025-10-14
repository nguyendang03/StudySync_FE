import AgoraRTC from 'agora-rtc-sdk-ng';
import toast from 'react-hot-toast';

class AgoraService {
  constructor() {
    this.client = null;
    this.localVideoTrack = null;
    this.localAudioTrack = null;
    this.localScreenTrack = null;
    this.isScreenSharing = false;
    this.remoteUsers = new Map();
    this.appId = import.meta.env.VITE_AGORA_APP_ID;
    this.useToken = import.meta.env.VITE_AGORA_USE_TOKEN === 'true';
    this.tokenServer = import.meta.env.VITE_AGORA_TOKEN_SERVER;
    this.isInitialized = false;
    this.isJoining = false;
    
    // Validate App ID
    if (!this.appId) {
      console.error('VITE_AGORA_APP_ID is not configured in environment variables');
    }
  }

  // Initialize Agora client
  async init() {
    try {
      if (!this.appId) {
        throw new Error('Agora App ID is not configured. Please check your .env file.');
      }

      if (this.isInitialized && this.client) {
        console.log('Agora client already initialized');
        return true;
      }

      console.log('Initializing Agora client with App ID:', this.appId);
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // Set up event listeners
      this.client.on('user-published', this.handleUserPublished.bind(this));
      this.client.on('user-unpublished', this.handleUserUnpublished.bind(this));
      this.client.on('user-left', this.handleUserLeft.bind(this));
      this.client.on('connection-state-change', (curState, prevState) => {
        console.log('Agora connection state changed:', { prevState, curState });
      });
      
      this.isInitialized = true;
      console.log('Agora client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Agora client:', error);
      toast.error('Không thể khởi tạo video call: ' + error.message);
      this.isInitialized = false;
      return false;
    }
  }

  // Join a channel (with improved error handling)
  async joinChannel(channelName, uid = null) {
    try {
      if (this.isJoining) {
        console.log('⏳ Already joining a channel, waiting...');
        // Wait for current join to complete instead of aborting
        let attempts = 0;
        while (this.isJoining && attempts < 30) { // Wait up to 3 seconds
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (this.isJoining) {
          throw new Error('Join operation timed out');
        }
      }

      this.isJoining = true;
      console.log('🎯 Starting join process for channel:', channelName);

      // Validate inputs
      if (!channelName) {
        throw new Error('Channel name is required');
      }

      if (!this.appId) {
        throw new Error('App ID is not configured');
      }

      // Initialize if needed
      if (!this.client || !this.isInitialized) {
        console.log('🔧 Initializing Agora client...');
        const initSuccess = await this.init();
        if (!initSuccess) {
          throw new Error('Failed to initialize Agora client');
        }
      }

      // Use App ID only (no token) for simplicity
      console.log('📞 Joining channel with App ID only:', this.appId.substring(0, 8) + '...');
      
      // Join the channel with null token (App ID only mode)
      const actualUid = await this.client.join(this.appId, channelName, null, uid);
      console.log('✅ Successfully joined channel with UID:', actualUid);
      
      // Create local tracks (with better error handling)
      console.log('🎥 Creating local tracks...');
      try {
        await this.createLocalTracks();
      } catch (trackError) {
        console.warn('⚠️ Track creation failed, continuing without media:', trackError.message);
        // Continue without throwing - we can still join the call
      }
      
      // Publish available tracks
      const tracksToPublish = [];
      if (this.localVideoTrack) tracksToPublish.push(this.localVideoTrack);
      if (this.localAudioTrack) tracksToPublish.push(this.localAudioTrack);
      
      if (tracksToPublish.length > 0) {
        console.log(`📡 Publishing ${tracksToPublish.length} track(s)...`);
        await this.client.publish(tracksToPublish);
        console.log('✅ Tracks published successfully');
      } else {
        console.log('📵 No tracks to publish, but connection established');
      }

      this.isJoining = false;
      console.log('🎉 Join process completed successfully!');
      toast.success('Đã tham gia cuộc gọi video');
      return actualUid;
      
    } catch (error) {
      this.isJoining = false;
      console.error('❌ Join channel failed:', error);
      
      // Only cleanup if it's not an abort error
      if (!error.message.includes('cancel') && !error.message.includes('abort')) {
        console.log('🧹 Cleaning up after error...');
        await this.cleanup();
      }
      
      const errorMessage = this.getErrorMessage(error);
      toast.error('Không thể tham gia cuộc gọi: ' + errorMessage);
      throw error;
    }
  }

  // Leave channel
  async leaveChannel() {
    try {
      console.log('Leaving channel...');
      await this.cleanup();
      toast.success('Đã rời khỏi cuộc gọi video');
    } catch (error) {
      console.error('Failed to leave channel:', error);
      toast.error('Lỗi khi rời khỏi cuộc gọi');
    }
  }

  // Cleanup method
  async cleanup() {
    try {
      // Stop and close local tracks
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      if (this.localScreenTrack) {
        this.localScreenTrack.stop();
        this.localScreenTrack.close();
        this.localScreenTrack = null;
      }

      // Leave the channel
      if (this.client && this.client.connectionState !== 'DISCONNECTED') {
        await this.client.leave();
      }

      // Clear remote users
      this.remoteUsers.clear();
      
      // Reset flags
      this.isJoining = false;
      this.isScreenSharing = false;
      
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Helper to get user-friendly error messages
  getErrorMessage(error) {
    if (error.code === 'INVALID_APP_ID') {
      return 'App ID không hợp lệ. Vui lòng kiểm tra cấu hình.';
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
    } else if (error.message.includes('permission') || error.code === 'PERMISSION_DENIED') {
      return 'Vui lòng cho phép truy cập camera và microphone.';
    } else if (error.message.includes('cancel') || error.message.includes('abort')) {
      return 'Đã hủy kết nối.';
    }
    return error.message || 'Lỗi không xác định';
  }

  // Create local audio and video tracks (simplified)
  async createLocalTracks() {
    try {
      console.log('🎤📹 Requesting camera and microphone access...');
      
      // Use simpler configuration for better compatibility
      const audioConfig = { encoderConfig: "standard" };
      const videoConfig = {
        encoderConfig: {
          width: 640,
          height: 480,
          frameRate: 15,
        },
      };

      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        audioConfig,
        videoConfig
      );
      
      console.log('✅ Local tracks created successfully!');
      console.log('🎤 Audio:', this.localAudioTrack ? 'Ready' : 'Failed');
      console.log('📹 Video:', this.localVideoTrack ? 'Ready' : 'Failed');
      
      return { audio: this.localAudioTrack, video: this.localVideoTrack };
    } catch (error) {
      console.error('❌ Failed to create local tracks:', error);
      
      // Don't show toast here as it's handled in joinChannel
      throw error;
    }
  }

  // Mute/Unmute audio
  async toggleAudio(mute = null) {
    try {
      if (!this.localAudioTrack) return false;
      
      const isMuted = mute !== null ? mute : this.localAudioTrack.muted;
      
      if (isMuted) {
        await this.localAudioTrack.setMuted(false);
      } else {
        await this.localAudioTrack.setMuted(true);
      }
      
      return !isMuted;
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      return false;
    }
  }

  // Mute/Unmute video
  async toggleVideo(mute = null) {
    try {
      if (!this.localVideoTrack) return false;
      
      const isMuted = mute !== null ? mute : this.localVideoTrack.muted;
      
      if (isMuted) {
        await this.localVideoTrack.setMuted(false);
      } else {
        await this.localVideoTrack.setMuted(true);
      }
      
      return !isMuted;
    } catch (error) {
      console.error('Failed to toggle video:', error);
      return false;
    }
  }

  // Handle remote user published
  handleUserPublished = async (user, mediaType) => {
    try {
      await this.client.subscribe(user, mediaType);
      
      const existingUser = this.remoteUsers.get(user.uid) || { uid: user.uid };
      
      if (mediaType === 'video') {
        // Check if this is a screen share track
        const isScreenTrack = user.videoTrack && user.videoTrack.getMediaStreamTrack().label.includes('screen');
        
        if (isScreenTrack) {
          existingUser.screenTrack = user.videoTrack;
          existingUser.hasScreen = true;
        } else {
          existingUser.videoTrack = user.videoTrack;
          existingUser.hasVideo = true;
        }
      } else if (mediaType === 'audio') {
        existingUser.audioTrack = user.audioTrack;
        existingUser.hasAudio = true;
      }
      
      this.remoteUsers.set(user.uid, existingUser);
      
      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('agoraUserUpdated', { 
        detail: { users: Array.from(this.remoteUsers.values()) }
      }));
      
    } catch (error) {
      console.error('Failed to handle user published:', error);
    }
  };

  // Handle remote user unpublished
  handleUserUnpublished = (user, mediaType) => {
    const existingUser = this.remoteUsers.get(user.uid);
    if (existingUser) {
      if (mediaType === 'video') {
        // Check if it was a screen track
        if (existingUser.screenTrack) {
          existingUser.hasScreen = false;
          existingUser.screenTrack = null;
        } else {
          existingUser.hasVideo = false;
          existingUser.videoTrack = null;
        }
      } else if (mediaType === 'audio') {
        existingUser.hasAudio = false;
        existingUser.audioTrack = null;
      }
      
      this.remoteUsers.set(user.uid, existingUser);
    }
    
    // Trigger custom event for UI updates
    window.dispatchEvent(new CustomEvent('agoraUserUpdated', { 
      detail: { users: Array.from(this.remoteUsers.values()) }
    }));
  };

  // Handle remote user left
  handleUserLeft = (user) => {
    this.remoteUsers.delete(user.uid);
    
    // Trigger custom event for UI updates
    window.dispatchEvent(new CustomEvent('agoraUserUpdated', { 
      detail: { users: Array.from(this.remoteUsers.values()) }
    }));
  };

  // Get local tracks
  getLocalTracks() {
    return {
      audio: this.localAudioTrack,
      video: this.localVideoTrack,
      screen: this.localScreenTrack
    };
  }

  // Get remote users
  getRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  // Screen sharing - improved implementation
  async startScreenShare() {
    try {
      console.log('🖥️ Starting screen share...');
      
      // Create screen video track
      this.localScreenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: {
          width: 1920,
          height: 1080,
          frameRate: 15,
          bitrateMin: 1000,
          bitrateMax: 3000,
        },
      });
      
      // Unpublish current video track (keep it for later)
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
        console.log('📹 Unpublished camera track');
      }
      
      // Publish screen track
      await this.client.publish(this.localScreenTrack);
      this.isScreenSharing = true;
      
      // Listen for screen share end (when user stops sharing via browser)
      this.localScreenTrack.on('track-ended', () => {
        console.log('🖥️ Screen share ended by user');
        this.stopScreenShare().catch(console.error);
      });
      
      console.log('✅ Screen share started successfully');
      toast.success('Đã bắt đầu chia sẻ màn hình');
      return true;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      
      if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
        toast.error('Bạn đã từ chối chia sẻ màn hình');
      } else if (error.message.includes('NotSupportedError')) {
        toast.error('Trình duyệt không hỗ trợ chia sẻ màn hình');
      } else {
        toast.error('Không thể chia sẻ màn hình: ' + error.message);
      }
      return false;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    try {
      console.log('🛑 Stopping screen share...');
      
      // Unpublish and close screen track
      if (this.localScreenTrack) {
        await this.client.unpublish(this.localScreenTrack);
        this.localScreenTrack.stop();
        this.localScreenTrack.close();
        this.localScreenTrack = null;
      }
      
      // Republish camera track if it exists
      if (this.localVideoTrack) {
        await this.client.publish(this.localVideoTrack);
        console.log('📹 Republished camera track');
      } else {
        // Create new camera track if needed
        try {
          this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
              width: 640,
              height: 480,
              frameRate: 15,
            },
          });
          await this.client.publish(this.localVideoTrack);
          console.log('📹 Created and published new camera track');
        } catch (cameraError) {
          console.warn('⚠️ Could not create camera track:', cameraError.message);
        }
      }
      
      this.isScreenSharing = false;
      console.log('✅ Screen share stopped successfully');
      toast.success('Đã dừng chia sẻ màn hình');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop screen share:', error);
      toast.error('Lỗi khi dừng chia sẻ màn hình: ' + error.message);
      return false;
    }
  }

  // Get screen track
  getScreenTrack() {
    return this.localScreenTrack;
  }

  // Check if currently screen sharing
  isCurrentlyScreenSharing() {
    return this.isScreenSharing && !!this.localScreenTrack;
  }

  // Add method to check if service is ready
  isReady() {
    return this.isInitialized && this.client && this.appId;
  }

  // Get connection state
  getConnectionState() {
    return this.client ? this.client.connectionState : 'DISCONNECTED';
  }
}

// Create singleton instance
const agoraService = new AgoraService();
export default agoraService;