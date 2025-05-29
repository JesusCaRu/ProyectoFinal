import { create } from 'zustand';
import { movimientoService } from '../services/movimientoService';

export const useMovimientoStore = create((set) => ({
    movimientos: [],
    isLoading: false,
    error: null,
    resumen: null,

    loadMovimientos: async () => {
        set({ isLoading: true, error: null });
        try {
            // Obtener la fecha actual y la fecha de hace 30 días
            const fechaFin = new Date();
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() - 30);

            console.log('Cargando movimientos con fechas:', { fechaInicio, fechaFin });

            const response = await movimientoService.getMovimientosByDateRange(fechaInicio, fechaFin);

            console.log('Respuesta completa de movimientos:', response);

            if (!response) {
                console.error('No hay datos en la respuesta:', response);
                throw new Error('No se recibieron datos de movimientos');
            }

            set({ 
                movimientos: response.movimientos || [], 
                resumen: response.resumen || [],
                isLoading: false 
            });
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            set({ 
                error: error.message || 'Error al cargar los movimientos', 
                isLoading: false,
                movimientos: [],
                resumen: []
            });
        }
    },

    addMovimiento: async (movimiento) => {
        set({ isLoading: true, error: null });
        try {
            const response = await movimientoService.createMovimiento(movimiento);
            set(state => ({
                movimientos: [response, ...(Array.isArray(state.movimientos) ? state.movimientos : [])],
                isLoading: false
            }));
            return response;
        } catch (error) {
            set({ 
                error: error.message || 'Error al crear el movimiento', 
                isLoading: false 
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
})); 