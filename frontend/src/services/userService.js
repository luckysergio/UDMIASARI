import api from './api';

const USER_ENDPOINTS = {
  LIST: '/users',
  DETAIL: '/users',
  CREATE: '/users',
  UPDATE: '/users',
  DELETE: '/users',
};

class UserService {
  /**
   * Get list of users with pagination and search
   * @param {Object} params - { page, limit, search }
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get(USER_ENDPOINTS.LIST, { params });
      console.log('Get users response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data user',
      };
    } catch (error) {
      console.error('Get users error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get user detail by ID
   * @param {number} id - User ID
   */
  async getUserDetail(id) {
    try {
      const response = await api.get(`${USER_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get user detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail user',
      };
    } catch (error) {
      console.error('Get user detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create new user
   * @param {Object} userData - { name, email, phone, password, role }
   */
  async createUser(userData) {
    try {
      const response = await api.post(USER_ENDPOINTS.CREATE, userData);
      console.log('Create user response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat user',
      };
    } catch (error) {
      console.error('Create user error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - { name, email, phone, password, role }
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`${USER_ENDPOINTS.UPDATE}/${id}`, userData);
      console.log('Update user response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal update user',
      };
    } catch (error) {
      console.error('Update user error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`${USER_ENDPOINTS.DELETE}/${id}`);
      console.log('Delete user response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal hapus user',
      };
    } catch (error) {
      console.error('Delete user error:', error);
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
            message: data.message || 'Unauthorized. Silakan login kembali.',
          };
        case 403:
          return {
            success: false,
            message: data.message || 'Anda tidak memiliki akses.',
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

export default new UserService();