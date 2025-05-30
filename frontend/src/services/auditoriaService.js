import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const auditoriaService = {
    async fetchRegistros(filtros = {}) {
        try {
            const response = await axiosInstance.get(`${API_URL}/auditoria`, {
                params: filtros
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar registros de auditoría');
        }
    },

    async fetchAcciones() {
        try {
            const response = await axiosInstance.get(`${API_URL}/auditoria/acciones`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar acciones de auditoría');
        }
    },

    async fetchTablas() {
        try {
            const response = await axiosInstance.get(`${API_URL}/auditoria/tablas`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar tablas de auditoría');
        }
    },

    async fetchLogNames() {
        try {
            const response = await axiosInstance.get(`${API_URL}/auditoria/log-names`);
            return response.data;
        } catch (error) {
            // Si el endpoint no existe, no fallar y retornar una lista predefinida
            console.warn('Error al cargar log_names, usando valores predefinidos:', error);
            return {
                success: true,
                data: ['sistema', 'autenticacion', 'ventas', 'compras', 'transferencias', 'inventario']
            };
        }
    },

    async getRegistroById(id) {
        try {
            const response = await axiosInstance.get(`${API_URL}/auditoria/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar registro de auditoría');
        }
    }
}; 