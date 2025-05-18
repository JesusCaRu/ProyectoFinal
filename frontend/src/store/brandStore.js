import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useBrandStore = create((set) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/marcas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ brands: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error loading brands:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar las marcas',
        isLoading: false 
      });
    }
  },

  createBrand: async (brandData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/marcas`, brandData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        brands: [...state.brands, response.data.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error creating brand:', error);
      set({ 
        error: error.response?.data?.message || 'Error al crear la marca',
        isLoading: false 
      });
      return false;
    }
  },

  updateBrand: async (id, brandData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/marcas/${id}`, brandData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        brands: state.brands.map((brand) =>
          brand.id === id ? response.data.data : brand
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error updating brand:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la marca',
        isLoading: false 
      });
      return false;
    }
  },

  deleteBrand: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/marcas/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        brands: state.brands.filter((brand) => brand.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error deleting brand:', error);
      set({ 
        error: error.response?.data?.message || 'Error al eliminar la marca',
        isLoading: false 
      });
      return false;
    }
  }
})); 