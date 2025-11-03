import API_BASE_URL from '../config/api.js';

class AiChatHistoryService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get auth headers with token
   */
  getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Save chat history to backend
   * @param {string} query - User query
   * @param {string} response - AI response
   * @returns {Promise<Object>}
   */
  async saveHistory(query, response) {
    try {
      const res = await fetch(`${this.baseURL}/ai-chat/save-history`, {
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
      const res = await fetch(
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
      const res = await fetch(`${this.baseURL}/ai-chat/history/${id}`, {
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
      const res = await fetch(`${this.baseURL}/ai-chat/history/${id}`, {
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
      const res = await fetch(`${this.baseURL}/ai-chat/history/clear/all`, {
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
      const res = await fetch(`${this.baseURL}/ai-chat/usage`, {
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

