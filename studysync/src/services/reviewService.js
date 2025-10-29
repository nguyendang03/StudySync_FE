import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

class ReviewService {
  async getReviews(params = {}) {
    try {
      const response = await axiosInstance.get('/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get reviews error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getReviewStats() {
    try {
      const response = await axiosInstance.get('/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Get review stats error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getReviewsByStars(stars, limit = 20) {
    try {
      const response = await axiosInstance.get('/reviews', { 
        params: { stars, limit } 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Get reviews by stars error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ReviewService();


