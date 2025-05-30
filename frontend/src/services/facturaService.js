import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const facturaService = {
    /**
     * Obtener todas las facturas
     */
    getFacturas: async (filtros = {}) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/facturas`, { params: filtros });
            return response.data.data || [];
        } catch (error) {
            console.error('Error en getFacturas:', error);
            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                throw new Error(error.response.data.message || 'Error al obtener las facturas');
            } else if (error.request) {
                console.error('No se recibió respuesta del servidor');
                throw new Error('No se pudo conectar con el servidor');
            } else {
                console.error('Error al configurar la petición:', error.message);
                throw new Error('Error al configurar la petición: ' + error.message);
            }
        }
    },
    
    /**
     * Generar factura de venta
     */
    generarFacturaVenta: async (ventaId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/facturas/venta/${ventaId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al generar la factura de venta');
        }
    },
    
    /**
     * Generar factura de compra
     */
    generarFacturaCompra: async (compraId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/facturas/compra/${compraId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al generar la factura de compra');
        }
    },
    
    /**
     * Descargar factura
     */
    descargarFactura: async (tipo, id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/facturas/descargar/${tipo}/${id}`, {
                responseType: 'blob'
            });
            
            // Crear URL para el blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Crear un link temporal para descargar
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${tipo}-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al descargar la factura');
        }
    },
    
    /**
     * Abrir factura en una nueva ventana
     */
    abrirFactura: async (tipo, id) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/facturas/descargar/${tipo}/${id}`, {
                responseType: 'blob'
            });
            
            // Crear URL para el blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Abrir en nueva ventana
            window.open(url, '_blank');
            
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al abrir la factura');
        }
    }
}; 