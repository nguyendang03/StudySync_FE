import API_BASE_URL from '../config/api.js';

class AuthService {
    async login(loginData) {
        try {
            const loginUrl = `${API_BASE_URL}/auth/login`;
            console.log('🔐 Starting login process...');
            console.log('🌐 API Base URL:', API_BASE_URL);
            console.log('🌐 Full Login URL:', loginUrl);
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                }),
            });

            const responseData = await response.json();
            console.log('📦 Raw login response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Đăng nhập thất bại');
            }

            // Backend wraps response in { data: { access_token, refresh_token } }
            const data = responseData.data || responseData;
            
            console.log('📦 Login tokens received:', { 
                ok: response.ok, 
                hasAccessToken: !!data.access_token,
                hasRefreshToken: !!data.refresh_token,
                accessTokenLength: data.access_token?.length,
                refreshTokenLength: data.refresh_token?.length
            });

            // Validate tokens exist in response
            if (!data.access_token || !data.refresh_token) {
                console.error('❌ Missing tokens in login response:', data);
                throw new Error('Server did not return tokens');
            }

            // Store tokens based on rememberMe preference
            const storage = loginData.rememberMe ? localStorage : sessionStorage;
            console.log('💾 Storing tokens in:', loginData.rememberMe ? 'localStorage' : 'sessionStorage');
            
            storage.setItem('accessToken', data.access_token);
            storage.setItem('refreshToken', data.refresh_token);

            // Verify tokens were stored
            console.log('✅ Tokens stored successfully:');
            console.log('  - accessToken:', storage.getItem('accessToken')?.substring(0, 30) + '...');
            console.log('  - refreshToken:', storage.getItem('refreshToken')?.substring(0, 30) + '...');

            // Also store in localStorage for isAuthenticated check
            if (!loginData.rememberMe) {
                localStorage.setItem('tempSession', 'true');
            }

            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            if (error.name === 'TypeError') {
                throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
            }
            throw error;
        }
    }

    async register(registerData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Include HTTP status on the Error so callers can make precise decisions
                const err = new Error(data.message || 'Registration failed');
                // attach status for downstream checks
                err.status = response.status;
                throw err;
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
            }
            throw error;
        }
    }

    async verifyEmail(verificationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Email verification failed');
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
            }
            throw error;
        }
    }

    async resendOTP(resendData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resendData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('Không thể kết nối đến server. Vui lòng thử lại.');
            }
            throw error;
        }
    }

    async refreshToken() {
        const refreshToken = this.getRefreshToken();

        console.log('🔍 Looking for refresh token...');
        console.log('  localStorage.refreshToken:', localStorage.getItem('refreshToken') ? 'exists' : 'null');
        console.log('  sessionStorage.refreshToken:', sessionStorage.getItem('refreshToken') ? 'exists' : 'null');
        console.log('  Final refreshToken value:', refreshToken || 'UNDEFINED');

        if (!refreshToken) {
            console.error('❌ No refresh token found in storage');
            this.logout();
            throw new Error('No refresh token available');
        }

        try {
            console.log('🔄 Attempting token refresh...');
            console.log('  Sending refreshToken (first 30 chars):', refreshToken.substring(0, 30) + '...');
            
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Refresh failed:', response.status, errorData);
                this.logout();
                throw new Error(errorData.message || 'Token refresh failed');
            }

            const responseData = await response.json();
            
            // Backend wraps response in { data: { access_token, refresh_token } }
            const data = responseData.data || responseData;
            
            console.log('✅ Token refresh successful');

            // Determine which storage was originally used
            const wasInLocalStorage = localStorage.getItem('refreshToken');
            const storage = wasInLocalStorage ? localStorage : sessionStorage;

            // Save both new tokens to the same storage
            storage.setItem('accessToken', data.access_token);
            storage.setItem('refreshToken', data.refresh_token);

            // Clear from the other storage to avoid confusion
            const otherStorage = wasInLocalStorage ? sessionStorage : localStorage;
            otherStorage.removeItem('accessToken');
            otherStorage.removeItem('refreshToken');

            return data;
        } catch (error) {
            console.error('❌ Token refresh error:', error);
            this.logout();
            throw error;
        }
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tempSession');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }

    getAccessToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }
}

export default new AuthService();