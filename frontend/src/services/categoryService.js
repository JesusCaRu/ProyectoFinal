import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const categoryService = {
  fetchCategories: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/categorias`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar las categorías');
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/categorias`, categoryData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la categoría');
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/categorias/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la categoría');
    }
  },

  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/categorias/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la categoría');
    }
  }
}; 