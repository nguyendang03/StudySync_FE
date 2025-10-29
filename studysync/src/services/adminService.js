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

class AdminService {
  async getDashboard() {
    const res = await axiosInstance.get('/admin/dashboard');
    return res.data;
  }

  async getTotalRevenue() {
    const res = await axiosInstance.get('/admin/total-revenue');
    return res.data;
  }

  async getSubscriptionStats() {
    const res = await axiosInstance.get('/admin/subscriptions/stats');
    return res.data;
  }

  async getAdminReviewStats() {
    const res = await axiosInstance.get('/reviews/admin/dashboard/stats');
    return res.data;
  }
}

export default new AdminService();


