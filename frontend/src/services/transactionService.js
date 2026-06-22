// src/services/transactionService.js
import api from './api';

const TRANSACTION_ENDPOINTS = {
  LIST: '/transactions',
  DETAIL: '/transactions',
  CREATE: '/transactions',
  UPDATE_STATUS: '/transactions', // Base path
};

class TransactionService {
  async getTransactions(params = {}) {
    try {
      const response = await api.get(TRANSACTION_ENDPOINTS.LIST, { params });
      console.log('Get transactions response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil data transaksi',
      };
    } catch (error) {
      console.error('Get transactions error:', error);
      return this.handleError(error);
    }
  }

  async getTransactionDetail(id) {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.DETAIL}/${id}`);
      console.log('Get transaction detail response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengambil detail transaksi',
      };
    } catch (error) {
      console.error('Get transaction detail error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengambil detail transaksi',
      };
    }
  }

  async createTransaction(transactionData) {
    try {
      const response = await api.post(TRANSACTION_ENDPOINTS.CREATE, transactionData);
      console.log('Create transaction response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal membuat transaksi',
      };
    } catch (error) {
      console.error('Create transaction error:', error);
      return this.handleError(error);
    }
  }

  async updateStatus(id, status) {
    try {
      // 🔥 PERBAIKAN: Pastikan URL endpoint sesuai dengan route di backend
      // Endpoint yang benar: PATCH /api/transactions/{id}/status
      const response = await api.patch(`${TRANSACTION_ENDPOINTS.UPDATE_STATUS}/${id}/status`, { status });
      console.log('Update status URL:', `${TRANSACTION_ENDPOINTS.UPDATE_STATUS}/${id}/status`);
      console.log('Update status response:', response.data);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mengupdate status',
      };
    } catch (error) {
      console.error('Update status error:', error);
      console.error('Error response:', error.response?.data);
      return this.handleError(error);
    }
  }

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
            message: data.message || 'Terjadi kesalahan pada server',
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

export default new TransactionService();