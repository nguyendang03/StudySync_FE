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
            initializeAuth: async() => {
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
            login: async(credentials) => {
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
            register: async(userData) => {
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
                    let errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
                    const status = error.status;

                    if (status === 409) {
                        const msg = (error.message || '').toLowerCase();
                        if (msg.includes('email')) {
                            errorMessage = 'Email này đã được sử dụng';
                        } else if (msg.includes('username')) {
                            errorMessage = 'Tên người dùng này đã được sử dụng';
                        } else {
                            errorMessage = 'Dữ liệu đã tồn tại';
                        }
                    } else {
                        const msg = (error.message || '').toLowerCase();
                        if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
                            if (msg.includes('email')) {
                                errorMessage = 'Email này đã được sử dụng';
                            } else if (msg.includes('username')) {
                                errorMessage = 'Tên người dùng này đã được sử dụng';
                            }
                        }
                    }

                    set({
                        loading: false,
                        error: errorMessage
                    });

                    toast.error(errorMessage);
                    throw error;
                }
            },

            // Email verification action
            verifyEmail: async(verificationData) => {
                try {
                    set({ loading: true, error: null });

                    const response = await authService.verifyEmail(verificationData);

                    set({
                        loading: false,
                        error: null
                    });

                    toast.success('Xác thực email thành công!');
                    return response;
                } catch (error) {
                    let errorMessage;
                    if (error.message.includes('expired')) {
                        errorMessage = 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
                    } else if (error.message.includes('invalid')) {
                        errorMessage = 'Mã OTP không hợp lệ. Vui lòng kiểm tra lại.';
                    } else {
                        errorMessage = error.message || 'Xác thực thất bại. Vui lòng thử lại.';
                    }

                    set({
                        loading: false,
                        error: errorMessage
                    });

                    throw error;
                }
            },

            // Resend OTP action
            resendOTP: async(resendData) => {
                try {
                    set({ loading: true, error: null });

                    const response = await authService.resendOTP(resendData);

                    set({
                        loading: false,
                        error: null
                    });

                    return response;
                } catch (error) {
                    const errorMessage = error.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.';

                    set({
                        loading: false,
                        error: errorMessage
                    });

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
        }), {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;