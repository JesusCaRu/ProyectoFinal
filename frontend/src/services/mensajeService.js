import axiosInstance from '../lib/axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const mensajeService = {
  fetchMensajes: async (sedeId = null) => {
    const url = sedeId ? `${API_URL}/sedes/mensajes?sede_id=${sedeId}` : `${API_URL}/sedes/mensajes`;
    const res = await axiosInstance.get(url);
    return res.data.data;
  },
  createMensaje: async (mensaje, sedeId = null) => {
    const res = await axiosInstance.post(`${API_URL}/sedes/mensajes`, { mensaje, sede_id: sedeId });
    return res.data.data;
  }
}; 