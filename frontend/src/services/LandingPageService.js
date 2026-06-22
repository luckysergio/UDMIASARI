// src/services/landingPageService.js
import api from './api';

const LANDING_ENDPOINTS = {
  LANDING: '/public/landing',
  PRODUCT_DETAIL: '/public/products',
};

class LandingPageService {
  /**
   * Get landing page data
   */
  async getLandingData(params = {}) {
    try {
      const response = await api.get(LANDING_ENDPOINTS.LANDING, { params });
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data landing page',
      };
    } catch (error) {
      console.error('Get landing data error:', error);
      return this.handleError(error);
    }
  }
  
  /**
   * Get product detail
   */
  async getProductDetail(id) {
    try {
      const response = await api.get(`${LANDING_ENDPOINTS.PRODUCT_DETAIL}/${id}`);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail produk',
      };
    } catch (error) {
      console.error('Get product detail error:', error);
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

export default new LandingPageService();