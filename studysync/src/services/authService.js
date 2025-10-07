import API_BASE_URL from '../config/api.js';

class AuthService {
    async login(loginData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            // Store tokens based on rememberMe preference
            const storage = loginData.rememberMe ? localStorage : sessionStorage;
            storage.setItem('accessToken', data.access_token);
            storage.setItem('refreshToken', data.refresh_token);

            // Also store in localStorage for isAuthenticated check
            if (!loginData.rememberMe) {
                localStorage.setItem('tempSession', 'true');
            }

            return data;
        } catch (error) {
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
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            this.logout();
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);

        return data;
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