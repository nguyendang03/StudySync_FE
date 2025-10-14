import axios from 'axios';
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
