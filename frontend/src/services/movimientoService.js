import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const movimientoService = {
    // Obtener todos los movimientos
    fetchMovimientos: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/movimientos`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar los movimientos');
        }
    },

    // Obtener movimiento por ID
    getMovimientoById: async (id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/movimientos/${id}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener el movimiento');
        }
    },

    // Crear un nuevo movimiento
    createMovimiento: async (movimientoData) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/movimientos`, movimientoData);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al crear el movimiento');
        }
    },

    // Eliminar un movimiento
    deleteMovimiento: async (id) => {
        try {
            await axiosInstance.delete(`${API_URL}/movimientos/${id}`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar el movimiento');
        }
    },

    // Obtener movimientos por rango de fechas
    getMovimientosByDateRange: async (fechaInicio, fechaFin, sedeId = null) => {
        try {
            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0]
            };
            
            if (sedeId) {
                params.sede_id = sedeId;
            }

            const response = await axiosInstance.get(`${API_URL}/movimientos/por-fecha`, { params });
            return {
                movimientos: response.data.data || [],
                resumen: response.data.resumen || []
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar los movimientos por fecha');
        }
    },

    // Obtener movimientos por producto
    getMovimientosByProducto: async (productoId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/movimientos/por-producto/${productoId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar los movimientos del producto');
        }
    },

    // Obtener movimientos por sede
    getMovimientosBySede: async (sedeId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/movimientos/por-sede/${sedeId}`);
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar los movimientos de la sede');
        }
    },

    // Obtener resumen de movimientos
    getMovimientosResumen: async (fechaInicio, fechaFin, sedeId = null) => {
        try {
            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0]
            };
            
            if (sedeId) {
                params.sede_id = sedeId;
            }

            const response = await axiosInstance.get(`${API_URL}/movimientos/resumen`, { params });
            return response.data.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener el resumen de movimientos');
        }
    }
}; 