import { create } from 'zustand';
import { sedeService } from '../services/sedeService';

export const useSedeStore = create((set) => ({
  sedes: [],
  isLoading: false,
  error: null,

  fetchSedes: async () => {
    set({ isLoading: true, error: null });
    try {
      const sedes = await sedeService.fetchSedes();
      set({ sedes, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false,
        sedes: []
      });
    }
  },

  createSede: async (sedeData) => {
    set({ isLoading: true, error: null });
    try {
      const newSede = await sedeService.createSede(sedeData);
      set((state) => ({
        sedes: [...state.sedes, newSede],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  updateSede: async (id, sedeData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSede = await sedeService.updateSede(id, sedeData);
      set((state) => ({
        sedes: state.sedes.map((sede) =>
          sede.id === id ? updatedSede : sede
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  deleteSede: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await sedeService.deleteSede(id);
      set((state) => ({
        sedes: state.sedes.filter((sede) => sede.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  getSedeById: (id) => {
    const state = useSedeStore.getState();
    return state.sedes.find((sede) => sede.id === id);
  },

  getSedeName: (id) => {
    const state = useSedeStore.getState();
    const sede = state.sedes.find((sede) => sede.id === id);
    return sede ? sede.nombre : 'No asignada';
  }
})); 