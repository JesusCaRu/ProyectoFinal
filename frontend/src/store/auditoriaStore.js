import { create } from 'zustand';
import axios from 'axios';

export const useAuditoriaStore = create((set) => ({
    registros: [],
    acciones: [],
    tablas: [],
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        perPage: 15,
        currentPage: 1,
        lastPage: 1
    },

    fetchRegistros: async (filtros = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/auditoria', { params: filtros });
            if (response.data.success) {
                set({ 
                    registros: response.data.data.data || [],
                    pagination: {
                        total: response.data.data.total,
                        perPage: response.data.data.per_page,
                        currentPage: response.data.data.current_page,
                        lastPage: response.data.data.last_page
                    }
                });
            } else {
                throw new Error(response.data.message || 'Error al cargar registros');
            }
        } catch (error) {
            console.error('Error en fetchRegistros:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al cargar registros';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAcciones: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/auditoria/acciones');
            if (response.data.success) {
                set({ acciones: response.data.data || [] });
            } else {
                throw new Error(response.data.message || 'Error al cargar acciones');
            }
        } catch (error) {
            console.error('Error en fetchAcciones:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al cargar acciones';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTablas: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/auditoria/tablas');
            if (response.data.success) {
                set({ tablas: response.data.data || [] });
            } else {
                throw new Error(response.data.message || 'Error al cargar tablas');
            }
        } catch (error) {
            console.error('Error en fetchTablas:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al cargar tablas';
            set({ error: errorMessage });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    }
})); 