import AgoraRTC from 'agora-rtc-sdk-ng';
import toast from 'react-hot-toast';

class AgoraService {
  constructor() {
    this.client = null;
    this.localVideoTrack = null;
    this.localAudioTrack = null;
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

      // Leave the channel
      if (this.client && this.client.connectionState !== 'DISCONNECTED') {
        await this.client.leave();
      }

      // Clear remote users
      this.remoteUsers.clear();
      
      // Reset flags
      this.isJoining = false;
      
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
      
      if (mediaType === 'video') {
        this.remoteUsers.set(user.uid, { ...user, hasVideo: true });
      } else if (mediaType === 'audio') {
        const existingUser = this.remoteUsers.get(user.uid) || {};
        this.remoteUsers.set(user.uid, { ...existingUser, ...user, hasAudio: true });
      }
      
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
        existingUser.hasVideo = false;
        existingUser.videoTrack = null;
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
      video: this.localVideoTrack
    };
  }

  // Get remote users
  getRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  // Screen sharing
  async startScreenShare() {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      
      // Replace video track with screen share
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
      }
      
      this.localVideoTrack = screenTrack;
      await this.client.publish(screenTrack);
      
      toast.success('Đã bắt đầu chia sẻ màn hình');
      return true;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      toast.error('Không thể chia sẻ màn hình');
      return false;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    try {
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
      }
      
      // Create new camera track
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      await this.client.publish(this.localVideoTrack);
      
      toast.success('Đã dừng chia sẻ màn hình');
      return true;
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      toast.error('Lỗi khi dừng chia sẻ màn hình');
      return false;
    }
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