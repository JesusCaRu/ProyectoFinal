import React, { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { useVentaStore } from '../../store/ventaStore';
import { format } from 'date-fns';
import { formatCurrency } from '../../lib/utils';
import { 
    DollarSign, 
    ShoppingCart, 
    TrendingUp,
    Package,
    Calendar,
    Loader2,
    AlertCircle
} from 'lucide-react';

const VendedorDashboard = () => {
    const { 
        loading, 
        error: storeError, 
        resumen,
        fetchVentas, 
        fetchVentasByDateRange,
        fetchResumen,
        productosMasVendidos
    } = useVentaStore();

    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(1)));
    const [fechaFin, setFechaFin] = useState(new Date());
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                await Promise.all([
                    fetchVentas(),
                    fetchResumen(fechaInicio, fechaFin)
                ]);
                setError(null);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
                setError(error.response?.data?.message || 'Error al cargar datos iniciales');
            } finally {
                setIsLoadingInitial(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const updateData = async () => {
            if (isLoadingInitial) return;
            
            setIsUpdating(true);
            try {
                await Promise.all([
                    fetchVentasByDateRange(fechaInicio, fechaFin),
                    fetchResumen(fechaInicio, fechaFin)
                ]);
                setError(null);
            } catch (error) {
                console.error('Error al actualizar datos:', error);
                setError(error.response?.data?.message || 'Error al actualizar datos');
            } finally {
                setIsUpdating(false);
            }
        };

        updateData();
    }, [fechaInicio, fechaFin]);

    const handleDateRangeChange = async (start, end) => {
        try {
            if (!(start instanceof Date) || !(end instanceof Date)) {
                throw new Error('Las fechas proporcionadas no son válidas');
            }

            setFechaInicio(start);
            setFechaFin(end);
        } catch (error) {
            console.error('Error al actualizar rango de fechas:', error);
            setError(error.message);
        }
    };

    const isLoading = loading || isUpdating;

    if (isLoadingInitial) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <_motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="h-12 w-12 animate-spin text-solid-color" />
                    <p className="text-text-tertiary text-lg">Cargando dashboard...</p>
                </_motion.div>
            </div>
        );
    }

    if (storeError || error) {
        return (
            <_motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 bg-error/10 border border-error text-error rounded-lg flex items-center gap-3"
            >
                <AlertCircle className="h-5 w-5" />
                <p>{storeError || error}</p>
            </_motion.div>
        );
    }

    return (
        <_motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Resumen de ventas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, index) => (
                        <_motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-bg rounded-xl shadow-md p-6 border border-border"
                        >
                            <div className="flex items-center justify-center h-24">
                                <Loader2 className="h-8 w-8 animate-spin text-solid-color" />
                            </div>
                        </_motion.div>
                    ))
                ) : (
                    <>
                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-bg rounded-xl shadow-md p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-interactive-component rounded-lg">
                                    <DollarSign className="h-6 w-6 text-success" />
                                </div>
                                <span className="text-sm font-medium text-success">
                                    {resumen?.total_monto > 0 ? 
                                        `+${((resumen.promedio_venta / resumen.total_monto) * 100).toFixed(1)}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm text-text-tertiary">Total Ventas</h3>
                            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
                                {formatCurrency(resumen?.total_monto || 0)}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-bg rounded-xl shadow-md p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-interactive-component rounded-lg">
                                    <ShoppingCart className="h-6 w-6 text-warning" />
                                </div>
                                <span className="text-sm font-medium text-warning">
                                    {resumen?.total_ventas > 0 ? 
                                        `+${((resumen.total_ventas / 100) * 10).toFixed(1)}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm text-text-tertiary">Ventas Realizadas</h3>
                            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
                                {resumen?.total_ventas || 0}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="bg-bg rounded-xl shadow-md p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-interactive-component rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-info" />
                                </div>
                                <span className="text-sm font-medium text-info">
                                    {resumen?.promedio_venta > 0 ? 
                                        `+${((resumen.promedio_venta / 1000) * 100).toFixed(1)}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm text-text-tertiary">Promedio por Venta</h3>
                            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
                                {formatCurrency(resumen?.promedio_venta || 0)}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="bg-bg rounded-xl shadow-md p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-interactive-component rounded-lg">
                                    <Package className="h-6 w-6 text-solid-color" />
                                </div>
                                <span className="text-sm font-medium text-solid-color">
                                    {productosMasVendidos?.length > 0 ? 
                                        `+${((productosMasVendidos[0].total_vendido / 100) * 15).toFixed(1)}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm text-text-tertiary">Productos Vendidos</h3>
                            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
                                {productosMasVendidos?.reduce((acc, curr) => acc + (curr.total_vendido || 0), 0) || 0}
                            </p>
                        </_motion.div>
                    </>
                )}
            </div>

            {/* Filtros de fecha */}
            <_motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex items-center space-x-4 bg-bg p-4 rounded-lg border border-border"
            >
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-text-tertiary" />
                    <input
                        type="date"
                        value={format(fechaInicio, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                                handleDateRangeChange(date, fechaFin);
                            }
                        }}
                        className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                    <span className="text-text-tertiary">hasta</span>
                    <input
                        type="date"
                        value={format(fechaFin, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                                handleDateRangeChange(fechaInicio, date);
                            }
                        }}
                        className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                </div>
            </_motion.div>

            {/* Productos más vendidos */}
            <_motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-bg rounded-xl shadow-md border border-border overflow-hidden"
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-accessibility-text">Productos más vendidos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-interactive-component">
                                <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                    Cantidad Vendida
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                    Total Vendido
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-solid-color" />
                                            <p className="text-text-tertiary">Cargando productos...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : productosMasVendidos?.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-text-tertiary">
                                        No hay productos vendidos en este período
                                    </td>
                                </tr>
                            ) : (
                                productosMasVendidos?.map((item, index) => (
                                    <_motion.tr
                                        key={item.producto.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-interactive-component/50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-accessibility-text">
                                                {item.producto.nombre}
                                            </div>
                                            <div className="text-sm text-text-tertiary">
                                                {item.producto.codigo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-accessibility-text">
                                            {item.total_vendido}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-accessibility-text">
                                            {formatCurrency(item.total_monto)}
                                        </td>
                                    </_motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </_motion.div>
        </_motion.div>
    );
};

export default VendedorDashboard; 