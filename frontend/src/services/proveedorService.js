import  axiosInstance  from '../lib/axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const proveedorService = {
    // Obtener todos los proveedores
    getProveedores: async (timestamp = null) => {
        try {
            // Si se proporciona un timestamp, añadirlo como parámetro para evitar la caché
            const url = timestamp 
                ? `${API_URL}/proveedores?_=${timestamp}` 
                : `${API_URL}/proveedores`;
                
            console.log("Consultando proveedores en:", url);
            const response = await axiosInstance.get(url);
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
            const response = await axiosInstance.delete(`${API_URL}/proveedores/${id}`);
            
            // Añadir validación adicional y logging para depuración
            console.log("Respuesta al eliminar proveedor:", response);
            
            // Si la respuesta es exitosa pero contiene un mensaje de error
            if (response.data && response.data.message && response.status !== 200) {
                throw new Error(response.data.message);
            }
            
            return true;
        } catch (error) {
            console.error("Error completo al eliminar proveedor:", error);
            if (error.response && error.response.data) {
                console.error("Datos de error del servidor:", error.response.data);
                throw new Error(error.response.data.message || 'Error al eliminar el proveedor');
            }
            throw error;
        }
    }
}; 