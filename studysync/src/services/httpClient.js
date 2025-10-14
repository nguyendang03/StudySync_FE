import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

class HttpClient {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.failedQueue = [];
  }

  async request(url, options = {}) {
    const token = authService.getAccessToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      // Don't attempt refresh for auth endpoints or if already refreshing the same request
      if (response.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
        return this.handleTokenRefresh(url, config);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async handleTokenRefresh(originalUrl, originalConfig) {
    console.log('🔄 HttpClient: 401 detected for:', originalUrl);
    console.log('  Current tokens state:');
    console.log('    - accessToken:', authService.getAccessToken()?.substring(0, 30) + '...' || 'MISSING');
    console.log('    - refreshToken:', authService.getRefreshToken()?.substring(0, 30) + '...' || 'MISSING');

    if (this.isRefreshing) {
      console.log('⏳ HttpClient: Already refreshing, queuing request...');
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        // Retry with new token
        return fetch(`${API_BASE_URL}${originalUrl}`, {
          ...originalConfig,
          headers: {
            ...originalConfig.headers,
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        });
      });
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 HttpClient: Starting token refresh...');
      await authService.refreshToken();
      
      console.log('✅ HttpClient: Token refresh successful, processing queued requests');
      // Process any queued requests
      this.failedQueue.forEach(({ resolve }) => resolve());
      this.failedQueue = [];

      // Retry original request with new token
      const retryConfig = {
        ...originalConfig,
        headers: {
          ...originalConfig.headers,
          Authorization: `Bearer ${authService.getAccessToken()}`,
        },
      };
      
      return fetch(`${API_BASE_URL}${originalUrl}`, retryConfig);
      
    } catch (refreshError) {
      console.error('❌ HttpClient: Token refresh failed, logging out');
      
      // Reject all queued requests
      this.failedQueue.forEach(({ reject }) => reject(refreshError));
      this.failedQueue = [];
      
      // Logout and redirect
      authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Session expired');
    } finally {
      this.isRefreshing = false;
    }
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

export default new HttpClient();