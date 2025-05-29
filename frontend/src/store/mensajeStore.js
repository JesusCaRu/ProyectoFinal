import { create } from 'zustand';
import { mensajeService } from '../services/mensajeService';

export const useMensajeStore = create((set) => ({
  mensajes: [],
  isLoading: false,
  error: null,

  fetchMensajes: async (sedeId = null) => {
    try {
      set({ isLoading: true, error: null });
      const mensajes = await mensajeService.fetchMensajes(sedeId);
      set({ mensajes: mensajes || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createMensaje: async (mensaje, sedeId = null) => {
    try {
      set({ isLoading: true, error: null });
      const newMensaje = await mensajeService.createMensaje(mensaje, sedeId);
      set(state => ({
        mensajes: [newMensaje, ...(state.mensajes || [])],
        isLoading: false
      }));
      return newMensaje;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  marcarLeido: async (mensajeId) => {
    try {
      set({ isLoading: true, error: null });
      const mensajeActualizado = await mensajeService.marcarLeido(mensajeId);
      set(state => ({
        mensajes: (state.mensajes || []).map(msg =>
          msg.id === mensajeId ? { ...msg, leido: true } : msg
        ),
        isLoading: false
      }));
      return mensajeActualizado;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  eliminarMensaje: async (mensajeId) => {
    try {
      set({ isLoading: true, error: null });
      await mensajeService.eliminarMensaje(mensajeId);
      set(state => ({
        mensajes: (state.mensajes || []).filter(msg => msg.id !== mensajeId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearMensajes: () => set({ mensajes: [] })
})); 