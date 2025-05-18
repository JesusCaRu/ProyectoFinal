import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configurar axios con el token por defecto
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

export const useVentaStore = create((set, get) => ({
    ventas: [],
    ventaActual: null,
    loading: false,
    error: null,
    resumen: null,
    productosMasVendidos: [],

    // Cargar todas las ventas
    fetchVentas: async () => {
        set({ loading: true, error: null });
        try {
            // Asegurarnos que el token esté actualizado
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await axios.get(`${API_URL}/ventas`);
            console.log('Respuesta de ventas:', response.data);
            // Asegurarnos de que estamos usando el array de ventas correctamente
            const ventas = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response.data.data) ? response.data.data : [];
            set({ ventas, loading: false });
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            if (error.response?.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            set({ error: error.message, loading: false, ventas: [] });
        }
    },

    // Cargar ventas por rango de fechas
    fetchVentasByDateRange: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('/api/ventas/por-fechas', {
                params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
            });
            set({ ventas: response.data.data, loading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Error al cargar las ventas',
                loading: false 
            });
        }
    },

    // Cargar resumen de ventas
    fetchResumen: async (fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            // Validar que las fechas sean válidas
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas proporcionadas no son válidas');
            }

            // Formatear las fechas para la API
            const params = {
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0]
            };

            console.log('Solicitando resumen con fechas:', params);

            // Asegurarnos que el token esté actualizado
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Usar la URL correcta con el prefijo /api
            const response = await axios.get(`${API_URL}/ventas/resumen`, { 
                params,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta del resumen:', response.data);

            // Validar la estructura de la respuesta
            if (!response.data || !response.data.data) {
                throw new Error('Formato de respuesta inválido');
            }

            const { resumen, productos_mas_vendidos } = response.data.data;

            // Validar y establecer valores por defecto si es necesario
            set({ 
                resumen: {
                    total_monto: Number(resumen?.total_monto) || 0,
                    total_ventas: Number(resumen?.total_ventas) || 0,
                    promedio_venta: Number(resumen?.promedio_venta) || 0
                },
                productosMasVendidos: Array.isArray(productos_mas_vendidos) ? 
                    productos_mas_vendidos.map(item => ({
                        producto: item.producto || { nombre: 'Producto desconocido' },
                        total_vendido: Number(item.total_vendido) || 0,
                        total_monto: Number(item.total_monto) || 0
                    })) : [],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error al cargar el resumen:', error);
            if (error.response?.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            set({ 
                error: error.response?.data?.message || error.message || 'Error al cargar el resumen',
                loading: false,
                resumen: {
                    total_monto: 0,
                    total_ventas: 0,
                    promedio_venta: 0
                },
                productosMasVendidos: []
            });
        }
    },

    // Crear una nueva venta
    createVenta: async (ventaData) => {
        set({ loading: true, error: null });
        try {
            console.log('Iniciando creación de venta con datos:', ventaData);
            
            // Asegurarnos que el token esté actualizado
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Validar la estructura de los datos antes de enviar
            if (!ventaData.productos || !Array.isArray(ventaData.productos) || ventaData.productos.length === 0) {
                throw new Error('Los datos de la venta no son válidos');
            }

            // Validar cada producto
            ventaData.productos.forEach((item, index) => {
                if (!item.producto_id || !item.cantidad) {
                    throw new Error(`Datos inválidos en el producto ${index + 1}`);
                }
            });

            console.log('Enviando petición a:', `${API_URL}/ventas`);
            console.log('Headers:', axios.defaults.headers.common);
            
            const response = await axios.post(`${API_URL}/ventas`, ventaData);
            
            console.log('Respuesta completa del servidor:', response);
            console.log('Datos de la venta creada:', response.data);

            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }

            const ventaCreada = response.data.data || response.data;
            console.log('Venta procesada:', ventaCreada);

            set(state => ({
                ventas: [...state.ventas, ventaCreada],
                ventaActual: ventaCreada,
                loading: false
            }));

            return ventaCreada;
        } catch (error) {
            console.error('Error detallado al crear venta:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: error.config
            });

            let errorMessage = 'Error al crear la venta';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            set({ 
                error: errorMessage, 
                loading: false 
            });
            
            throw error;
        }
    },

    // Obtener una venta específica
    fetchVenta: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/ventas/${id}`);
            console.log('Venta obtenida:', response.data);
            // Asegurarnos de que estamos usando los datos correctos
            const ventaData = response.data.data || response.data;
            set({ ventaActual: ventaData, loading: false });
            return ventaData;
        } catch (error) {
            console.error('Error al obtener venta:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Actualizar una venta
    updateVenta: async (id, ventaData) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.put(`${API_URL}/ventas/${id}`, ventaData);
            console.log('Venta actualizada:', response.data);
            set(state => ({
                ventas: state.ventas.map(venta => 
                    venta.id === id ? response.data : venta
                ),
                ventaActual: response.data,
                loading: false
            }));
            return response.data;
        } catch (error) {
            console.error('Error al actualizar venta:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Eliminar una venta
    deleteVenta: async (id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`${API_URL}/ventas/${id}`);
            set(state => ({
                ventas: state.ventas.filter(venta => venta.id !== id),
                ventaActual: state.ventaActual?.id === id ? null : state.ventaActual,
                loading: false
            }));
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Limpiar el estado
    clearError: () => set({ error: null }),
    clearVentaActual: () => set({ ventaActual: null }),

    // Obtener estadísticas de ventas
    getVentasStats: () => {
        const ventas = get().ventas || [];
        if (!Array.isArray(ventas)) {
            console.error('ventas no es un array:', ventas);
            return {
                totalVentas: 0,
                totalVentasHoy: 0,
                ventasPendientes: 0,
                totalProductosVendidos: 0
            };
        }

        const totalVentas = ventas.reduce((sum, venta) => sum + (Number(venta.total) || 0), 0);
        const ventasHoy = ventas.filter(venta => {
            try {
                const ventaDate = new Date(venta.fecha);
                const hoy = new Date();
                return ventaDate.toDateString() === hoy.toDateString();
            } catch (e) {
                console.error('Error al procesar fecha de venta:', e);
                return false;
            }
        });
        const totalVentasHoy = ventasHoy.reduce((sum, venta) => sum + (Number(venta.total) || 0), 0);
        const ventasPendientes = ventas.filter(venta => venta.estado === 'pendiente').length;
        const totalProductosVendidos = ventas.reduce((sum, venta) => {
            try {
                return sum + (venta.detalles?.reduce((sumDet, det) => 
                    sumDet + (Number(det.cantidad) || 0), 0) || 0);
            } catch (e) {
                console.error('Error al procesar detalles de venta:', e);
                return sum;
            }
        }, 0);

        return {
            totalVentas,
            totalVentasHoy,
            ventasPendientes,
            totalProductosVendidos
        };
    },

    // Actualizar el token cuando sea necesario
    updateAuthToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    }
})); 