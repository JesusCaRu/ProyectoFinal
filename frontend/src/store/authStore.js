import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.loadUser();
      if (user) {
        set({ user, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.log(error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('token');
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.login(credentials);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.register(userData);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  }
})); 