import api from './api';

const JENIS_ENDPOINTS = {
  LIST: '/jenis',
  DETAIL: '/jenis',
  CREATE: '/jenis',
  UPDATE: '/jenis',
  DELETE: '/jenis',
};

class JenisService {
  /**
   * Get list of jenis with pagination and search
   * @param {Object} params - { page, limit, search }
   */
  async getJenis(params = {}) {
    try {
      const response = await api.get(JENIS_ENDPOINTS.LIST, { params });
      console.log('Get jenis response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data jenis',
      };
    } catch (error) {
      console.error('Get jenis error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get jenis detail by ID
   * @param {number} id - Jenis ID
   */
  async getJenisDetail(id) {
    try {
      const response = await api.get(`${JENIS_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get jenis detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail jenis',
      };
    } catch (error) {
      console.error('Get jenis detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create new jenis
   * @param {Object} jenisData - { category_id, name, description }
   */
  async createJenis(jenisData) {
    try {
      const response = await api.post(JENIS_ENDPOINTS.CREATE, jenisData);
      console.log('Create jenis response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat jenis',
      };
    } catch (error) {
      console.error('Create jenis error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Update jenis
   * @param {number} id - Jenis ID
   * @param {Object} jenisData - { category_id, name, description }
   */
  async updateJenis(id, jenisData) {
    try {
      const response = await api.put(`${JENIS_ENDPOINTS.UPDATE}/${id}`, jenisData);
      console.log('Update jenis response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal update jenis',
      };
    } catch (error) {
      console.error('Update jenis error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Delete jenis
   * @param {number} id - Jenis ID
   */
  async deleteJenis(id) {
    try {
      const response = await api.delete(`${JENIS_ENDPOINTS.DELETE}/${id}`);
      console.log('Delete jenis response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal hapus jenis',
      };
    } catch (error) {
      console.error('Delete jenis error:', error);
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

export default new JenisService();