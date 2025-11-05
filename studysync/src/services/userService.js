import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class UserService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  getHeaders() {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  async fetchWithAuth(url, options = {}) {
    try {
      const response = await fetch(url, options);

      if (response.status === 401 && !this.isRefreshing) {
        console.log('🔄 User Service: 401 detected, attempting token refresh...');

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
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
          await authService.refreshToken();
          console.log('✅ User Service: Token refresh successful');
          this.processQueue(null, authService.getAccessToken());
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${authService.getAccessToken()}`
            }
          });
          return retryResponse;
        } catch (refreshError) {
          console.error('❌ User Service: Token refresh failed', refreshError);
          this.processQueue(refreshError, null);
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
      console.error('❌ User Service: Fetch error', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/users/me/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`Failed to get profile: ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>}
   */
  async updateProfile(profileData) {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/users/me/profile`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update profile: ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Update password
   * @param {Object} passwordData - { oldPassword, newPassword }
   * @returns {Promise<Object>}
   */
  async updatePassword(passwordData) {
    try {
      const res = await this.fetchWithAuth(`${this.baseURL}/users/me/password`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update password: ${res.status}`);
      }

      const data = await res.json();
      return data.data || data;
    } catch (error) {
      console.error('❌ Error updating password:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;

