import { create } from 'zustand';
import { facturaService } from '../services/facturaService';

export const useFacturaStore = create((set) => ({
    facturas: [],
    loading: false,
    error: null,

    /**
     * Obtener todas las facturas
     */
    fetchFacturas: async (filtros = {}) => {
        set({ loading: true, error: null });
        try {
            const facturas = await facturaService.getFacturas(filtros);
            set({ facturas, loading: false });
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            set({ error: error.message, loading: false });
        }
    },

    /**
     * Generar factura de venta
     */
    generarFacturaVenta: async (ventaId) => {
        set({ loading: true, error: null });
        try {
            await facturaService.generarFacturaVenta(ventaId);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error('Error al generar factura de venta:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    /**
     * Generar factura de compra
     */
    generarFacturaCompra: async (compraId) => {
        set({ loading: true, error: null });
        try {
            await facturaService.generarFacturaCompra(compraId);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error('Error al generar factura de compra:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    /**
     * Descargar factura
     */
    descargarFactura: async (tipo, id) => {
        set({ loading: true, error: null });
        try {
            await facturaService.descargarFactura(tipo, id);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error('Error al descargar factura:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    /**
     * Abrir factura en una nueva ventana
     */
    abrirFactura: async (tipo, id) => {
        set({ loading: true, error: null });
        try {
            await facturaService.abrirFactura(tipo, id);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error('Error al abrir factura:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    /**
     * Limpiar error
     */
    clearError: () => {
        set({ error: null });
    }
})); 