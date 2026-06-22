// src/services/returService.js
import api from './api';

const RETUR_ENDPOINTS = {
  LIST: '/returs',
  DETAIL: '/returs',
  CREATE: '/returs',
  APPROVE: '/returs',
  REJECT: '/returs',
  SEND_REPLACEMENT: '/returs',
  COMPLETE: '/returs',
};

class ReturService {
  /**
   * Get list of returs with pagination
   * @param {Object} params - { page, limit, search }
   */
  async getReturs(params = {}) {
    try {
      const response = await api.get(RETUR_ENDPOINTS.LIST, { params });
      console.log('Get returs response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data retur',
      };
    } catch (error) {
      console.error('Get returs error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get retur detail by ID
   * @param {number} id - Retur ID
   */
  async getReturDetail(id) {
    try {
      const response = await api.get(`${RETUR_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get retur detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail retur',
      };
    } catch (error) {
      console.error('Get retur detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create new retur
   * @param {Object} data - Retur data { transaction_id, type, reason, items }
   * @param {Array} images - Array of image files
   */
  async createRetur(data, images) {
    try {
      const formData = new FormData();
      
      // Append basic data
      formData.append('transaction_id', data.transaction_id);
      formData.append('type', data.type);
      formData.append('reason', data.reason);
      
      // 🔥 Kirim items sebagai JSON string
      const itemsToSend = data.items.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        note: item.note || null
      }));
      formData.append('items', JSON.stringify(itemsToSend));
      
      // 🔥 Append images - pastikan format yang benar
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          // Gunakan format images[] bukan images[index]
          formData.append('images[]', image);
        });
      }
      
      // Log untuk debugging
      console.log('Sending retur data:', {
        transaction_id: data.transaction_id,
        type: data.type,
        reason: data.reason,
        items: itemsToSend,
        images_count: images.length,
        images_names: images.map(img => img.name)
      });
      
      const response = await api.post(RETUR_ENDPOINTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Create retur response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat retur',
      };
    } catch (error) {
      console.error('Create retur error:', error);
      if (error.response?.data) {
        console.error('Error response:', error.response.data);
        // Tampilkan error detail jika ada
        const errorMessage = error.response.data.errors 
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.response.data.message || 'Gagal membuat retur';
        return {
          success: false,
          message: errorMessage,
          errors: error.response.data.errors
        };
      }
      return this.handleError(error);
    }
  }

  /**
   * Approve retur
   * @param {number} id - Retur ID
   */
  async approveRetur(id) {
    try {
      const response = await api.post(`${RETUR_ENDPOINTS.APPROVE}/${id}/approve`);
      console.log('Approve retur response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal menyetujui retur',
      };
    } catch (error) {
      console.error('Approve retur error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Reject retur
   * @param {number} id - Retur ID
   * @param {string} reason - Rejection reason
   */
  async rejectRetur(id, reason) {
    try {
      const response = await api.post(`${RETUR_ENDPOINTS.REJECT}/${id}/reject`, { reason });
      console.log('Reject retur response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal menolak retur',
      };
    } catch (error) {
      console.error('Reject retur error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Send replacement for retur
   * @param {number} id - Retur ID
   * @param {string} resi - Shipping tracking number
   */
  async sendReplacement(id, resi) {
    try {
      const response = await api.post(`${RETUR_ENDPOINTS.SEND_REPLACEMENT}/${id}/send-replacement`, { resi });
      console.log('Send replacement response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengirim barang pengganti',
      };
    } catch (error) {
      console.error('Send replacement error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Complete retur
   * @param {number} id - Retur ID
   */
  async completeRetur(id) {
    try {
      const response = await api.post(`${RETUR_ENDPOINTS.COMPLETE}/${id}/complete`);
      console.log('Complete retur response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal menyelesaikan retur',
      };
    } catch (error) {
      console.error('Complete retur error:', error);
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
          const firstError = Object.values(errors)[0]?.[0] || data.message || 'Validasi gagal';
          return {
            success: false,
            message: firstError,
            errors: errors,
          };
        case 500:
          return {
            success: false,
            message: data.message || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
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

export default new ReturService();