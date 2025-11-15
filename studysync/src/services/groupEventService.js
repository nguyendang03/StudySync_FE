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
  (response) => response,
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

class GroupEventService {
  /**
   * Create a new group event
   * @param {Object} eventData
   * @returns {Promise<Object>} created event
   */
  async createEvent(eventData) {
    try {
      console.log('📤 Creating group event:', eventData);
      const response = await axiosInstance.post('/events', eventData);
      console.log('📥 Create event response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get events with optional filters
   * @param {Object} filters - { groupId, eventType, startDate, endDate }
   * @returns {Promise<Array>} events list
   */
  async getEvents(filters = {}) {
    try {
      console.log('📥 Fetching events with filters:', filters);
      const response = await axiosInstance.get('/events', { params: filters });
      console.log('✅ Events fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch events';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get event details by id
   * @param {string} eventId
   * @returns {Promise<Object>} event detail
   */
  async getEventById(eventId) {
    try {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching event detail:', error);
      throw error;
    }
  }

  /**
   * Update an event
   * @param {string} eventId
   * @param {Object} updateData
   * @returns {Promise<Object>} updated event
   */
  async updateEvent(eventId, updateData) {
    try {
      const response = await axiosInstance.patch(`/events/${eventId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId
   * @returns {Promise<Object>} result
   */
  async deleteEvent(eventId) {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  }
}

const groupEventService = new GroupEventService();
export default groupEventService;
