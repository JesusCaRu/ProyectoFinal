import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const ventaService = {
  fetchVentas: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/ventas`);
      return Array.isArray(response.data) ? response.data : 
             Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar ventas');
    }
  },

  fetchVentasByDateRange: async (fechaInicio, fechaFin) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/ventas/por-fechas`, {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar las ventas por fecha');
    }
  },

  fetchResumen: async (fechaInicio, fechaFin) => {
    try {
      if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
        throw new Error('Las fechas proporcionadas no son válidas');
      }

      const params = {
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      };

      console.log('Enviando parámetros:', params); // Para debugging

      const response = await axiosInstance.get(`${API_URL}/ventas/resumen`, { 
        params,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.data); // Para debugging

      if (!response.data || !response.data.data) {
        throw new Error('Formato de respuesta inválido');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en fetchResumen:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el resumen de ventas');
    }
  },

  createVenta: async (ventaData) => {
    try {
      if (!ventaData.productos || !Array.isArray(ventaData.productos) || ventaData.productos.length === 0) {
        throw new Error('Los datos de la venta no son válidos');
      }

      ventaData.productos.forEach((item, index) => {
        if (!item.producto_id || !item.cantidad) {
          throw new Error(`Datos inválidos en el producto ${index + 1}`);
        }
      });

      const response = await axiosInstance.post(`${API_URL}/ventas`, ventaData);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la venta');
    }
  },

  getVentaById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/ventas/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la venta');
    }
  },

  updateVenta: async (id, ventaData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/ventas/${id}`, ventaData);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la venta');
    }
  },

  deleteVenta: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/ventas/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la venta');
    }
  }
}; 