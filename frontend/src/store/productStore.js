import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useProductStore = create((set, get) => ({
  products: [],
  movements: [],
  isLoading: false,
  error: null,

  // Cargar productos
  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/productos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Raw API response for products:', response.data.data?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        stock_type: typeof p.stock,
        stock_minimo_type: typeof p.stock_minimo
      })));
      
      // Procesar los datos para asegurar que sean strings o números
      const productsData = Array.isArray(response.data.data) 
        ? response.data.data.map(product => {
            const processedStock = Number(product.stock);
            const processedStockMinimo = Number(product.stock_minimo);
            
            console.log('Processing product stock:', {
              id: product.id,
              nombre: product.nombre,
              raw_stock: product.stock,
              raw_stock_minimo: product.stock_minimo,
              processed_stock: processedStock,
              processed_stock_minimo: processedStockMinimo,
              stock_type: typeof processedStock,
              stock_minimo_type: typeof processedStockMinimo
            });
            
            const processedProduct = {
              id: product.id,
              nombre: product.nombre || '',
              sku: product.sku || '',
              descripcion: product.descripcion || '',
              precio_venta: Number(product.precio_venta) || 0,
              precio_compra: Number(product.precio_compra) || 0,
              stock: processedStock || 0,
              stock_minimo: processedStockMinimo || 0,
              categoria_id: Number(product.categoria_id) || null,
              marca_id: Number(product.marca_id) || null,
              sede_id: Number(product.sede_id) || null,
              categoria: typeof product.categoria === 'object' ? product.categoria.nombre : (product.categoria || 'Sin categoría'),
              marca: typeof product.marca === 'object' ? product.marca.nombre : (product.marca || 'Sin marca'),
              sede: typeof product.sede === 'object' ? product.sede.nombre : (product.sede || 'Sin sede'),
              estado: product.estado || 'sin_stock',
              created_at: product.created_at,
              updated_at: product.updated_at
            };

            console.log('Final processed product:', {
              id: processedProduct.id,
              nombre: processedProduct.nombre,
              stock: processedProduct.stock,
              stock_minimo: processedProduct.stock_minimo,
              stock_type: typeof processedProduct.stock,
              stock_minimo_type: typeof processedProduct.stock_minimo
            });

            return processedProduct;
          })
        : [];

      console.log('All processed products stock info:', productsData.map(p => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        stock_type: typeof p.stock,
        stock_minimo_type: typeof p.stock_minimo
      })));
      
      set({ products: productsData, isLoading: false });
    } catch (error) {
      console.error('Error loading products:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar los productos',
        isLoading: false,
        products: []
      });
    }
  },

  // Cargar movimientos
  loadMovements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/movimientos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ movements: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error loading movements:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar los movimientos',
        isLoading: false,
        movements: []
      });
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/productos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      set({ 
        error: error.response?.data?.message || 'Error al obtener el producto',
        isLoading: false 
      });
      return null;
    }
  },

  // Obtener movimiento por ID
  getMovementById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/movimientos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error getting movement by ID:', error);
      set({ 
        error: error.response?.data?.message || 'Error al obtener el movimiento',
        isLoading: false 
      });
      return null;
    }
  },

  // Crear producto
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/productos`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        products: [...state.products, response.data.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error creating product:', error);
      set({ 
        error: error.response?.data?.message || 'Error al crear el producto',
        isLoading: false 
      });
      return false;
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/productos/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? response.data.data : product
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar el producto',
        isLoading: false 
      });
      return false;
    }
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/productos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      set({ 
        error: error.response?.data?.message || 'Error al eliminar el producto',
        isLoading: false 
      });
      return false;
    }
  },

  // Crear movimiento
  createMovement: async (movementData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/movimientos`, movementData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set((state) => ({
        movements: [...state.movements, response.data.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error creating movement:', error);
      set({ 
        error: error.response?.data?.message || 'Error al crear el movimiento',
        isLoading: false 
      });
      return false;
    }
  },

  // Obtener productos por sede
  getProductsBySede: async (sedeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/productos/sede/${sedeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ products: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error getting products by sede:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar los productos por sede',
        isLoading: false 
      });
    }
  },

  // Obtener productos con stock bajo
  getLowStockProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/productos/low-stock`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ products: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar los productos con stock bajo',
        isLoading: false 
      });
    }
  },

  // Obtener movimientos por rango de fechas
  getMovementsByDateRange: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/movimientos/por-fecha`, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ movements: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error getting movements by date range:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar los movimientos por fecha',
        isLoading: false 
      });
    }
  },

  // Obtener resumen de movimientos
  getMovementsSummary: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/movimientos/resumen`, {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error getting movements summary:', error);
      set({ 
        error: error.response?.data?.message || 'Error al obtener el resumen de movimientos',
        isLoading: false 
      });
      return null;
    }
  },

  // Buscar productos
  searchProducts: (query) => {
    const { products } = get();
    if (!query) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.nombre?.toLowerCase().includes(searchTerm) ||
      product.descripcion?.toLowerCase().includes(searchTerm) ||
      product.categoria?.nombre?.toLowerCase().includes(searchTerm)
    );
  },

  // Filtrar productos por categoría
  filterProductsByCategory: (categoryId) => {
    const { products } = get();
    if (!categoryId) return products;
    return products.filter(product => product.categoria_id === categoryId);
  },

  // Filtrar movimientos por tipo
  filterMovementsByType: (type) => {
    const { movements } = get();
    if (!type) return movements;
    return movements.filter(movement => movement.tipo === type);
  },

  // Obtener estadísticas de productos
  getProductStats: () => {
    const { products } = get();
    return {
      total: products.length,
      lowStock: products.filter(p => p.stock <= p.stock_minimo).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.precio_venta * p.stock), 0)
    };
  }
}));