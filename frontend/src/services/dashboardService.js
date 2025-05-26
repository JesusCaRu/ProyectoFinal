import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const dashboardService = {
    getDashboardData: async () => {
        const token = localStorage.getItem('token');
        
        // Obtener estadísticas generales
        const statsResponse = await axios.get(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener ventas por mes
        const ventasResponse = await axios.get(`${API_URL}/dashboard/ventas-por-mes`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener productos más vendidos
        const productosResponse = await axios.get(`${API_URL}/dashboard/productos-mas-vendidos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener productos con stock bajo
        const stockBajoResponse = await axios.get(`${API_URL}/dashboard/productos-stock-bajo`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener últimas ventas
        const ultimasVentasResponse = await axios.get(`${API_URL}/dashboard/ultimas-ventas`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener últimas compras
        const ultimasComprasResponse = await axios.get(`${API_URL}/dashboard/ultimas-compras`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener últimos movimientos
        const ultimosMovimientosResponse = await axios.get(`${API_URL}/dashboard/ultimos-movimientos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            ...statsResponse.data,
            ventasPorMes: ventasResponse.data,
            productosMasVendidos: productosResponse.data,
            productosStockBajo: stockBajoResponse.data,
            ultimasVentas: ultimasVentasResponse.data,
            ultimasCompras: ultimasComprasResponse.data,
            ultimosMovimientos: ultimosMovimientosResponse.data
        };
    }
}; 