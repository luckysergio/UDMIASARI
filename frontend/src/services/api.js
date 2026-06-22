import axios from 'axios';

// Konfigurasi base URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - menangani error dengan aman (tanpa redirect otomatis)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const message = errors ? Object.values(errors).flat()[0] : 'Validasi gagal';
      error.customMessage = message;
    }
    // Handle unauthorized (401) - hanya untuk kasus tertentu
    else if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Cegah infinite loop pada request refresh
      if (originalRequest.url?.includes('/refresh')) {
        // Hanya hapus token, tidak redirect otomatis
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        error.customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        return Promise.reject(error);
      }
      
      // Coba refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/refresh`, {
            refresh_token: refreshToken
          });
          
          if (response.data.status && response.data.data?.token) {
            const newToken = response.data.data.token;
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        
        // Jika refresh gagal, hapus token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        error.customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        error.customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      }
    }
    // Handle other errors
    else if (error.response?.data?.message) {
      error.customMessage = error.response.data.message;
    } 
    else if (error.request) {
      error.customMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } 
    else {
      error.customMessage = error.message || 'Terjadi kesalahan';
    }

    return Promise.reject(error);
  }
);

export default api;