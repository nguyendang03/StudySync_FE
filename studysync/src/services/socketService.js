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

    console.log('🔌 Connecting to chat socket server...', this.serverUrl + '/chat');

    // Connect to /chat namespace
    this.socket = io(this.serverUrl + '/chat', {
      transports: ['websocket', 'polling'],
      auth: {
        userId: userId
      },
      query: {
        userId: userId
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
      console.log('✅ Socket connected to /chat namespace');
      this.isConnected = true;
      
      // Auto-join channel if provided
      if (channelName) {
        // channelName is actually the groupId for chat
        this.joinGroup(channelName);
      }
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
      
      // Rejoin channel after reconnection
      if (channelName) {
        this.joinGroup(channelName);
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔴 Socket reconnection failed');
      toast.error('Không thể kết nối lại chat server');
    });
  }

  // Join a group chat room
  joinGroup(groupId) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected, cannot join group');
      return;
    }

    console.log('🚪 Joining group:', groupId);
    this.socket.emit('chat:join', { groupId: parseInt(groupId) }, (response) => {
      if (response) {
        console.log('✅ Join group response:', response);
      }
    });
    
    // Also listen for the join confirmation
    this.socket.once('chat:joined', (data) => {
      console.log('✅ Successfully joined group room:', data);
    });
  }

  // Leave a group chat room
  leaveGroup(groupId) {
    if (!this.socket || !this.isConnected) return;

    console.log('🚪 Leaving group:', groupId);
    this.socket.emit('chat:leave', { groupId: parseInt(groupId) });
  }

  // Send a message to the channel (using WebSocket)
  sendMessage(channelName, message, userId, userName) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      toast.error('Chưa kết nối chat server');
      return;
    }

    const groupId = parseInt(channelName); // channelName is actually groupId
    
    const messageData = {
      groupId,
      message: {
        content: message
        // type is optional and defaults to 'text' in backend
      }
    };

    console.log('📤 Sending message via socket:', messageData);
    this.socket.emit('chat:send', messageData);
  }

  // Listen for incoming messages
  onMessage(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    // Remove existing listener to prevent duplicates
    this.socket.off('chat:message');
    
    console.log('📡 Setting up new chat:message listener');

    this.socket.on('chat:message', (data) => {
      console.log('📥 Message received via socket:', data);
      
      // Transform backend message format to UI format
      const msg = data.message;
      const transformedMessage = {
        id: msg.id,
        userId: msg.senderId || msg.sender?.id,
        userName: msg.sender?.username || msg.sender?.name || msg.sender?.email?.split('@')[0] || 'User',
        message: msg.content,
        timestamp: new Date(msg.createdAt).getTime(),
        type: msg.type === 'system' ? 'system' : 'message',
        isEdited: msg.isEdited
      };
      
      console.log('✅ Transformed message for UI:', transformedMessage);
      callback(transformedMessage);
    });
  }

  // Listen for user joined events
  onUserJoined(callback) {
    if (!this.socket) return;

    this.socket.on('user:joined', (data) => {
      console.log('👋 User joined:', data);
      callback(data);
    });
  }

  // Listen for user left events
  onUserLeft(callback) {
    if (!this.socket) return;

    this.socket.on('user:left', (data) => {
      console.log('👋 User left:', data);
      callback(data);
    });
  }

  // Send typing indicator
  sendTyping(channelName, userId, userName, isTyping) {
    if (!this.socket || !this.isConnected) return;

    const groupId = parseInt(channelName);
    this.socket.emit('chat:typing', {
      groupId,
      isTyping
    });
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;

    this.socket.on('user:typing', (data) => {
      callback(data);
    });
  }

  // Leave channel
  leaveChannel(channelName) {
    if (!this.socket || !this.isConnected) return;

    const groupId = parseInt(channelName);
    this.leaveGroup(groupId);
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
