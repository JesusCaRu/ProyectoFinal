import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const productService = {
  // Productos
  fetchProducts: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los productos');
    }
  },

  getProductById: async (id, sedeId = null) => {
    try {
      const url = sedeId 
        ? `${API_URL}/productos/${id}?sede_id=${sedeId}`
        : `${API_URL}/productos/${id}`;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el producto');
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/productos`, productData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear el producto');
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/productos/${id}`, productData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el producto');
    }
  },

  deleteProduct: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/productos/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el producto');
    }
  },

  getProductsBySede: async (sedeId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos/por-sede/${sedeId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los productos por sede');
    }
  },

  getLowStockProducts: async (sedeId = null) => {
    try {
      const url = sedeId 
        ? `${API_URL}/productos/stock-bajo?sede_id=${sedeId}`
        : `${API_URL}/productos/stock-bajo`;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los productos con stock bajo');
    }
  },

  // Movimientos
  getMovementById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/movimientos/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el movimiento');
    }
  },

  createMovement: async (movementData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/movimientos`, movementData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear el movimiento');
    }
  },

  getMovementsByDateRange: async (fechaInicio, fechaFin, sedeId = null) => {
    try {
      const params = {
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      };
      
      if (sedeId) {
        params.sede_id = sedeId;
      }

      const response = await axiosInstance.get(`${API_URL}/movimientos/por-fecha`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar los movimientos por fecha');
    }
  },

  getMovementsSummary: async (fechaInicio, fechaFin, sedeId = null) => {
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
  },

  // Stock por sede
  updateProductStock: async (productId, sedeId, stock) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/productos/${productId}/stock`, {
        sede_id: sedeId,
        stock: stock
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el stock del producto');
    }
  },

  getProductStockBySede: async (productId, sedeId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos/${productId}/stock/${sedeId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el stock del producto');
    }
  }
}; 