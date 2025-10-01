import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Initialize authentication state
      initializeAuth: async () => {
        try {
          set({ loading: true, error: null });
          const token = authService.getAccessToken();
          
          if (token) {
            // Validate token or fetch user info
            const user = { authenticated: true }; // Replace with actual user data
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              loading: false 
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          authService.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: error.message 
          });
        }
      },

      // Login action
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          const response = await authService.login(credentials);
          const user = response.user || { authenticated: true };
          
          set({ 
            user, 
            isAuthenticated: true, 
            loading: false,
            error: null
          });
          
          toast.success('Đăng nhập thành công!');
          return response;
        } catch (error) {
          const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
          
          set({ 
            loading: false, 
            error: errorMessage,
            user: null,
            isAuthenticated: false
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      // Register action
      register: async (userData) => {
        try {
          set({ loading: true, error: null });
          
          const response = await authService.register(userData);
          
          set({ 
            loading: false,
            error: null
          });
          
          toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
          return response;
        } catch (error) {
          let errorMessage;
          if (error.message.includes('email')) {
            errorMessage = 'Email này đã được sử dụng';
          } else if (error.message.includes('username')) {
            errorMessage = 'Tên người dùng này đã được sử dụng';
          } else {
            errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
          }
          
          set({ 
            loading: false, 
            error: errorMessage 
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      // Logout action
      logout: () => {
        authService.logout();
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false,
          error: null
        });
        toast.success('Đăng xuất thành công!');
      },

      // Reset auth state
      reset: () => set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: null 
      }),
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