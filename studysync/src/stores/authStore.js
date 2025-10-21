import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService.js';
import { showToast, commonToasts } from '../utils/toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
            isInitialized: false,

      // Initialize authentication state on app start
      initializeAuth: async () => {
        if (get().isInitialized) {
          console.log('⏭️ Auth already initialized, skipping');
          return;
        }

        const token = authService.getAccessToken();
        console.log('🔍 Auth initialization - Token found:', !!token);
        
        if (token) {
          // Trust the token exists and set authenticated immediately
          // Don't verify with backend to avoid wasting refresh tokens
          console.log('✅ Token found, setting authenticated state');
          set({ 
            isAuthenticated: true, 
            loading: false,
            isInitialized: true
          });

          // Fetch user profile in background (non-blocking)
          // If this fails, it won't affect authentication state
          get().fetchUserProfile().then(userProfile => {
            if (userProfile) {
              set({ user: userProfile });
              console.log('✅ User profile loaded');
            }
          }).catch(error => {
            console.log('⚠️ Could not load user profile, but auth is still valid:', error.message);
          });
        } else {
          console.log('❌ No token found, setting as unauthenticated');
          set({ 
            isAuthenticated: false, 
            loading: false,
            isInitialized: true
          });
        }
      },

      // Login action
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          console.log('🔄 Attempting login...');
          const response = await authService.login(credentials);
          
          // Fetch user profile after successful login
          const userProfile = await get().fetchUserProfile();
          
          set({
            user: userProfile || response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('✅ Login successful');
          const username = userProfile?.username || response.user?.username || 'bạn';
          commonToasts.loginSuccess(username);
          return response;
        } catch (error) {
          console.error('❌ Login failed:', error.message);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: error.message,
          });
          showToast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
          throw error;
        }
      },

      // Register action
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          console.log('🔄 Attempting registration...');
          const response = await authService.register(userData);
          
          set({ loading: false, error: null });
          console.log('✅ Registration successful');
          commonToasts.registerSuccess();
          return response;
        } catch (error) {
          console.error('❌ Registration failed:', error.message);
          set({ loading: false, error: error.message });
          showToast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
          throw error;
        }
      },

      // Verify email action
      verifyEmail: async (verificationData) => {
        set({ loading: true, error: null });
        try {
          console.log('🔄 Verifying email...');
          const response = await authService.verifyEmail(verificationData);
          
          set({ loading: false, error: null });
          console.log('✅ Email verification successful');
          showToast.success('Email đã được xác thực thành công');
          return response;
        } catch (error) {
          console.error('❌ Email verification failed:', error.message);
          set({ loading: false, error: error.message });
          showToast.error(error.message || 'Xác thực email thất bại. Vui lòng thử lại.');
          throw error;
        }
      },

      // Resend OTP action
      resendOTP: async (resendData) => {
        set({ loading: true, error: null });
        try {
          console.log('🔄 Resending OTP...');
          const response = await authService.resendOTP(resendData);
          
          set({ loading: false, error: null });
          console.log('✅ OTP resent successfully');
          showToast.success('Mã OTP đã được gửi lại');
          return response;
        } catch (error) {
          console.error('❌ Resend OTP failed:', error.message);
          set({ loading: false, error: error.message });
          showToast.error(error.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.');
          throw error;
        }
      },

      // Fetch user profile
      fetchUserProfile: async () => {
        try {
          const token = authService.getAccessToken();
          const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
          
          console.log('🔍 fetchUserProfile - Checking tokens...');
          console.log('  Access token:', token ? 'exists' : 'MISSING');
          console.log('  Refresh token:', refreshToken ? 'exists' : 'MISSING');

          if (!token || !refreshToken) {
            console.error('❌ Missing tokens, cannot fetch profile');
            return null;
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/users/me/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userProfile = await response.json();
            return userProfile;
          }
          
          console.log('⚠️ Profile fetch returned:', response.status);
          return null;
        } catch (error) {
          console.error('❌ Fetch user profile failed:', error.message);
          return null;
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          console.log('🔄 Refreshing token...');
          const response = await authService.refreshToken();
          
          // Fetch updated user profile
          const userProfile = await get().fetchUserProfile();
          
          set({
            user: userProfile,
            isAuthenticated: true,
            loading: false,
          });

          console.log('✅ Token refreshed successfully');
          return response;
        } catch (error) {
          console.error('❌ Token refresh failed:', error.message);
          get().logout();
          throw error;
        }
      },

      // Logout action
      logout: () => {
        console.log('🔄 Logging out...');
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        console.log('✅ Logout successful');
        commonToasts.logoutSuccess();
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;