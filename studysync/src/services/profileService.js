import axios from 'axios';

// Lấy thông tin profile hiện tại
export const getProfile = async() => {
    try {
        const response = await axios.get('/users/me/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// Cập nhật thông tin profile
export const updateProfile = async(data) => {
    try {
        const response = await axios.patch('/users/me/profile', data);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};