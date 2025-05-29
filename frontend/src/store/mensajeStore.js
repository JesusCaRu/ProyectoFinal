import { create } from 'zustand';
import { mensajeService } from '../services/mensajeService';

export const useMensajeStore = create((set) => ({
  mensajes: [],
  isLoading: false,
  error: null,
  fetchMensajes: async (sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const mensajes = await mensajeService.fetchMensajes(sedeId);
      set({ mensajes, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, mensajes: [] });
    }
  },
  createMensaje: async (mensaje, sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const nuevo = await mensajeService.createMensaje(mensaje, sedeId);
      set((state) => ({
        mensajes: [nuevo, ...state.mensajes],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
})); 