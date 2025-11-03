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

class UsersAdminService {
  async listUsers(params = {}) {
    const res = await axiosInstance.get('/admin/users', { params });
    return res.data;
  }

  async getUserDetail(userId) {
    const res = await axiosInstance.get(`/admin/users/${userId}`);
    return res.data;
  }

  async updateUserRole(userId, role) {
    const res = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  }

  async updateUserStatus(userId, status) {
    // status: 'ACTIVE' | 'SUSPENDED'
    const res = await axiosInstance.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  }

  async resetUserPassword(userId) {
    const res = await axiosInstance.patch(`/admin/users/${userId}/reset-password`);
    return res.data;
  }
}

export default new UsersAdminService();


