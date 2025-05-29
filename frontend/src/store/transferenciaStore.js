import { create } from 'zustand';
import { transferenciaService } from '../services/transferenciaService';

export const useTransferenciaStore = create((set) => ({
  transferencias: [],
  isLoading: false,
  error: null,

  fetchTransferencias: async () => {
    set({ isLoading: true, error: null });
    try {
      const transferencias = await transferenciaService.fetchTransferencias();
      set({ transferencias, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, transferencias: [] });
    }
  },

  createTransferencia: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const nueva = await transferenciaService.createTransferencia(data);
      set((state) => ({
        transferencias: [nueva, ...state.transferencias],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateTransferencia: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await transferenciaService.updateTransferencia(id, data);
      set((state) => ({
        transferencias: state.transferencias.map((t) => t.id === id ? updated : t),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteTransferencia: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transferenciaService.deleteTransferencia(id);
      set((state) => ({
        transferencias: state.transferencias.filter((t) => t.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
})); 