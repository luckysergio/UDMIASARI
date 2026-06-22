import api from './api';

const AUTH_ENDPOINTS = {
  REGISTER: '/register',
  LOGIN: '/login',
  ME: '/me',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  FORGOT_PASSWORD: '/public/forgot-password',
  RESET_PASSWORD: '/public/reset-password',
};

class AuthService {
  /**
   * Register user baru
   */
  async register(userData) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
      
      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Registrasi berhasil',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Register gagal',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      // Handle success response
      if (response.data.status === true && response.data.data) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return {
          success: true,
          token: token,
          user: user,
          message: response.data.message || 'Login berhasil',
        };
      }
      
      // Handle failed response (status false)
      return {
        success: false,
        message: response.data.message || 'Email atau password salah',
      };
      
    } catch (error) {
      // Handle specific error status codes
      if (error.response) {
        const { status, data } = error.response;
        
        // 401 Unauthorized - Email atau password salah
        if (status === 401) {
          return {
            success: false,
            message: data.message || 'Email atau password salah. Silakan coba lagi.',
          };
        }
        
        // 422 Validation Error
        if (status === 422) {
          const errors = data.errors || {};
          const firstError = Object.values(errors)[0]?.[0] || data.message || 'Validasi gagal';
          return {
            success: false,
            message: firstError,
            errors: errors,
          };
        }
        
        // 429 Too Many Attempts
        if (status === 429) {
          return {
            success: false,
            message: 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat.',
          };
        }
        
        // 500 Server Error
        if (status === 500) {
          return {
            success: false,
            message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
          };
        }
        
        // Default error
        return {
          success: false,
          message: data.message || 'Terjadi kesalahan saat login',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat login',
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          user: null,
        };
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get(AUTH_ENDPOINTS.ME);
      
      if (response.data.status && response.data.data) {
        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return {
          success: true,
          user: userData,
        };
      }
      
      return {
        success: false,
        user: null,
        needReauth: true,
        message: 'Gagal mengambil data user',
      };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        return {
          success: false,
          user: null,
          needReauth: true,
          expired: true,
          message: error.response?.data?.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
        };
      }
      
      return {
        success: false,
        user: null,
        message: error.response?.data?.message || 'Gagal mengambil data user',
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post(AUTH_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      // Silent fail - tetap hapus data lokal
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
    
    return {
      success: true,
      message: 'Logout berhasil',
    };
  }

  /**
   * Clear auth data (for expired session)
   */
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Refresh token manually
   */
  async refreshToken() {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REFRESH);
      
      if (response.data.status && response.data.data?.token) {
        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return {
          success: true,
          token: newToken,
        };
      }
      
      return { success: false };
      
    } catch (error) {
      if (error.response?.status === 401) {
        this.clearAuthData();
        
        return {
          success: false,
          needReauth: true,
          expired: true,
          message: error.response?.data?.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Refresh token gagal',
      };
    }
  }

  /**
   * Send password reset link to email
   */
  async sendResetLink(email) {
    try {
      await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      
      // Keamanan: Selalu return success untuk mencegah email enumeration
      return {
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim ke inbox Anda',
      };
    } catch (error) {
      // Tetap return success untuk keamanan
      return {
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim ke inbox Anda',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data) {
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      
      if (response.data.status) {
        return {
          success: true,
          message: response.data.message || 'Password berhasil direset',
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Gagal mereset password',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get user role
   */
  getUserRole() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get user data from localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Rate limit
      if (status === 429) {
        return {
          success: false,
          message: 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat.',
        };
      }
      
      switch (status) {
        case 400:
          return {
            success: false,
            message: data.message || 'Email tidak ditemukan',
          };
        case 401:
          return {
            success: false,
            message: data.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
            needReauth: true,
            expired: data.expired || false,
          };
        case 403:
          return {
            success: false,
            message: data.message || 'Anda tidak memiliki akses.',
          };
        case 404:
          return {
            success: false,
            message: data.message || 'Endpoint tidak ditemukan.',
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

export default new AuthService();