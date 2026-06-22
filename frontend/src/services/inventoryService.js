import api from './api';

const INVENTORY_ENDPOINTS = {
  LIST: '/inventories',
  DETAIL: '/inventories',
  MOVEMENTS: '/product-movements',
  CREATE_MOVEMENT: '/product-movements',
};

class InventoryService {
  /**
   * Get list of inventory with pagination and filters
   * @param {Object} params - { page, limit, search, category_id, jenis_id }
   */
  async getInventory(params = {}) {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.LIST, { params });
      console.log('Get inventory response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data inventory',
      };
    } catch (error) {
      console.error('Get inventory error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get inventory detail by ID
   * @param {number} id - Inventory ID
   */
  async getInventoryDetail(id) {
    try {
      const response = await api.get(`${INVENTORY_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get inventory detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail inventory',
      };
    } catch (error) {
      console.error('Get inventory detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create product movement (stock in/out)
   * @param {Object} movementData - { product_id, type, qty, notes }
   */
  async createMovement(movementData) {
    try {
      const response = await api.post(INVENTORY_ENDPOINTS.CREATE_MOVEMENT, movementData);
      console.log('Create movement response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat movement',
      };
    } catch (error) {
      console.error('Create movement error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get product movements history
   * @param {Object} params - { page, limit, search, type, category_id, jenis_id }
   */
  async getMovements(params = {}) {
    try {
      const response = await api.get(INVENTORY_ENDPOINTS.MOVEMENTS, { params });
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

export default new InventoryService();