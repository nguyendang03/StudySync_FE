import axios from 'axios';
import API_BASE_URL from '../config/api.js';
import authService from './authService.js';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

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
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const extractData = (response) => response?.data ?? response;

class TaskService {
  async getGroupTasks(groupId) {
    try {
      console.log('📥 Fetching tasks for group:', groupId);
      const response = await axiosInstance.get(`/groups/${groupId}/tasks`);
      console.log('✅ Tasks response:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error fetching group tasks:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch tasks';
      throw new Error(message);
    }
  }

  async getTaskStatistics(groupId) {
    try {
      console.log('📊 Fetching task statistics for group:', groupId);
      const response = await axiosInstance.get(`/groups/${groupId}/tasks/statistics`);
      console.log('✅ Statistics response:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error fetching task statistics:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch task statistics';
      throw new Error(message);
    }
  }

  async getMyTasks(groupId) {
    try {
      console.log('📥 Fetching my tasks for group:', groupId);
      const response = await axiosInstance.get(`/groups/${groupId}/tasks/my-tasks`);
      console.log('✅ My tasks response:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error fetching my tasks:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch my tasks';
      throw new Error(message);
    }
  }

  async createTask(groupId, payload) {
    try {
      console.log('📤 Creating task for group:', groupId, payload);
      const response = await axiosInstance.post(`/groups/${groupId}/tasks`, payload);
      console.log('✅ Task created:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create task';
      throw new Error(message);
    }
  }

  async updateTask(groupId, taskId, payload) {
    try {
      console.log('📝 Updating task:', groupId, taskId, payload);
      const response = await axiosInstance.put(`/groups/${groupId}/tasks/${taskId}`, payload);
      console.log('✅ Task updated:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update task';
      throw new Error(message);
    }
  }

  async updateTaskStatus(groupId, taskId, status) {
    try {
      console.log('🔄 Updating task status:', groupId, taskId, status);
      const response = await axiosInstance.put(`/groups/${groupId}/tasks/${taskId}/status`, { status });
      console.log('✅ Task status updated:', response.data);
      return extractData(response);
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update task status';
      throw new Error(message);
    }
  }

  async deleteTask(groupId, taskId) {
    try {
      console.log('🗑️ Deleting task:', groupId, taskId);
      await axiosInstance.delete(`/groups/${groupId}/tasks/${taskId}`);
      console.log('✅ Task deleted');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete task';
      throw new Error(message);
    }
  }
}

const taskService = new TaskService();
export default taskService;
