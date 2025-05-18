import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useSedeStore = create((set) => ({
  sedes: [],
  isLoading: false,
  error: null,

  fetchSedes: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching sedes...');
      const response = await axios.get(`${API_URL}/sedes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Sedes response:', response.data);
      const sedesData = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Processed sedes data:', sedesData);
      set({ sedes: sedesData, isLoading: false });
    } catch (error) {
      console.error('Error fetching sedes:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar las sedes',
        isLoading: false,
        sedes: []
      });
    }
  },

  createSede: async (sedeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/sedes`, sedeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        sedes: [...state.sedes, response.data.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error creating sede:', error);
      set({ 
        error: error.response?.data?.message || 'Error al crear la sede',
        isLoading: false 
      });
      return false;
    }
  },

  updateSede: async (id, sedeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/sedes/${id}`, sedeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        sedes: state.sedes.map((sede) =>
          sede.id === id ? response.data.data : sede
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error updating sede:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la sede',
        isLoading: false 
      });
      return false;
    }
  },

  deleteSede: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/sedes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        sedes: state.sedes.filter((sede) => sede.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error deleting sede:', error);
      set({ 
        error: error.response?.data?.message || 'Error al eliminar la sede',
        isLoading: false 
      });
      return false;
    }
  },

  getSedeById: (id) => {
    const state = useSedeStore.getState();
    console.log('Getting sede by ID:', id, 'Current sedes:', state.sedes);
    return state.sedes.find((sede) => sede.id === id);
  },

  getSedeName: (id) => {
    const state = useSedeStore.getState();
    console.log('Getting sede name for ID:', id, 'Current sedes:', state.sedes);
    const sede = state.sedes.find((sede) => sede.id === id);
    return sede ? sede.nombre : 'No asignada';
  }
})); 