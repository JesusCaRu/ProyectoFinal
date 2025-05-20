import { create } from 'zustand';
import { compraService } from '../services/compraService';

export const useCompraStore = create((set, get) => ({
    compras: [],
    compraActual: null,
    loading: false,
    error: null,
    resumen: null,

    // Acciones
    setCompras: (compras) => set({ compras: Array.isArray(compras) ? compras : [] }),
    setCompraActual: (compra) => set({ compraActual: compra }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setResumen: (resumen) => set({ resumen }),

    // Fetch de compras
    fetchCompras: async () => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.getCompras();
            const compras = Array.isArray(response) ? response : 
                          Array.isArray(response.data) ? response.data : [];
            set({ compras, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false, compras: [] });
            throw error;
        }
    },

    // Fetch de compras por rango de fechas
    fetchComprasByDateRange: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.getComprasByDateRange(fechaInicio, fechaFin);
            const compras = Array.isArray(response) ? response : 
                          Array.isArray(response.data) ? response.data : [];
            set({ compras, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false, compras: [] });
            throw error;
        }
    },

    // Fetch de una compra específica
    fetchCompra: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.getCompra(id);
            const compra = response.data || response;
            set({ compraActual: compra, loading: false });
            return compra;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Fetch del resumen de compras
    fetchResumen: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.getResumen(fechaInicio, fechaFin);
            const resumen = response.data || response;
            set({ resumen, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Crear nueva compra
    createCompra: async (compraData) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.createCompra(compraData);
            const nuevaCompra = response.data || response;
            set(state => ({
                compras: [nuevaCompra, ...state.compras],
                loading: false
            }));
            return nuevaCompra;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Actualizar estado de compra
    updateCompraEstado: async (id, estado) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.updateCompraEstado(id, estado);
            const compraActualizada = response.data || response;
            set(state => ({
                compras: state.compras.map(compra => 
                    compra.id === id ? compraActualizada : compra
                ),
                compraActual: state.compraActual?.id === id ? compraActualizada : state.compraActual,
                loading: false
            }));
            return compraActualizada;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Cancelar compra
    cancelarCompra: async (id) => {
        return get().updateCompraEstado(id, 'cancelada');
    },

    // Completar compra
    completarCompra: async (id) => {
        return get().updateCompraEstado(id, 'completada');
    }
})); 