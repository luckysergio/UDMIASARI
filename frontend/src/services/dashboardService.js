// src/services/dashboardService.js
import api from './api';

const DASHBOARD_ENDPOINTS = {
  DASHBOARD: '/dashboard',
  MONTHLY_REVENUE: '/dashboard/monthly-revenue',
  DAILY_REVENUE: '/dashboard/daily-revenue',
};

class DashboardService {
  /**
   * Get main dashboard data
   */
  async getDashboardData() {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.DASHBOARD);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data dashboard',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get monthly revenue chart data
   * @param {number} year - Year (optional, default current year)
   */
  async getMonthlyRevenue(year = null) {
    try {
      const params = year ? { year } : {};
      const response = await api.get(DASHBOARD_ENDPOINTS.MONTHLY_REVENUE, { params });
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data chart',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get daily revenue chart data for current month
   */
  async getDailyRevenue() {
    try {
      const response = await api.get(DASHBOARD_ENDPOINTS.DAILY_REVENUE);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data chart',
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
          const firstError = Object.values(errors)[0]?.[0] || 'Validasi gagal';
          return {
            success: false,
            message: firstError,
            errors: errors,
          };
        case 500:
          return {
            success: false,
            message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
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

export default new DashboardService();