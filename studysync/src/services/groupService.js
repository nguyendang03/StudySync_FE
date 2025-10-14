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
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Update the authorization header with new token
        const newToken = authService.getAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout and redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class GroupService {
  /**
   * Create a new study group
   * @param {Object} groupData - Group creation data
   * @param {string} groupData.groupName - Name of the group
   * @param {string} groupData.description - Group description (optional)
   * @returns {Promise<Object>} Created group data
   */
  async createGroup(groupData) {
    try {
      const response = await httpClient.post('/groups', groupData);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create group');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Get all groups that the user is a member of
   * @returns {Promise<Array>} List of user's groups
   */
  async getMyGroups() {
    try {
      const response = await axiosInstance.get('/groups/my-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      throw error;
    }
  }

  /**
   * Get group details by ID
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Group details
   */
  async getGroupDetail(groupId) {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group detail:', error);
      throw error;
    }
  }

  /**
   * Update group information (Leader only)
   * @param {number} groupId - Group ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.groupName - New group name (optional)
   * @param {string} updateData.description - New description (optional)
   * @returns {Promise<Object>} Updated group data
   */
  async updateGroup(groupId, updateData) {
    try {
      const response = await axiosInstance.patch(`/groups/${groupId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Invite a member to the group
   * @param {number} groupId - Group ID
   * @param {Object} inviteData - Invitation data
   * @param {string} inviteData.memberEmail - Email of the person to invite
   * @param {string} inviteData.message - Invitation message (optional)
   * @returns {Promise<Object>} Invitation result
   */
  async inviteMember(groupId, inviteData) {
    try {
      const response = await axiosInstance.post(`/groups/${groupId}/invite`, inviteData);
      return response.data;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  }

  /**
   * Get received invitations
   * @returns {Promise<Array>} List of received invitations
   */
  async getReceivedInvitations() {
    try {
      const response = await axiosInstance.get('/groups/invitations');
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  /**
   * Respond to an invitation
   * @param {number} invitationId - Invitation ID
   * @param {Object} responseData - Response data
   * @param {string} responseData.status - Response status ('accept' or 'decline')
   * @returns {Promise<Object>} Response result
   */
  async respondToInvitation(invitationId, responseData) {
    try {
      const response = await axiosInstance.post(`/groups/invitations/${invitationId}/respond`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }

  /**
   * Get group members
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} List of group members
   */
  async getGroupMembers(groupId) {
    try {
      const response = await axiosInstance.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  }

  /**
   * Leave a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Leave result
   */
  async leaveGroup(groupId) {
    try {
      const response = await axiosInstance.post(`/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }
}

const groupService = new GroupService();
export default groupService;