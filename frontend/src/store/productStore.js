import { create } from 'zustand';
import { productService } from '../services/productService';

export const useProductStore = create((set, get) => ({
  products: [],
  movements: [],
  isLoading: false,
  error: null,

  // Cargar productos
  loadProducts: async (sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const products = sedeId 
        ? await productService.getProductsBySede(sedeId)
        : await productService.fetchProducts();
      
      // Asegurarse de que los productos tengan la estructura correcta
      const processedProducts = products.map(product => ({
        ...product,
        sedes: product.sedes || [],
        stock: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.stock || 0,
        precio_compra: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.precio_compra || 0,
        precio_venta: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.precio_venta || 0
      }));

      set({ products: processedProducts, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Cargar movimientos
  loadMovements: async (sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);

      const formattedFechaInicio = new Date(fechaInicio.toISOString().split('T')[0]);
      const formattedFechaFin = new Date(fechaFin.toISOString().split('T')[0]);

      const movements = await productService.getMovementsByDateRange(
        formattedFechaInicio,
        formattedFechaFin,
        sedeId
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
  getProductById: async (id, sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.getProductById(id, sedeId);
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
      
      // Asegurarse de que los productos tengan la estructura correcta
      const processedProducts = products.map(product => ({
        ...product,
        sedes: product.sedes || [],
        stock: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.stock || 0,
        precio_compra: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.precio_compra || 0,
        precio_venta: product.sedes?.find(s => s.id === Number(sedeId))?.pivot?.precio_venta || 0
      }));

      set({ products: processedProducts, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  // Obtener productos con stock bajo por sede
  getLowStockProducts: async (sedeId = null) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.getLowStockProducts(sedeId);
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
      console.log('Resumen de movimientos obtenido:', summary);
      set({ isLoading: false });
      return summary;
    } catch (error) {
      console.error('Error en getMovementsSummary:', error);
      set({ 
        error: error.message,
        isLoading: false 
      });
      return [];
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

  // Obtener estadísticas de productos por sede
  getProductStats: (sedeId = null) => {
    const { products } = get();
    const filteredProducts = sedeId 
      ? products.filter(p => p.sedes?.some(s => s.id === Number(sedeId)))
      : products;

    return {
      total: filteredProducts.length,
      lowStock: filteredProducts.filter(p => {
        const stock = p.sedes?.find(s => s.id === Number(sedeId))?.pivot?.stock || 0;
        return stock <= p.stock_minimo;
      }).length,
      outOfStock: filteredProducts.filter(p => {
        const stock = p.sedes?.find(s => s.id === Number(sedeId))?.pivot?.stock || 0;
        return stock === 0;
      }).length,
      totalValue: filteredProducts.reduce((sum, p) => {
        const stock = p.sedes?.find(s => s.id === Number(sedeId))?.pivot?.stock || 0;
        const precioVenta = p.sedes?.find(s => s.id === Number(sedeId))?.pivot?.precio_venta || 0;
        return sum + (precioVenta * stock);
      }, 0)
    };
  },

  // Obtener stock de un producto en una sede específica
  getProductStockInSede: (productId, sedeId) => {
    const { products } = get();
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const sedeStock = product.sedes?.find(s => s.id === sedeId);
    return sedeStock ? sedeStock.pivot.stock : 0;
  }
}));