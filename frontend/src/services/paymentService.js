import api from './api';

const PAYMENT_ENDPOINTS = {
  LIST: '/payments',
  DETAIL: '/payments',
  CREATE: '/payments',
  UPDATE: '/payments',
  DELETE: '/payments',
  UPDATE_STATUS: '/payments',
};

class PaymentService {
  /**
   * Get list of payments with pagination
   * @param {Object} params - { page, limit, transaction_id, status, start_date, end_date }
   */
  async getPayments(params = {}) {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.LIST, { params });
      console.log('Get payments response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data pembayaran',
      };
    } catch (error) {
      console.error('Get payments error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get payment detail by ID
   * @param {number} id - Payment ID
   */
  async getPaymentDetail(id) {
    try {
      const response = await api.get(`${PAYMENT_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get payment detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail pembayaran',
      };
    } catch (error) {
      console.error('Get payment detail error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Create payment with proof images
   * @param {Object} data - Payment data { transaction_id, note, details }
   */
  async createPayment(data) {
    try {
      // Create FormData untuk mengirim file
      const formData = new FormData();
      formData.append('transaction_id', data.transaction_id);
      
      if (data.note) {
        formData.append('note', data.note);
      }
      
      // Kirim details sebagai array dengan format yang benar untuk FormData
      // Format: details[0][method], details[0][amount], details[0][reference_no]
      data.details.forEach((detail, index) => {
        formData.append(`details[${index}][method]`, detail.method);
        formData.append(`details[${index}][amount]`, detail.amount);
        if (detail.reference_no) {
          formData.append(`details[${index}][reference_no]`, detail.reference_no);
        }
      });
      
      // Append proof images
      data.details.forEach((detail, index) => {
        if (detail.proof_image && detail.proof_image instanceof File) {
          formData.append(`proof_images[${index}]`, detail.proof_image);
        }
      });
      
      console.log('Sending payment data:', {
        transaction_id: data.transaction_id,
        note: data.note,
        details: data.details.map(d => ({
          method: d.method,
          amount: d.amount,
          reference_no: d.reference_no
        })),
        hasFiles: data.details.some(d => d.proof_image instanceof File)
      });
      
      const response = await api.post(PAYMENT_ENDPOINTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Create payment response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pembayaran berhasil dibuat',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat pembayaran',
      };
    } catch (error) {
      console.error('Create payment error:', error);
      console.error('Error response:', error.response?.data);
      return this.handleError(error);
    }
  }

  /**
   * Update payment
   * @param {number} id - Payment ID
   * @param {Object} data - Payment data
   */
  async updatePayment(id, data) {
    try {
      const response = await api.put(`${PAYMENT_ENDPOINTS.UPDATE}/${id}`, data);
      console.log('Update payment response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Pembayaran berhasil diupdate',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengupdate pembayaran',
      };
    } catch (error) {
      console.error('Update payment error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {string} status - Status (pending, partial, paid)
   */
  async updatePaymentStatus(id, status) {
    try {
      const response = await api.patch(`${PAYMENT_ENDPOINTS.UPDATE_STATUS}/${id}/status`, { status });
      console.log('Update payment status response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Status pembayaran berhasil diupdate',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengupdate status pembayaran',
      };
    } catch (error) {
      console.error('Update payment status error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Delete payment by ID
   * @param {number} id - Payment ID
   */
  async deletePayment(id) {
    try {
      const response = await api.delete(`${PAYMENT_ENDPOINTS.DELETE}/${id}`);
      console.log('Delete payment response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message || 'Pembayaran berhasil dihapus',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal menghapus pembayaran',
      };
    } catch (error) {
      console.error('Delete payment error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Bulk delete payments
   * @param {Array} ids - Array of payment IDs
   */
  async bulkDeletePayments(ids) {
    try {
      const response = await api.delete(PAYMENT_ENDPOINTS.DELETE, { data: { ids } });
      console.log('Bulk delete payments response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message || 'Pembayaran berhasil dihapus',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal menghapus pembayaran',
      };
    } catch (error) {
      console.error('Bulk delete payments error:', error);
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
        case 404:
          return {
            success: false,
            message: data.message || 'Data pembayaran tidak ditemukan',
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

export default new PaymentService();