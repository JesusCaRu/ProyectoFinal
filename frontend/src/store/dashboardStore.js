import { create } from 'zustand';
import { dashboardService } from '../services/dashboardService';

const API_URL = import.meta.env.VITE_API_URL || 'http://92.112.194.87:8000/api';

export const useDashboardStore = create((set) => ({
  // Estado
  stats: null,
  isLoading: false,
  error: null,

  // Acciones
  fetchDashboardData: async (sede_id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardService.getDashboardData(sede_id);
      set({ stats: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
})); 