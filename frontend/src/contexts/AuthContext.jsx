import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';
import { useModal } from './ModalContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { error: showError, warning, success } = useModal();

  // Check auth status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      try {
        const result = await authService.getCurrentUser();
        
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          
          // Show session expired message (only if not already on login page)
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            showError(
              "Sesi Berakhir",
              result.message || "Sesi Anda telah berakhir. Silakan login kembali.",
              () => {
                window.location.href = '/login';
              }
            );
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setToken(result.token);
        setUser(result.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: 'Terjadi kesalahan saat login' 
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Silent fail
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return { success: true, message: 'Logout berhasil' };
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return { success: false, message: 'Terjadi kesalahan saat registrasi' };
    }
  }, []);

  // Update user function
  const updateUser = useCallback((updatedUser) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      if (result.success) {
        setToken(result.token);
        localStorage.setItem('token', result.token);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }, []);

  // Get user role
  const getUserRole = useCallback(() => {
    if (user) return user.role;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser).role;
      } catch {
        return null;
      }
    }
    return null;
  }, [user]);

  // Check if authenticated
  const checkIsAuthenticated = useCallback(() => {
    return !!localStorage.getItem('token') && !!user && isAuthenticated;
  }, [user, isAuthenticated]);

  // Get current user
  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  // Clear auth state
  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value = {
    user,
    loading,
    token,
    isAuthenticated: checkIsAuthenticated(),
    getUserRole,
    login,
    logout,
    register,
    updateUser,
    refreshToken,
    getCurrentUser,
    clearAuth,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};