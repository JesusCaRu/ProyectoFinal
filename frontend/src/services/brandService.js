import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const brandService = {
  fetchBrands: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/marcas`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar las marcas');
    }
  },

  createBrand: async (brandData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/marcas`, brandData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la marca');
    }
  },

  updateBrand: async (id, brandData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/marcas/${id}`, brandData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la marca');
    }
  },

  deleteBrand: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/marcas/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la marca');
    }
  }
}; 