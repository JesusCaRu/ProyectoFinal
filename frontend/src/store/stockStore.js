import { create } from 'zustand'
import useAuthStore from './authStore'

const useStockStore = create((set) => ({
  products: [],
  categories: [],
  brands: [],
  locations: [],
  loading: false,
  error: null,

  // Obtener todos los productos
  fetchProducts: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8000/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok) {
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (typeof data === 'object') {
          productsArray = [data];
        }
        
        console.log('Processed Products:', productsArray);
        set({ products: productsArray, loading: false });
      } else {
        console.error('API Error:', data);
        set({ error: data.message || 'Error al cargar los productos', loading: false, products: [] });
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      set({ error: 'Error al cargar los productos', loading: false, products: [] });
    }
  },

  // Obtener categorías
  fetchCategories: async () => {
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch('http://localhost:8000/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        let categoriesArray = Array.isArray(data) ? data : (data.data || []);
        set(state => ({ categories: categoriesArray }));
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  },

  // Obtener marcas
  fetchBrands: async () => {
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch('http://localhost:8000/api/marcas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        let brandsArray = Array.isArray(data) ? data : (data.data || []);
        set(state => ({ brands: brandsArray }));
      }
    } catch (err) {
      console.error('Error al cargar marcas:', err);
    }
  },

  // Obtener sedes
  fetchLocations: async () => {
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch('http://localhost:8000/api/sedes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        let locationsArray = Array.isArray(data) ? data : (data.data || []);
        set(state => ({ locations: locationsArray }));
      }
    } catch (err) {
      console.error('Error al cargar sedes:', err);
    }
  },

  // Agregar un nuevo producto
  addProduct: async (productData) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const formattedData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion,
        categoria_id: parseInt(productData.categoria_id),
        marca_id: parseInt(productData.marca_id),
        stock: parseInt(productData.stock),
        precio_compra: parseFloat(productData.precio_compra || 0),
        precio_venta: parseFloat(productData.precio_venta || 0),
        sede_id: parseInt(productData.sede_id)
      };

      const response = await fetch('http://localhost:8000/api/productos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      const data = await response.json();
      console.log('Add Product Response:', data);
      
      if (response.ok) {
        set(state => ({
          products: [...state.products, data],
          loading: false
        }));
        return { success: true };
      } else {
        set({ error: data.message, loading: false });
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('Error al agregar producto:', err);
      set({ error: 'Error al agregar el producto', loading: false });
      return { success: false, error: 'Error al agregar el producto' };
    }
  },

  // Actualizar un producto
  updateProduct: async (id, productData) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const formattedData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion,
        categoria_id: parseInt(productData.categoria_id),
        marca_id: parseInt(productData.marca_id),
        stock: parseInt(productData.stock),
        precio_compra: parseFloat(productData.precio_compra || 0),
        precio_venta: parseFloat(productData.precio_venta || 0),
        sede_id: parseInt(productData.sede_id)
      };

      const response = await fetch(`http://localhost:8000/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      const data = await response.json();
      console.log('Update Product Response:', data);
      
      if (response.ok) {
        set(state => ({
          products: state.products.map(product => 
            product.id === id ? data : product
          ),
          loading: false
        }));
        return { success: true };
      } else {
        set({ error: data.message, loading: false });
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      set({ error: 'Error al actualizar el producto', loading: false });
      return { success: false, error: 'Error al actualizar el producto' };
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8000/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        set(state => ({
          products: state.products.filter(product => product.id !== id),
          loading: false
        }));
        return { success: true };
      } else {
        const data = await response.json();
        set({ error: data.message, loading: false });
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      set({ error: 'Error al eliminar el producto', loading: false });
      return { success: false, error: 'Error al eliminar el producto' };
    }
  }
}));

export default useStockStore; 