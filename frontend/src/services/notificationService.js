// src/services/notificationService.js
import api from './api';

const NOTIFICATION_ENDPOINTS = {
    NOTIFICATIONS: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    CLEAR_ALL: '/notifications/clear',
};

class NotificationService {
    /**
     * Get all active notifications
     */
    async getNotifications() {
        try {
            const response = await api.get(NOTIFICATION_ENDPOINTS.NOTIFICATIONS);
            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data || [],
                    count: response.data.count || 0,
                };
            }
            return {
                success: false,
                message: response.data.message || 'Gagal mengambil notifikasi',
                data: [],
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id) {
        try {
            const response = await api.post(NOTIFICATION_ENDPOINTS.MARK_READ(id));
            return {
                success: response.data.status || false,
                message: response.data.message || '',
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Clear all notifications
     */
    async clearAll() {
        try {
            const response = await api.delete(NOTIFICATION_ENDPOINTS.CLEAR_ALL);
            return {
                success: response.data.status || false,
                message: response.data.message || '',
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || 'Terjadi kesalahan',
            };
        }
        return {
            success: false,
            message: 'Tidak dapat terhubung ke server',
        };
    }
}

export default new NotificationService();