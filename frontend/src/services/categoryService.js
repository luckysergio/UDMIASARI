import api from './api';

const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
  DETAIL: '/categories',
  CREATE: '/categories',
  UPDATE: '/categories',
  DELETE: '/categories',
};

class CategoryService {
  /**
   * Get list of categories with pagination and search
   * @param {Object} params - { page, limit, search }
   */
  async getCategories(params = {}) {
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.LIST, { params });
      console.log('Get categories response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data kategori',
      };
    } catch (error) {
      console.error('Get categories error:', error);
      return this.handleError(error);
    }
  }

  // Tambahkan method ini ke categoryService yang sudah ada

/**
 * Get all categories (without pagination) for dropdown
 */
async getAllCategories() {
  try {
    const response = await api.get('/categories/all');
    console.log('Get all categories response:', response.data);
    
    if (response.data.status) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    
    return {
      success: false,
      data: [],
    };
  } catch (error) {
    console.error('Get all categories error:', error);
    return { success: false, data: [] };
  }
}

  /**
   * Get category detail by ID
   * @param {number} id - Category ID
   */
  async getCategoryDetail(id) {
    try {
      const response = await api.get(`${CATEGORY_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get category detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail kategori',
      };
    } catch (error) {
      console.error('Get category detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - { name, description }
   */
  async createCategory(categoryData) {
    try {
      const response = await api.post(CATEGORY_ENDPOINTS.CREATE, categoryData);
      console.log('Create category response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat kategori',
      };
    } catch (error) {
      console.error('Create category error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} categoryData - { name, description }
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`${CATEGORY_ENDPOINTS.UPDATE}/${id}`, categoryData);
      console.log('Update category response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal update kategori',
      };
    } catch (error) {
      console.error('Update category error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   */
  async deleteCategory(id) {
    try {
      const response = await api.delete(`${CATEGORY_ENDPOINTS.DELETE}/${id}`);
      console.log('Delete category response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal hapus kategori',
      };
    } catch (error) {
      console.error('Delete category error:', error);
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

export default new CategoryService();