import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

class HttpClient {
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
      
      if (response.status === 401) {
        // Try to refresh token
        try {
          await authService.refreshToken();
          // Retry the original request
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${authService.getAccessToken()}`,
            },
          };
          return fetch(`${API_BASE_URL}${url}`, retryConfig);
        } catch (refreshError) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      return response;
    } catch (error) {
      throw error;
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

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

export default new HttpClient();