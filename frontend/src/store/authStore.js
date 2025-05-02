import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
})); 