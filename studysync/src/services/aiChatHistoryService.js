import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

class AiChatHistoryService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Get auth headers with token
   */
  getHeaders() {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Process failed request queue after token refresh
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Wrapper for fetch with automatic token refresh on 401
   */
  async fetchWithAuth(url, options = {}) {
    try {
      const response = await fetch(url, options);

      // If 401 and not already refreshing, try to refresh token
      if (response.status === 401 && !this.isRefreshing) {
        console.log('🔄 AI Chat History: 401 detected, attempting token refresh...');
        
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry with new token
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${authService.getAccessToken()}`
              }
            });
          });
        }

        this.isRefreshing = true;

        try {
          // Attempt token refresh
          await authService.refreshToken();
          console.log('✅ AI Chat History: Token refresh successful');
          
          // Process queued requests
          this.processQueue(null, authService.getAccessToken());

          // Retry original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${authService.getAccessToken()}`
            }
          });

          return retryResponse;
        } catch (refreshError) {
          console.error('❌ AI Chat History: Token refresh failed', refreshError);
          this.processQueue(refreshError, null);
          
          // Logout user
          authService.logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please login again.');
        } finally {
          this.isRefreshing = false;
        }
      }

      return response;
    } catch (error) {
      console.error('❌ AI Chat History: Fetch error', error);
      throw error;
    }
  }

  /**
   * Save chat history to backend
   * @param {string} query - User query
   * @param {string} response - AI response
   * @returns {Promise<Object>}
   */
  async saveHistory(query, response) {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/ai-chat/save-history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          response
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to save history: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error saving chat history:', error);
      throw error;
    }
  }

  /**
   * Get chat history with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} - { items, total, page, limit }
   */
  async getHistory(page = 1, limit = 20) {
    try {
      const res = await this.fetchWithAuth(
        `${this.baseURL}/ai-chat/history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to get history: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
      throw error;
    }
  }

  /**
   * Get specific chat history by ID
   * @param {number} id - History ID
   * @returns {Promise<Object>}
   */
  async getHistoryById(id) {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/ai-chat/history/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to get history: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error fetching chat history by ID:', error);
      throw error;
    }
  }

  /**
   * Delete chat history by ID
   * @param {number} id - History ID
   * @returns {Promise<Object>}
   */
  async deleteHistory(id) {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/ai-chat/history/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to delete history: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error deleting chat history:', error);
      throw error;
    }
  }

  /**
   * Clear all chat history
   * @returns {Promise<Object>}
   */
  async clearAllHistory() {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/ai-chat/history/clear/all`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to clear history: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error clearing chat history:', error);
      throw error;
    }
  }

  /**
   * Get AI usage statistics
   * @returns {Promise<Object>}
   */
  async getUsage() {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/ai-chat/usage`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to get usage: ${res.status}`);
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('❌ Error fetching AI usage:', error);
      throw error;
    }
  }

  /**
   * Format history items for display in conversation list
   * @param {Array} historyItems - Array of history items from backend
   * @returns {Array} - Formatted conversations
   */
  formatHistoryForDisplay(historyItems) {
    return historyItems.map(item => ({
      id: item.id,
      title: this.generateTitle(item.queryText),
      lastMessage: item.queryText,
      time: this.formatTime(item.createdAt),
      isActive: false,
      category: 'history',
      messageCount: 2, // Query + Response
      fullQuery: item.queryText,
      fullResponse: item.responseText,
      timestamp: item.createdAt
    }));
  }

  /**
   * Generate a short title from query text
   * @param {string} query - Query text
   * @returns {string}
   */
  generateTitle(query) {
    if (query.length <= 40) return query;
    return query.substring(0, 37) + '...';
  }

  /**
   * Format timestamp to relative time
   * @param {string} timestamp - ISO timestamp
   * @returns {string}
   */
  formatTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

const aiChatHistoryService = new AiChatHistoryService();
export default aiChatHistoryService;

