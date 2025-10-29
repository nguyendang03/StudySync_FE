import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
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

class PaymentService {
  /**
   * Purchase subscription plan
   * @param {number} planId - Subscription plan ID
   * @param {Object} userInfo - User info (name, email, phone)
   * @returns {Promise<Object>} Payment checkout data with QR code
   */
  async purchaseSubscription(planId, userInfo = {}) {
    try {
      console.log('🛒 Sending purchase request:', { planId, userInfo });
      
      const response = await axiosInstance.post('/payments/purchase', {
        planId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone
      });
      
      console.log('📦 Payment API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment purchase error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Get all available subscription plans
   * @returns {Promise<Array>} List of subscription plans
   */
  async getSubscriptionPlans() {
    try {
      const response = await axiosInstance.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('❌ Get plans error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get current user's subscription
   * @returns {Promise<Object>} Current subscription details
   */
  async getCurrentSubscription() {
    try {
      const response = await axiosInstance.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('❌ Get subscription error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user's payment history
   * @returns {Promise<Array>} Payment history
   */
  async getPaymentHistory() {
    try {
      const response = await axiosInstance.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('❌ Get payment history error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get payment details by order code
   * @param {string} orderCode - Payment order code
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentDetails(orderCode) {
    try {
      const response = await axiosInstance.get(`/payments/detail?orderCode=${orderCode}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get payment details error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new PaymentService();

