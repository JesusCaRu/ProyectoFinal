import { create } from 'zustand';
import { productService } from '../services/productService';

export const useProductStore = create((set, get) => ({
  products: [],
  movements: [],
  isLoading: false,
  error: null,

  // Cargar productos
  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.fetchProducts();
      set({ products, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Cargar movimientos
  loadMovements: async () => {
    set({ isLoading: true, error: null });
    try {
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30); // Últimos 30 días

      // Asegurarnos de que las fechas estén en el formato correcto
      const formattedFechaInicio = new Date(fechaInicio.toISOString().split('T')[0]);
      const formattedFechaFin = new Date(fechaFin.toISOString().split('T')[0]);

      const movements = await productService.getMovementsByDateRange(
        formattedFechaInicio,
        formattedFechaFin
      );
      set({ movements, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.getProductById(id);
      set({ isLoading: false });
      return product;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return null;
    }
  },

  // Crear producto
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productService.createProduct(productData);
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProduct = await productService.updateProduct(id, productData);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? updatedProduct : product
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Obtener productos por sede
  getProductsBySede: async (sedeId) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.getProductsBySede(sedeId);
      set({ products, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Obtener productos con stock bajo
  getLowStockProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.getLowStockProducts();
      set({ products, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Obtener movimiento por ID
  getMovementById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const movement = await productService.getMovementById(id);
      set({ isLoading: false });
      return movement;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return null;
    }
  },

  // Crear movimiento
  createMovement: async (movementData) => {
    set({ isLoading: true, error: null });
    try {
      const newMovement = await productService.createMovement(movementData);
      set((state) => ({
        movements: [...state.movements, newMovement],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Obtener movimientos por rango de fechas
  getMovementsByDateRange: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const movements = await productService.getMovementsByDateRange(fechaInicio, fechaFin);
      set({ movements, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Obtener resumen de movimientos
  getMovementsSummary: async (fechaInicio, fechaFin) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await productService.getMovementsSummary(fechaInicio, fechaFin);
      set({ isLoading: false });
      return summary;
    } catch (error) {
      set({ 
        error: error.message,
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