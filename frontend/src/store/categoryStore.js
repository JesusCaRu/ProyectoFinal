import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/categorias`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ categories: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar las categorías',
        isLoading: false 
      });
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/categorias`, categoryData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        categories: [...state.categories, response.data.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      set({ 
        error: error.response?.data?.message || 'Error al crear la categoría',
        isLoading: false 
      });
      return false;
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/categorias/${id}`, categoryData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? response.data.data : category
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la categoría',
        isLoading: false 
      });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/categorias/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ 
        error: error.response?.data?.message || 'Error al eliminar la categoría',
        isLoading: false 
      });
      return false;
    }
  }
})); 