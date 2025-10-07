import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  }

  // Initialize socket connection
  connect(userId, channelName) {
    if (this.socket && this.isConnected) {
      console.log('⚡ Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to socket server...', this.serverUrl);

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        userId: userId,
        channelName: channelName
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners(channelName);

    return this.socket;
  }

  // Set up socket event listeners
  setupEventListeners(channelName) {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.isConnected = true;
      
      // Join the channel room
      this.socket.emit('join-channel', { channelName });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      toast.error('Không thể kết nối chat server');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Đã kết nối lại chat');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔴 Socket reconnection failed');
      toast.error('Không thể kết nối lại chat server');
    });
  }

  // Send a message to the channel
  sendMessage(channelName, message, userId, userName) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      toast.error('Chưa kết nối chat server');
      return;
    }

    const messageData = {
      channelName,
      message,
      userId,
      userName,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.socket.emit('send-message', messageData);
    console.log('📤 Message sent:', messageData);
  }

  // Listen for incoming messages
  onMessage(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('receive-message', (messageData) => {
      console.log('📥 Message received:', messageData);
      callback(messageData);
    });
  }

  // Listen for user joined events
  onUserJoined(callback) {
    if (!this.socket) return;

    this.socket.on('user-joined', (data) => {
      console.log('👋 User joined:', data);
      callback(data);
    });
  }

  // Listen for user left events
  onUserLeft(callback) {
    if (!this.socket) return;

    this.socket.on('user-left', (data) => {
      console.log('👋 User left:', data);
      callback(data);
    });
  }

  // Send typing indicator
  sendTyping(channelName, userId, userName, isTyping) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      channelName,
      userId,
      userName,
      isTyping
    });
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;

    this.socket.on('user-typing', (data) => {
      callback(data);
    });
  }

  // Leave channel
  leaveChannel(channelName) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('leave-channel', { channelName });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
