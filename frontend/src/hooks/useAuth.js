import { useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const authContext = useAuthContext();
  
  const login = useCallback(async (credentials) => {
    try {
      const result = await authContext.login(credentials);
      return result;
    } catch (error) {
      console.error('Login error in hook:', error);
      return { 
        success: false, 
        message: 'Terjadi kesalahan saat login' 
      };
    }
  }, [authContext]);

  const logout = useCallback(async () => {
    const result = await authContext.logout();
    return result;
  }, [authContext]);

  const register = useCallback(async (userData) => {
    const result = await authContext.register(userData);
    return result;
  }, [authContext]);

  const isAuthenticated = useCallback(() => {
    return authContext.isAuthenticated;
  }, [authContext.isAuthenticated]);

  const getUserRole = useCallback(() => {
    return authContext.getUserRole();
  }, [authContext]);

  const updateUser = useCallback((updatedUser) => {
    authContext.updateUser(updatedUser);
  }, [authContext]);

  const refreshToken = useCallback(async () => {
    return await authContext.refreshToken();
  }, [authContext]);

  const getCurrentUser = useCallback(() => {
    return authContext.getCurrentUser();
  }, [authContext]);

  const clearAuth = useCallback(() => {
    authContext.clearAuth();
  }, [authContext]);

  return {
    user: authContext.user,
    loading: authContext.loading,
    login,
    logout,
    register,
    updateUser,
    refreshToken,
    getCurrentUser,
    isAuthenticated,
    getUserRole,
    clearAuth,
  };
};