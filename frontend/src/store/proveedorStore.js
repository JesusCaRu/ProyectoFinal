import { create } from 'zustand';
import { proveedorService } from '../services/proveedorService';

export const useProveedorStore = create((set) => ({
    proveedores: [],
    proveedorActual: null,
    loading: false,
    error: null,

    // Acciones
    setProveedores: (proveedores) => set({ proveedores: Array.isArray(proveedores) ? proveedores : [] }),
    setProveedorActual: (proveedor) => set({ proveedorActual: proveedor }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch de proveedores
    fetchProveedores: async () => {
        set({ loading: true, error: null });
        try {
            const response = await proveedorService.getProveedores();
            const proveedores = Array.isArray(response) ? response : 
                              Array.isArray(response.data) ? response.data : [];
            set({ proveedores, loading: false });
        } catch (error) {
            set({ 
                error: error.message, 
                loading: false,
                proveedores: [] 
            });
            throw error;
        }
    },

    // Fetch de un proveedor específico
    fetchProveedor: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await proveedorService.getProveedor(id);
            const proveedor = response.data || response;
            set({ proveedorActual: proveedor, loading: false });
            return proveedor;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Crear nuevo proveedor
    createProveedor: async (proveedorData) => {
        set({ loading: true, error: null });
        try {
            const response = await proveedorService.createProveedor(proveedorData);
            const nuevoProveedor = response.data || response;
            set(state => ({
                proveedores: [nuevoProveedor, ...(Array.isArray(state.proveedores) ? state.proveedores : [])],
                loading: false
            }));
            return nuevoProveedor;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Actualizar proveedor
    updateProveedor: async (id, proveedorData) => {
        set({ loading: true, error: null });
        try {
            const response = await proveedorService.updateProveedor(id, proveedorData);
            const proveedorActualizado = response.data || response;
            set(state => ({
                proveedores: (Array.isArray(state.proveedores) ? state.proveedores : []).map(proveedor => 
                    proveedor.id === id ? proveedorActualizado : proveedor
                ),
                proveedorActual: state.proveedorActual?.id === id ? proveedorActualizado : state.proveedorActual,
                loading: false
            }));
            return proveedorActualizado;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Eliminar proveedor
    deleteProveedor: async (id) => {
        set({ loading: true, error: null });
        try {
            await proveedorService.deleteProveedor(id);
            set(state => ({
                proveedores: (Array.isArray(state.proveedores) ? state.proveedores : []).filter(proveedor => proveedor.id !== id),
                proveedorActual: state.proveedorActual?.id === id ? null : state.proveedorActual,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
})); 