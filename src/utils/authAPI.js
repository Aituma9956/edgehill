import { api } from './api';

// Auth API endpoints
export const authAPI = {
  // Get current user profile
  getUserProfile: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    const response = await api.put('/api/v1/auth/me', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/api/v1/auth/change-password', passwordData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/api/v1/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/v1/auth/reset-password', { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  }
};

// Export individual functions for easier imports
export const getUserProfile = authAPI.getUserProfile;
export const updateUserProfile = authAPI.updateUserProfile;
export const changePassword = authAPI.changePassword;
export const login = authAPI.login;
export const register = authAPI.register;
export const refreshToken = authAPI.refreshToken;
export const logout = authAPI.logout;
export const verifyEmail = authAPI.verifyEmail;
export const requestPasswordReset = authAPI.requestPasswordReset;
export const resetPassword = authAPI.resetPassword;

export default authAPI;
