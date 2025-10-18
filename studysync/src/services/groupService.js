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
      console.log('📤 Sending create group request:', groupData);
      const response = await axiosInstance.post('/groups', groupData);
      console.log('📥 Create group response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create group';
      throw new Error(errorMessage);
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
   * Get received invitations (for invitee/member)
   * @returns {Promise<Array>} List of received invitations
   */
  async getReceivedInvitations() {
    try {
      console.log('📥 Fetching received invitations...');
      const response = await axiosInstance.get('/groups/invitations');
      console.log('✅ Received invitations:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching received invitations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch invitations';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get sent invitations (for leader who sent invites)
   * @returns {Promise<Array>} List of sent invitations
   */
  async getSentInvitations() {
    try {
      console.log('📥 Fetching sent invitations...');
      const response = await axiosInstance.get('/groups/invitations/sent');
      console.log('✅ Sent invitations:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sent invitations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sent invitations';
      throw new Error(errorMessage);
    }
  }

  /**
   * Respond to an invitation (for invitee/member)
   * @param {number} invitationId - Invitation ID
   * @param {Object} responseData - Response data
   * @param {string} responseData.status - Response status ('accepted' or 'declined')
   * @returns {Promise<Object>} Response result
   */
  async respondToInvitation(invitationId, responseData) {
    try {
      console.log('📤 Responding to invitation:', invitationId, responseData);
      const response = await axiosInstance.post(`/groups/invitations/${invitationId}/respond`, responseData);
      console.log('✅ Response sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error responding to invitation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to respond to invitation';
      throw new Error(errorMessage);
    }
  }

  /**
   * Accept an invitation (shorthand for invitee)
   * @param {number} invitationId - Invitation ID
   * @returns {Promise<Object>} Accept result
   */
  async acceptInvitation(invitationId) {
    return this.respondToInvitation(invitationId, { status: 'accepted' });
  }

  /**
   * Decline an invitation (shorthand for invitee)
   * @param {number} invitationId - Invitation ID
   * @returns {Promise<Object>} Decline result
   */
  async declineInvitation(invitationId) {
    return this.respondToInvitation(invitationId, { status: 'declined' });
  }

  /**
   * Request to join a group (for member)
   * @param {number} groupId - Group ID
   * @param {Object} requestData - Request data
   * @param {string} requestData.message - Optional message to the leader
   * @returns {Promise<Object>} Request result
   */
  async requestJoinGroup(groupId, requestData = {}) {
    try {
      console.log('📤 Sending join request:', groupId, requestData);
      const response = await axiosInstance.post(`/groups/${groupId}/join-request`, requestData);
      console.log('✅ Join request sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error requesting to join group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send join request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get join requests for a group (for leader)
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} List of join requests
   */
  async getJoinRequests(groupId) {
    try {
      console.log('📥 Fetching join requests for group:', groupId);
      const response = await axiosInstance.get(`/groups/${groupId}/join-requests`);
      console.log('✅ Join requests:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching join requests:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch join requests';
      throw new Error(errorMessage);
    }
  }

  /**
   * Approve a join request (for leader)
   * @param {number} requestId - Join request ID
   * @returns {Promise<Object>} Approval result
   */
  async approveJoinRequest(requestId) {
    try {
      console.log('✅ Approving join request:', requestId);
      const response = await axiosInstance.post(`/groups/join-requests/${requestId}/approve`);
      console.log('✅ Join request approved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error approving join request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve join request';
      throw new Error(errorMessage);
    }
  }

  /**
   * Deny a join request (for leader)
   * @param {number} requestId - Join request ID
   * @returns {Promise<Object>} Denial result
   */
  async denyJoinRequest(requestId) {
    try {
      console.log('❌ Denying join request:', requestId);
      const response = await axiosInstance.post(`/groups/join-requests/${requestId}/deny`);
      console.log('✅ Join request denied:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error denying join request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deny join request';
      throw new Error(errorMessage);
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
   * Remove a member from group (for leader)
   * @param {number} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Remove result
   */
  async removeMember(groupId, userId) {
    try {
      console.log('🚫 Removing member:', groupId, userId);
      const response = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      console.log('✅ Member removed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error removing member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove member';
      throw new Error(errorMessage);
    }
  }

  /**
   * Transfer leadership to another member (for leader)
   * @param {number} groupId - Group ID
   * @param {string} newLeaderId - User ID of new leader
   * @returns {Promise<Object>} Transfer result
   */
  async transferLeadership(groupId, newLeaderId) {
    try {
      console.log('👑 Transferring leadership:', groupId, newLeaderId);
      const response = await axiosInstance.post(`/groups/${groupId}/transfer-leadership`, {
        newLeaderId
      });
      console.log('✅ Leadership transferred:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error transferring leadership:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to transfer leadership';
      throw new Error(errorMessage);
    }
  }

  /**
   * Leave a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Leave result
   */
  async leaveGroup(groupId) {
    try {
      console.log('👋 Leaving group:', groupId);
      const response = await axiosInstance.post(`/groups/${groupId}/leave`);
      console.log('✅ Left group:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to leave group';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a group (for leader)
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteGroup(groupId) {
    try {
      console.log('🗑️ Deleting group:', groupId);
      const response = await axiosInstance.delete(`/groups/${groupId}`);
      console.log('✅ Group deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete group';
      throw new Error(errorMessage);
    }
  }
}

const groupService = new GroupService();
export default groupService;