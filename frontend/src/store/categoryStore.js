import { create } from 'zustand';
import { categoryService } from '../services/categoryService';

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.fetchCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory],
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

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
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

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
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