import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const transferenciaService = {
  fetchTransferencias: async () => {
    const response = await axiosInstance.get(`${API_URL}/transferencias`);
    return response.data.data;
  },
  createTransferencia: async (transferenciaData) => {
    const response = await axiosInstance.post(`${API_URL}/transferencias`, transferenciaData);
    return response.data.data;
  },
  updateTransferencia: async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/transferencias/${id}`, data);
    return response.data.data;
  },
  deleteTransferencia: async (id) => {
    await axiosInstance.delete(`${API_URL}/transferencias/${id}`);
    return true;
  },
  getTransferenciaById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/transferencias/${id}`);
    return response.data.data;
  }
}; 