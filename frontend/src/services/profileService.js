// src/services/profileService.js
import api from './api';

class ProfileService {
    async getProfile() {
        try {
            const response = await api.get('/profile');
            console.log('Get profile response:', response.data);
            
            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
            
            return {
                success: false,
                message: response.data.message || 'Gagal mengambil data profile',
            };
        } catch (error) {
            console.error('Get profile error:', error);
            return this.handleError(error);
        }
    }
    
    async updateProfile(data) {
        try {
            const response = await api.put('/profile', data);
            console.log('Update profile response:', response.data);
            
            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
            
            return {
                success: false,
                message: response.data.message || 'Gagal mengupdate profile',
            };
        } catch (error) {
            console.error('Update profile error:', error);
            return this.handleError(error);
        }
    }
    
    async changePassword(data) {
        try {
            const response = await api.put('/profile/change-password', data);
            console.log('Change password response:', response.data);
            
            if (response.data.status) {
                return {
                    success: true,
                    message: response.data.message,
                };
            }
            
            return {
                success: false,
                message: response.data.message || 'Gagal mengubah password',
            };
        } catch (error) {
            console.error('Change password error:', error);
            return this.handleError(error);
        }
    }
    
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    return {
                        success: false,
                        message: data.message || 'Sesi berakhir, silakan login kembali',
                    };
                case 403:
                    return {
                        success: false,
                        message: data.message || 'Anda tidak memiliki akses',
                    };
                case 422:
                    const errors = data.errors || {};
                    const firstError = Object.values(errors)[0]?.[0] || data.message || 'Validasi gagal';
                    return {
                        success: false,
                        message: firstError,
                        errors: errors,
                    };
                case 500:
                    return {
                        success: false,
                        message: data.message || 'Terjadi kesalahan pada server',
                    };
                default:
                    return {
                        success: false,
                        message: data.message || 'Terjadi kesalahan',
                    };
            }
        } else if (error.request) {
            return {
                success: false,
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
            };
        } else {
            return {
                success: false,
                message: error.message || 'Terjadi kesalahan',
            };
        }
    }
}

export default new ProfileService();