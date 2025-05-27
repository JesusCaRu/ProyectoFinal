import { create } from 'zustand';
import { auditoriaService } from '../services/auditoriaService';

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
            const response = await auditoriaService.fetchRegistros(filtros);
            if (response.success) {
                const registros = response.data.data.map(registro => ({
                    ...registro,
                    usuario: registro.causer,
                    accion: registro.description,
                    tabla: registro.subject_type ? registro.subject_type.split('\\').pop() : null,
                    registro_id: registro.subject_id,
                    fecha: registro.created_at
                }));
                
                set({ 
                    registros,
                    pagination: {
                        total: response.data.total,
                        perPage: response.data.per_page,
                        currentPage: response.data.current_page,
                        lastPage: response.data.last_page
                    }
                });
            } else {
                throw new Error(response.message || 'Error al cargar registros');
            }
        } catch (error) {
            console.error('Error en fetchRegistros:', error);
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAcciones: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await auditoriaService.fetchAcciones();
            if (response.success) {
                set({ acciones: response.data || [] });
            } else {
                throw new Error(response.message || 'Error al cargar acciones');
            }
        } catch (error) {
            console.error('Error en fetchAcciones:', error);
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTablas: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await auditoriaService.fetchTablas();
            if (response.success) {
                set({ tablas: response.data || [] });
            } else {
                throw new Error(response.message || 'Error al cargar tablas');
            }
        } catch (error) {
            console.error('Error en fetchTablas:', error);
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 