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

      try{
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

class VideoCallService {
  /**
   * Start a new video call in a group
   * @param {Object} callData - Call data
   * @param {number} callData.groupId - Group ID
   * @param {string} callData.callTitle - Call title (optional)
   * @returns {Promise<Object>} Call data
   */
  async startCall(callData) {
    try {
      console.log('📞 Starting video call:', callData);
      const response = await axiosInstance.post('/video-calls/start', callData);
      console.log('✅ Call started:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error starting call:', error);
      throw error;
    }
  }

  /**
   * Join an ongoing video call
   * @param {number} callId - Call ID
   * @param {Object} joinData - Join data
   * @param {string} joinData.peerId - Peer ID for WebRTC
   * @returns {Promise<Object>} Participant data
   */
  async joinCall(callId, joinData) {
    try {
      console.log('👋 Joining video call:', callId, joinData);
      const response = await axiosInstance.post(
        `/video-calls/${callId}/join`,
        joinData
      );
      console.log('✅ Joined call:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error joining call:', error);
      throw error;
    }
  }

  /**
   * Leave a video call
   * @param {number} callId - Call ID
   * @returns {Promise<Object>} Result
   */
  async leaveCall(callId) {
    try {
      console.log('👋 Leaving video call:', callId);
      const response = await axiosInstance.post(`/video-calls/${callId}/leave`);
      console.log('✅ Left call:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error leaving call:', error);
      throw error;
    }
  }

  /**
   * End a video call (host only)
   * @param {number} callId - Call ID
   * @returns {Promise<Object>} Result
   */
  async endCall(callId) {
    try {
      console.log('🛑 Ending video call:', callId);
      const response = await axiosInstance.post(`/video-calls/${callId}/end`);
      console.log('✅ Call ended:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error ending call:', error);
      throw error;
    }
  }

  /**
   * Get call details
   * @param {number} callId - Call ID
   * @returns {Promise<Object>} Call details
   */
  async getCallDetails(callId) {
    try {
      console.log('📋 Fetching call details:', callId);
      const response = await axiosInstance.get(`/video-calls/${callId}`);
      console.log('✅ Call details:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching call details:', error);
      throw error;
    }
  }

  /**
   * Get active participants in a call
   * @param {number} callId - Call ID
   * @returns {Promise<Array>} Participants list
   */
  async getParticipants(callId) {
    try {
      console.log('👥 Fetching participants:', callId);
      const response = await axiosInstance.get(`/video-calls/${callId}/participants`);
      console.log('✅ Participants:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      throw error;
    }
  }

  /**
   * Get active calls for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Active calls list
   */
  async getGroupActiveCalls(groupId) {
    try {
      console.log('📞 Fetching active calls for group:', groupId);
      const response = await axiosInstance.get(
        `/video-calls/group/${groupId}/active`
      );
      console.log('✅ Active calls:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active calls:', error);
      throw error;
    }
  }

  /**
   * Get call history for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Call history
   */
  async getCallHistory(groupId) {
    try {
      console.log('📜 Fetching call history for group:', groupId);
      const response = await axiosInstance.get(
        `/video-calls/group/${groupId}/history`
      );
      console.log('✅ Call history:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching call history:', error);
      throw error;
    }
  }

  /**
   * Update participant audio status
   * @param {number} callId - Call ID
   * @param {boolean} isMuted - Muted status
   * @returns {Promise<Object>} Result
   */
  async updateAudioStatus(callId, isMuted) {
    try {
      console.log('🎤 Updating audio status:', callId, isMuted);
      const response = await axiosInstance.post(
        `/video-calls/${callId}/audio`,
        { isMuted }
      );
      console.log('✅ Audio status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating audio status:', error);
      throw error;
    }
  }

  /**
   * Update participant video status
   * @param {number} callId - Call ID
   * @param {boolean} isVideoOff - Video off status
   * @returns {Promise<Object>} Result
   */
  async updateVideoStatus(callId, isVideoOff) {
    try {
      console.log('📹 Updating video status:', callId, isVideoOff);
      const response = await axiosInstance.post(
        `/video-calls/${callId}/video`,
        { isVideoOff }
      );
      console.log('✅ Video status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating video status:', error);
      throw error;
    }
  }
}

const videoCallService = new VideoCallService();
export default videoCallService;
