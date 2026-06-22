import api from './api';

const MOVEMENT_ENDPOINTS = {
  LIST: '/product-movements',
  DETAIL: '/product-movements',
};

class MovementService {
  /**
   * Get list of product movements with pagination and filters
   * @param {Object} params - { page, limit, search, type, category_id, jenis_id, date_from, date_to }
   */
  async getMovements(params = {}) {
    try {
      const response = await api.get(MOVEMENT_ENDPOINTS.LIST, { params });
      console.log('Get movements response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data movement',
      };
    } catch (error) {
      console.error('Get movements error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get movement detail by ID
   * @param {number} id - Movement ID
   */
  async getMovementDetail(id) {
    try {
      const response = await api.get(`${MOVEMENT_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get movement detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail movement',
      };
    } catch (error) {
      console.error('Get movement detail error:', error);
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

export default new MovementService();