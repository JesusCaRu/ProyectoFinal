import { create } from 'zustand';
import { brandService } from '../services/brandService';

export const useBrandStore = create((set) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const brands = await brandService.fetchBrands();
      set({ brands, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createBrand: async (brandData) => {
    set({ isLoading: true, error: null });
    try {
      const newBrand = await brandService.createBrand(brandData);
      set((state) => ({
        brands: [...state.brands, newBrand],
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

  updateBrand: async (id, brandData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedBrand = await brandService.updateBrand(id, brandData);
      set((state) => ({
        brands: state.brands.map((brand) =>
          brand.id === id ? updatedBrand : brand
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

  deleteBrand: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await brandService.deleteBrand(id);
      set((state) => ({
        brands: state.brands.filter((brand) => brand.id !== id),
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
  }
})); 