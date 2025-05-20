import { create } from 'zustand';
import { ventaService } from '../services/ventaService';

export const useVentaStore = create((set, get) => ({
    ventas: [],
    ventaActual: null,
    loading: false,
    error: null,
    resumen: null,
    productosMasVendidos: [],

    fetchVentas: async () => {
        set({ loading: true, error: null });
        try {
            const ventas = await ventaService.fetchVentas();
            set({ ventas, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false, ventas: [] });
        }
    },

    fetchVentasByDateRange: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const ventas = await ventaService.fetchVentasByDateRange(fechaInicio, fechaFin);
            set({ ventas, loading: false });
        } catch (error) {
            set({ 
                error: error.message,
                loading: false 
            });
        }
    },

    fetchResumen: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const resumen = await ventaService.fetchResumen(fechaInicio, fechaFin);
            set({ resumen, loading: false });
        } catch (error) {
            set({ 
                error: error.message,
                loading: false 
            });
        }
    },

    createVenta: async (ventaData) => {
        set({ loading: true, error: null });
        try {
            const ventaCreada = await ventaService.createVenta(ventaData);
            set(state => ({
                ventas: [...state.ventas, ventaCreada],
                ventaActual: ventaCreada,
                loading: false
            }));
            return ventaCreada;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    fetchVenta: async (id) => {
        set({ loading: true, error: null });
        try {
            const ventaData = await ventaService.getVentaById(id);
            set({ ventaActual: ventaData, loading: false });
            return ventaData;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateVenta: async (id, ventaData) => {
        set({ loading: true, error: null });
        try {
            const updatedVenta = await ventaService.updateVenta(id, ventaData);
            set(state => ({
                ventas: state.ventas.map(venta => 
                    venta.id === id ? updatedVenta : venta
                ),
                ventaActual: updatedVenta,
                loading: false
            }));
            return updatedVenta;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteVenta: async (id) => {
        set({ loading: true, error: null });
        try {
            await ventaService.deleteVenta(id);
            set(state => ({
                ventas: state.ventas.filter(venta => venta.id !== id),
                ventaActual: state.ventaActual?.id === id ? null : state.ventaActual,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearVentaActual: () => set({ ventaActual: null }),

    getVentasStats: () => {
        const ventas = get().ventas || [];
        if (!Array.isArray(ventas)) {
            console.error('ventas no es un array:', ventas);
            return {
                totalVentas: 0,
                totalVentasHoy: 0,
                ventasPendientes: 0,
                totalProductosVendidos: 0
            };
        }

        const totalVentas = ventas.reduce((sum, venta) => sum + (Number(venta.total) || 0), 0);
        const ventasHoy = ventas.filter(venta => {
            try {
                const ventaDate = new Date(venta.fecha);
                const hoy = new Date();
                return ventaDate.toDateString() === hoy.toDateString();
            } catch (e) {
                console.error('Error al procesar fecha de venta:', e);
                return false;
            }
        });
        const totalVentasHoy = ventasHoy.reduce((sum, venta) => sum + (Number(venta.total) || 0), 0);
        const ventasPendientes = ventas.filter(venta => venta.estado === 'pendiente').length;
        const totalProductosVendidos = ventas.reduce((sum, venta) => {
            try {
                return sum + (venta.detalles?.reduce((sumDet, det) => 
                    sumDet + (Number(det.cantidad) || 0), 0) || 0);
            } catch (e) {
                console.error('Error al procesar detalles de venta:', e);
                return sum;
            }
        }, 0);

        return {
            totalVentas,
            totalVentasHoy,
            ventasPendientes,
            totalProductosVendidos
        };
    }
})); 