import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService.js';
import { showToast, commonToasts } from '../utils/toast';
import API_BASE_URL from '../config/api.js';
import useNotificationStore from './notificationStore.js';

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
              
              // Initialize notification store for already logged in users
              console.log('🔔 Initializing notifications for existing session...');
              useNotificationStore.getState().initialize();
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

          // Initialize notification store after successful login
          console.log('🔔 Initializing notifications...');
          useNotificationStore.getState().initialize();

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

      // Fetch user profile (role-aware: ADMIN -> /admin/me, others -> /users/me/profile)
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

          // Decode role from JWT to choose endpoint
          const parseJwt = (t) => {
            try {
              const base64Url = t.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
              return JSON.parse(jsonPayload);
            } catch { return {}; }
          };
          const claims = parseJwt(token);
          const rolesClaim = claims.role || claims.roles || claims.authorities || claims.scopes;
          const roles = Array.isArray(rolesClaim) ? rolesClaim : (rolesClaim ? [rolesClaim] : []);
          const isAdmin = roles.some(r => String(r).toUpperCase().includes('ADMIN'));

          if (isAdmin) {
            console.log('🌐 Fetching admin profile:', `${API_BASE_URL}/admin/me`);
            const res = await fetch(`${API_BASE_URL}/admin/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('📡 Admin profile status:', res.status);
            if (res.ok) {
              const raw = await res.json();
              const data = raw?.data?.data || raw?.data || raw;
              set({ user: { ...data, role: data?.role || 'ADMIN' } });
              console.log('✅ Admin profile loaded');
              return data;
            } else {
              const txt = await res.text();
              console.error('❌ Admin profile failed:', res.status, txt);
              return null;
            }
          }

          // Non-admin user profile
          console.log('🌐 Fetching user profile from:', `${API_BASE_URL}/users/me/profile`);
          const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('📡 User profile response status:', response.status);
          if (response.ok) {
            const userProfile = await response.json();
            const profileData = userProfile?.data?.data || userProfile?.data || userProfile;
            set({ user: profileData });
            console.log('✅ User profile loaded and stored');
            return profileData;
          } else {
            const errorText = await response.text();
            console.error('❌ User profile fetch failed:', response.status, errorText);
            return null;
          }
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
        
        // Cleanup notification store before logout
        console.log('🔕 Cleaning up notifications...');
        useNotificationStore.getState().cleanup();
        
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

      // Manual refresh user profile (for debugging)
      refreshUserProfile: async () => {
        console.log('🔄 Manually refreshing user profile...');
        const userProfile = await get().fetchUserProfile();
        if (userProfile) {
          console.log('✅ User profile refreshed successfully');
        } else {
          console.log('❌ Failed to refresh user profile');
        }
        return userProfile;
      },
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