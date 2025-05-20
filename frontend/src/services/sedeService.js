import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const sedeService = {
  fetchSedes: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/sedes`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar las sedes');
    }
  },

  createSede: async (sedeData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/sedes`, sedeData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la sede');
    }
  },

  updateSede: async (id, sedeData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/sedes/${id}`, sedeData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la sede');
    }
  },

  deleteSede: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/sedes/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la sede');
    }
  },

  getSedeById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/sedes/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la sede');
    }
  }
}; 