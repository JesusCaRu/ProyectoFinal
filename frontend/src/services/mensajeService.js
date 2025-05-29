import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const mensajeService = {
  fetchMensajes: async (sedeId = null) => {
    try {
      const url = `${API_URL}/sedes/mensajes`;
      const params = sedeId ? { sede_id: sedeId } : {};
      const res = await axiosInstance.get(url, { params });
      return res.data.data;
    } catch (error) {
      console.error('Error en fetchMensajes:', error);
      return [];
    }
  },

  createMensaje: async (mensaje, sedeId = null) => {
    try {
      const res = await axiosInstance.post(`${API_URL}/sedes/mensajes`, {
        mensaje,
        sede_id: sedeId
      });
      return res.data.data;
    } catch (error) {
      console.error('Error en createMensaje:', error);
      throw error;
    }
  },

  marcarLeido: async (mensajeId) => {
    try {
      const res = await axiosInstance.put(`${API_URL}/sedes/mensajes/${mensajeId}/leido`);
      return res.data.data;
    } catch (error) {
      console.error('Error en marcarLeido:', error);
      throw error;
    }
  },

  eliminarMensaje: async (mensajeId) => {
    try {
      const res = await axiosInstance.delete(`${API_URL}/sedes/mensajes/${mensajeId}`);
      return res.data;
    } catch (error) {
      console.error('Error en eliminarMensaje:', error);
      throw error;
    }
  }
};