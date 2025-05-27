import axiosInstance from '../lib/axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const compraService = {
    // Obtener todas las compras
    getCompras: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/compras`);
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener las compras');
        }
    },

    // Obtener compras por rango de fechas
    getComprasByDateRange: async (fechaInicio, fechaFin) => {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas proporcionadas no son válidas');
            }

            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0]
            };

            const response = await axiosInstance.get(`${API_URL}/compras/date-range`, { params });
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener las compras por fecha');
        }
    },

    // Obtener una compra específica
    getCompra: async (id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/compras/${id}`);
            return response.data.data || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener la compra');
        }
    },

    // Obtener resumen de compras
    getResumen: async (fechaInicio, fechaFin) => {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas proporcionadas no son válidas');
            }

            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0]
            };

            const response = await axiosInstance.get(`${API_URL}/compras/resumen`, { params });
            return response.data.data || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener el resumen de compras');
        }
    },

    // Crear nueva compra
    createCompra: async (compraData) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/compras`, compraData);
            return response.data.data || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al crear la compra');
        }
    },

    // Actualizar estado de compra
    updateCompraEstado: async (id, estado) => {
        try {
            const response = await axiosInstance.patch(`${API_URL}/compras/${id}`, { estado });
            return response.data.data || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la compra');
        }
    },

    // Eliminar compra
    deleteCompra: async (id) => {
        try {
            const response = await axiosInstance.delete(`${API_URL}/compras/${id}`);
            return response.data.data || response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar la compra');
        }
    },

    // Cancelar compra
    cancelarCompra: async (id) => {
        return compraService.updateCompraEstado(id, 'cancelada');
    },

    // Completar compra
    completarCompra: async (id) => {
        return compraService.updateCompraEstado(id, 'completada');
    }
}; 