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
  // Get all public reviews with pagination and filters
  async getReviews(params = {}) {
    try {
      const response = await axiosInstance.get('/reviews', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get reviews error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get review statistics
  async getReviewStats() {
    try {
      const response = await axiosInstance.get('/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Get review stats error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get single review by ID
  async getReviewById(id) {
    try {
      const response = await axiosInstance.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get review by ID error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create review (user can only create one)
  async createReview(reviewData) {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('❌ Create review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get current user's review
  async getMyReview() {
    try {
      const response = await axiosInstance.get('/reviews/my-review/detail');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // User hasn't created a review yet
      }
      console.error('❌ Get my review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update current user's review
  async updateMyReview(reviewData) {
    try {
      const response = await axiosInstance.put('/reviews/my-review', reviewData);
      return response.data;
    } catch (error) {
      console.error('❌ Update my review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Delete current user's review
  async deleteMyReview() {
    try {
      const response = await axiosInstance.delete('/reviews/my-review');
      return response.data;
    } catch (error) {
      console.error('❌ Delete my review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin: Get all reviews (including hidden)
  async getAllReviews(params = {}) {
    try {
      const response = await axiosInstance.get('/reviews/admin/all', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get all reviews (admin) error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin: Reply to review
  async adminReplyReview(reviewId, adminReply) {
    try {
      const response = await axiosInstance.put(`/reviews/admin/${reviewId}/reply`, { adminReply });
      return response.data;
    } catch (error) {
      console.error('❌ Admin reply review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin: Update review visibility
  async toggleReviewVisibility(reviewId, isPublic) {
    try {
      const response = await axiosInstance.put(`/reviews/admin/${reviewId}/visibility`, { isPublic });
      return response.data;
    } catch (error) {
      console.error('❌ Toggle review visibility error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin: Delete any review
  async adminDeleteReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`/reviews/admin/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Admin delete review error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin: Get dashboard stats
  async getAdminStats() {
    try {
      const response = await axiosInstance.get('/reviews/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Get admin stats error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ReviewService();


