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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh if needed
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          const newToken = response.accessToken;
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(error.config);
        } catch (refreshError) {
          authService.logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

class NotificationService {
  /**
   * Get all notifications for the current user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {boolean} params.isRead - Filter by read status
   * @param {Array<string>} params.types - Filter by notification types
   */
  async getNotifications(params = {}) {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark specific notifications as read
   * @param {Array<number>} notificationIds - Array of notification IDs to mark as read
   */
  async markAsRead(notificationIds) {
    try {
      const response = await axiosInstance.patch('/notifications/mark-as-read', {
        notificationIds
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await axiosInstance.patch('/notifications/mark-all-as-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get chat notifications
   * @param {Object} params - Query parameters
   */
  async getChatNotifications(params = {}) {
    try {
      const response = await axiosInstance.get('/notifications/chat', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat notifications:', error);
      throw error;
    }
  }

  /**
   * Get system notifications
   * @param {Object} params - Query parameters
   */
  async getSystemNotifications(params = {}) {
    try {
      const response = await axiosInstance.get('/notifications/system', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching system notifications:', error);
      throw error;
    }
  }

  /**
   * Get chat unread count
   */
  async getChatUnreadCount() {
    try {
      const response = await axiosInstance.get('/notifications/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat unread count:', error);
      throw error;
    }
  }

  /**
   * Get system unread count
   */
  async getSystemUnreadCount() {
    try {
      const response = await axiosInstance.get('/notifications/system/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching system unread count:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID to delete
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();


