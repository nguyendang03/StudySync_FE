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

class SubscriptionAdminService {
  async listPlans(params = {}) {
    const res = await axiosInstance.get('/subscriptions/plans', { params });
    return res.data;
  }

  async createPlan(plan) {
    const res = await axiosInstance.post('/subscriptions/plans', plan);
    return res.data;
  }

  async updatePlan(planId, updates) {
    const res = await axiosInstance.patch(`/subscriptions/plans/${planId}`, updates);
    return res.data;
  }

  async togglePlan(planId, active) {
    const res = await axiosInstance.patch(`/subscriptions/plans/${planId}`, { active });
    return res.data;
  }
}

export default new SubscriptionAdminService();


