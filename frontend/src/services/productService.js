import api from './api';

const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  DETAIL: '/products',
  CREATE: '/products',
  UPDATE: '/products',
  DELETE: '/products',
};

class ProductService {
  /**
   * Get list of products with pagination and search
   * @param {Object} params - { page, limit, search }
   */
  async getProducts(params = {}) {
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.LIST, { params });
      console.log('Get products response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data produk',
      };
    } catch (error) {
      console.error('Get products error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get product detail by ID
   * @param {number} id - Product ID
   */
  async getProductDetail(id) {
    try {
      const response = await api.get(`${PRODUCT_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get product detail response:', response.data);
      
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
   * Create new product
   * @param {FormData} formData - Product data with image
   */
  async createProduct(formData) {
    try {
      const response = await api.post(PRODUCT_ENDPOINTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Create product response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat produk',
      };
    } catch (error) {
      console.error('Create product error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {FormData} formData - Product data with image
   */
  async updateProduct(id, formData) {
    try {
      const response = await api.post(`${PRODUCT_ENDPOINTS.UPDATE}/${id}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update product response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal update produk',
      };
    } catch (error) {
      console.error('Update product error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   */
  async deleteProduct(id) {
    try {
      const response = await api.delete(`${PRODUCT_ENDPOINTS.DELETE}/${id}`);
      console.log('Delete product response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal hapus produk',
      };
    } catch (error) {
      console.error('Delete product error:', error);
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

  /**
 * Get all active products (for transaction)
 */
async getActiveProducts(params = {}) {
  try {
    const response = await api.get('/products', { 
      params: { ...params, is_active: true, limit: 100 }
    });
    console.log('Get active products response:', response.data);
    
    if (response.data.status) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Gagal mengambil data produk',
    };
  } catch (error) {
    console.error('Get active products error:', error);
    return this.handleError(error);
  }
}
}

export default new ProductService();