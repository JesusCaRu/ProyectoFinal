import  axiosInstance  from '../lib/axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const proveedorService = {
    // Obtener todos los proveedores
    getProveedores: async () => {
        try {
            const response = await axiosInstance.get(`${API_URL}/proveedores`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener los proveedores');
        }
    },

    // Obtener un proveedor específico
    getProveedor: async (id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/proveedores/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener el proveedor');
        }
    },

    // Crear nuevo proveedor
    createProveedor: async (proveedorData) => {
        try {
            const response = await axiosInstance.post(`${API_URL}/proveedores`, proveedorData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al crear el proveedor');
        }
    },

    // Actualizar proveedor
    updateProveedor: async (id, proveedorData) => {
        try {
            const response = await axiosInstance.put(`${API_URL}/proveedores/${id}`, proveedorData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al actualizar el proveedor');
        }
    },

    // Eliminar proveedor
    deleteProveedor: async (id) => {
        try {
            await axiosInstance.delete(`${API_URL}/proveedores/${id}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar el proveedor');
        }
    }
}; 