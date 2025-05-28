import { create } from 'zustand';
import { compraService } from '../services/compraService';

export const useCompraStore = create((set) => ({
    compras: [],
    loading: false,
    error: null,
    selectedCompra: null,
    resumen: null,
    productosMasComprados: [],

    // Fetch all purchases
    fetchCompras: async () => {
        set({ loading: true, error: null });
        try {
            const compras = await compraService.getCompras();
            set({ compras, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch purchases by date range
    fetchComprasByDateRange: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const compras = await compraService.getComprasByDateRange(fechaInicio, fechaFin);
            set({ compras, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Get purchase summary
    fetchResumen: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const response = await compraService.getResumen(fechaInicio, fechaFin);
            console.log('Resumen de compras:', response); // Para debugging
            set({ 
                resumen: response.resumen,
                productosMasComprados: response.productos_mas_comprados || [],
                loading: false 
            });
            return {
                resumen: response.resumen,
                productosMasComprados: response.productos_mas_comprados
            };
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            set({ 
                error: error.message,
                loading: false,
                resumen: null,
                productosMasComprados: []
            });
            throw error;
        }
    },

    // Create new purchase
    createCompra: async (compraData) => {
        set({ loading: true, error: null });
        try {
            const nuevaCompra = await compraService.createCompra(compraData);
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

    // Update purchase status
    updateCompraEstado: async (id, estado) => {
        set({ loading: true, error: null });
        try {
            const compraActualizada = await compraService.updateCompraEstado(id, estado);
            set(state => ({
                compras: state.compras.map(compra => 
                    compra.id === id ? compraActualizada : compra
                ),
                loading: false
            }));
            return compraActualizada;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Delete purchase
    deleteCompra: async (id) => {
        set({ loading: true, error: null });
        try {
            await compraService.deleteCompra(id);
            set(state => ({
                compras: state.compras.filter(compra => compra.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Set selected purchase
    setSelectedCompra: (compra) => {
        set({ selectedCompra: compra });
    },

    // Clear selected purchase
    clearSelectedCompra: () => {
        set({ selectedCompra: null });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    }
})); 