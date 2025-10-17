import axios from 'axios';
import io from 'socket.io-client';
import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshToken();
        const newToken = authService.getAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class ChatService {
  constructor() {
    this.socket = null;
    this.currentGroupId = null;
    // For REST API
    this.serverUrl = API_BASE_URL;
    // For WebSocket - remove /api/v1 from base URL
    this.wsUrl = API_BASE_URL.replace(/\/api\/v[0-9]+\/?$/, '');
    console.log('🔧 ChatService initialized:', { 
      serverUrl: this.serverUrl, 
      wsUrl: this.wsUrl 
    });
  }

  // ==================== WebSocket Methods ====================

  /**
   * Connect to WebSocket chat server
   * @param {number} userId - User ID
   * @param {number} groupId - Group ID to join
   * @returns {Socket} Socket instance
   */
  connect(userId, groupId) {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to chat WebSocket...', { userId, groupId });
    console.log('🔌 WebSocket URL:', this.wsUrl);
    
    // Connect to /chat namespace
    // Make sure wsUrl doesn't have trailing slash
    const wsUrl = this.wsUrl.replace(/\/$/, '');
    const chatUrl = `${wsUrl}/chat`;
    
    console.log('🔌 Connecting to:', chatUrl);
    
    this.socket = io(chatUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId: parseInt(userId)
      },
      query: {
        userId: parseInt(userId)
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      
      // Join the group room
      if (groupId) {
        this.joinGroup(groupId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('❌ Error details:', error.message);
    });

    return this.socket;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentGroupId = null;
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Join a group chat room
   * @param {number} groupId - Group ID
   */
  joinGroup(groupId) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.currentGroupId = parseInt(groupId);
    console.log('🚪 Joining group:', this.currentGroupId);

    // Emit join event with callback for confirmation
    this.socket.emit('chat:join', { groupId: this.currentGroupId }, (response) => {
      if (response) {
        console.log('✅ Join group response:', response);
      }
    });

    // Listen for join confirmation
    this.socket.once('chat:joined', (data) => {
      console.log('✅ Successfully joined group room:', data);
    });
  }

  /**
   * Leave current group
   * @param {number} groupId - Group ID
   */
  leaveGroup(groupId) {
    if (!this.socket) return;

    console.log('🚪 Leaving group:', groupId);
    this.socket.emit('chat:leave', { groupId: parseInt(groupId) });
    
    if (this.currentGroupId === groupId) {
      this.currentGroupId = null;
    }
  }

  /**
   * Send message via WebSocket
   * @param {number} groupId - Group ID
   * @param {string} content - Message content
   */
  sendMessageViaSocket(groupId, content) {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    const messageData = {
      groupId: parseInt(groupId),
      message: {
        content: content
      }
    };

    console.log('📤 Sending message via WebSocket:', messageData);
    this.socket.emit('chat:send', messageData);
  }

  /**
   * Listen for incoming messages
   * @param {Function} callback - Callback function to handle messages
   */
  onMessage(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    // Remove existing listener to prevent duplicates
    this.socket.off('chat:message');
    
    console.log('📡 Setting up new chat:message listener');

    this.socket.on('chat:message', (data) => {
      console.log('📥 Message received via WebSocket:', data);
      
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

  /**
   * Listen for typing indicators
   * @param {Function} callback - Callback function
   */
  onTyping(callback) {
    if (!this.socket) return;

    this.socket.on('user:typing', (data) => {
      console.log('⌨️ User typing:', data);
      callback(data);
    });
  }

  /**
   * Send typing indicator
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @param {string} userName - User name
   * @param {boolean} isTyping - Is typing
   */
  sendTyping(groupId, userId, userName, isTyping) {
    if (!this.socket) return;

    this.socket.emit('user:typing', {
      groupId: parseInt(groupId),
      userId,
      userName,
      isTyping
    });
  }

  /**
   * Listen for user joined events
   * @param {Function} callback - Callback function
   */
  onUserJoined(callback) {
    if (!this.socket) return;

    this.socket.on('user:joined', (data) => {
      console.log('👋 User joined:', data);
      callback(data);
    });
  }

  /**
   * Listen for user left events
   * @param {Function} callback - Callback function
   */
  onUserLeft(callback) {
    if (!this.socket) return;

    this.socket.on('user:left', (data) => {
      console.log('👋 User left:', data);
      callback(data);
    });
  }

  // ==================== REST API Methods ====================

  /**
   * Send a message to a group chat
   * @param {number} groupId - Group ID
   * @param {string|Object} contentOrData - Message content string or data object
   * @returns {Promise<Object>} Sent message data
   */
  async sendMessage(groupId, contentOrData) {
    try {
      // Handle both string content and object format
      // Backend expects: { content: string }
      const messageData = typeof contentOrData === 'string' 
        ? { content: contentOrData }
        : { content: contentOrData.content || contentOrData.message };
      
      console.log('📤 Sending message to group:', groupId, messageData);
      const response = await axiosInstance.post(
        `/groups/${groupId}/chat/messages`,
        messageData
      );
      console.log('✅ Message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get chat messages for a group
   * @param {number} groupId - Group ID
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of messages to fetch
   * @param {number} params.offset - Offset for pagination
   * @returns {Promise<Object>} Messages data with pagination
   */
  async getMessages(groupId, params = {}) {
    try {
      console.log('📥 Fetching messages for group:', groupId, params);
      const response = await axiosInstance.get(
        `/groups/${groupId}/chat/messages`,
        { params }
      );
      console.log('✅ Messages fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific message by ID
   * @param {number} groupId - Group ID
   * @param {number} messageId - Message ID
   * @returns {Promise<Object>} Message data
   */
  async getMessageById(groupId, messageId) {
    try {
      console.log('📥 Fetching message:', groupId, messageId);
      const response = await axiosInstance.get(
        `/groups/${groupId}/chat/messages/${messageId}`
      );
      console.log('✅ Message fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching message:', error);
      throw error;
    }
  }

  /**
   * Update a message
   * @param {number} groupId - Group ID
   * @param {number} messageId - Message ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.content - New message content
   * @returns {Promise<Object>} Updated message data
   */
  async updateMessage(groupId, messageId, updateData) {
    try {
      console.log('✏️ Updating message:', groupId, messageId, updateData);
      const response = await axiosInstance.put(
        `/groups/${groupId}/chat/messages/${messageId}`,
        updateData
      );
      console.log('✅ Message updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   * @param {number} groupId - Group ID
   * @param {number} messageId - Message ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteMessage(groupId, messageId) {
    try {
      console.log('🗑️ Deleting message:', groupId, messageId);
      const response = await axiosInstance.delete(
        `/groups/${groupId}/chat/messages/${messageId}`
      );
      console.log('✅ Message deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get unread message count for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(groupId) {
    try {
      console.log('📊 Fetching unread count for group:', groupId);
      const response = await axiosInstance.get(
        `/groups/${groupId}/chat/unread-count`
      );
      console.log('✅ Unread count fetched:', response.data);
      return response.data?.data?.count || 0;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   * @param {number} groupId - Group ID
   * @param {number} messageId - Last read message ID
   * @returns {Promise<Object>} Result
   */
  async markAsRead(groupId, messageId) {
    try {
      console.log('✓ Marking messages as read:', groupId, messageId);
      const response = await axiosInstance.post(
        `/groups/${groupId}/chat/messages/${messageId}/read`
      );
      console.log('✅ Messages marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }
}

const chatService = new ChatService();
export default chatService;
