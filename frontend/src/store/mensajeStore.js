import { create } from 'zustand';
import { mensajeService } from '../services/mensajeService';
import { toast } from 'react-hot-toast';

// Función para persistir mensajes en localStorage
const saveMensajesToStorage = (mensajes) => {
  try {
    localStorage.setItem('cached_mensajes', JSON.stringify(mensajes));
  } catch (error) {
    console.error('Error al guardar mensajes en localStorage:', error);
  }
};

// Función para cargar mensajes desde localStorage
const loadMensajesFromStorage = () => {
  try {
    const cached = localStorage.getItem('cached_mensajes');
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error al cargar mensajes desde localStorage:', error);
    return [];
  }
};

export const useMensajeStore = create((set, get) => ({
  mensajes: loadMensajesFromStorage(),
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchMensajes: async (sedeId = null) => {
    try {
      // Si ya estamos cargando, no hacemos otra petición
      if (get().isLoading) return;
      
      // Si se han cargado hace menos de 10 segundos, no volvemos a cargar
      const now = Date.now();
      const lastFetched = get().lastFetched;
      if (lastFetched && now - lastFetched < 10000) return;
      
      set({ isLoading: true, error: null });
      const mensajes = await mensajeService.fetchMensajes(sedeId);
      
      // Guardar en localStorage y en el estado
      if (mensajes && Array.isArray(mensajes)) {
        saveMensajesToStorage(mensajes);
      }
      
      set({ 
        mensajes: mensajes || [], 
        isLoading: false,
        lastFetched: Date.now()
      });
      return mensajes;
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        lastFetched: Date.now() // Actualizamos para evitar peticiones continuas en caso de error
      });
      return [];
    }
  },

  createMensaje: async (mensaje, sedeId = null) => {
    try {
      set({ isLoading: true, error: null });
      const newMensaje = await mensajeService.createMensaje(mensaje, sedeId);
      
      // Actualizar el estado y localStorage
      const updatedMensajes = [newMensaje, ...(get().mensajes || [])];
      saveMensajesToStorage(updatedMensajes);
      
      set({
        mensajes: updatedMensajes,
        isLoading: false,
        lastFetched: Date.now()
      });
      return newMensaje;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      set({ error: error.message, isLoading: false });
      toast.error(error.message || 'Error al enviar mensaje');
      return null;
    }
  },

  marcarLeido: async (mensajeId) => {
    try {
      set({ isLoading: true, error: null });
      const mensajeActualizado = await mensajeService.marcarLeido(mensajeId);
      
      // Actualizar el estado y localStorage
      const updatedMensajes = (get().mensajes || []).map(msg =>
        msg.id === mensajeId ? { ...msg, leido: true } : msg
      );
      saveMensajesToStorage(updatedMensajes);
      
      set({
        mensajes: updatedMensajes,
        isLoading: false
      });
      return mensajeActualizado;
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  marcarTodosLeidos: async (sedeId = null) => {
    try {
      set({ isLoading: true, error: null });
      await mensajeService.marcarTodosLeidos(sedeId);
      
      // Actualizar el estado y localStorage
      const updatedMensajes = (get().mensajes || []).map(msg => ({ ...msg, leido: true }));
      saveMensajesToStorage(updatedMensajes);
      
      set({
        mensajes: updatedMensajes,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Error al marcar todos como leídos:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  eliminarMensaje: async (mensajeId) => {
    try {
      set({ isLoading: true, error: null });
      await mensajeService.eliminarMensaje(mensajeId);
      
      // Actualizar el estado y localStorage
      const updatedMensajes = (get().mensajes || []).filter(msg => msg.id !== mensajeId);
      saveMensajesToStorage(updatedMensajes);
      
      set({
        mensajes: updatedMensajes,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  clearMensajes: () => {
    localStorage.removeItem('cached_mensajes');
    set({ mensajes: [], lastFetched: null });
  }
})); 