import React, { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { useCompraStore } from '../../store/compraStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../lib/utils';
import NuevaCompra from '../../components/compras/NuevaCompra';
import DetalleCompra from '../../components/compras/DetalleCompra';
import { 
    Euro, 
    ShoppingCart, 
    Package, 
    TrendingUp,
    Search,
    Calendar,
    Plus,
    BarChart2,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    Truck,
    Menu
} from 'lucide-react';
import LoadingIndicator from '../../components/LoadingIndicator';

const Compras = () => {
    const { 
        compras, 
        loading, 
        error: storeError, 
        resumen,
        productosMasComprados,
        fetchCompras, 
        fetchComprasByDateRange,
        fetchResumen,
        fetchCompra 
    } = useCompraStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(1)));
    const [fechaFin, setFechaFin] = useState(new Date());
    const [showNuevaCompra, setShowNuevaCompra] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState(null);
    const [showDetalleCompra, setShowDetalleCompra] = useState(false);
    const [resumenError, setResumenError] = useState(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                await Promise.all([
                    fetchCompras(),
                    fetchResumen(fechaInicio, fechaFin)
                ]);
                setResumenError(null);
                setError(null);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
                setResumenError(error.response?.data?.message || 'Error al cargar datos iniciales');
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
                    fetchComprasByDateRange(fechaInicio, fechaFin),
                    fetchResumen(fechaInicio, fechaFin)
                ]);
                setResumenError(null);
                setError(null);
            } catch (error) {
                console.error('Error al actualizar datos:', error);
                setResumenError(error.response?.data?.message || 'Error al actualizar datos');
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
            setResumenError(error.message);
            setError(error.message);
        }
    };

    const isLoading = loading || isUpdating;

    const filteredCompras = compras.filter(compra => {
        const searchLower = searchTerm.toLowerCase();
        return (
            compra.id.toString().includes(searchLower) ||
            compra.proveedor?.nombre?.toLowerCase().includes(searchLower) ||
            compra.detalles?.some(detalle => 
                detalle.producto?.nombre?.toLowerCase().includes(searchLower)
            )
        );
    });

    const handleVerDetalles = async (compra) => {
        try {
            setIsUpdating(true);
            if (compra.detalles && compra.detalles.length > 0) {
                setSelectedCompra(compra);
                setShowDetalleCompra(true);
                return;
            }
            
            const compraDetalle = await fetchCompra(compra.id);
            setSelectedCompra(compraDetalle);
            setShowDetalleCompra(true);
        } catch (error) {
            console.error('Error al cargar los detalles de la compra:', error);
            setError(error.response?.data?.message || 'Error al cargar los detalles de la compra');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoadingInitial) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <_motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                        duration: 0.5,
                        ease: "easeOut"
                    }}
                    className="flex flex-col items-center gap-4"
                >
                    <_motion.div
                        animate={{ 
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            rotate: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear"
                            },
                            scale: {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                    >
                        <Loader2 className="h-12 w-12 text-solid-color" />
                    </_motion.div>
                    <_motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-tertiary text-lg"
                    >
                        Cargando compras...
                    </_motion.p>
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
                className="p-3 sm:p-6 bg-error/10 border border-error text-error rounded-lg flex items-center gap-3 text-sm"
            >
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <p>{storeError || error}</p>
            </_motion.div>
        );
    }

    return (
        <_motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6 p-3 sm:p-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-solid-color" />
                    <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Compras</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                        onClick={() => setShowNuevaCompra(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-sm sm:text-base"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Nueva Compra</span>
                    </button>
                    <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-sm sm:text-base">
                        <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Reportes</span>
                    </button>
                </div>
            </div>

            {/* Resumen de compras */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, index) => (
                        <_motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
                        >
                            <div className="flex items-center justify-center h-16 sm:h-24">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-solid-color" />
                            </div>
                        </_motion.div>
                    ))
                ) : resumenError ? (
                    <_motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full bg-error/10 border border-error text-error p-3 sm:p-4 rounded-lg flex items-center gap-3 text-sm"
                    >
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <p>Error al cargar el resumen: {resumenError}</p>
                    </_motion.div>
                ) : (
                    <>
                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                                    <Euro className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-success">
                                    {resumen?.total_monto > 0 ? 
                                        `+${((resumen.promedio_compra / resumen.total_monto) * 100).toLocaleString('es-ES', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">Total Compras</h3>
                            <p className="mt-1 text-base sm:text-xl md:text-2xl font-semibold text-accessibility-text">
                                {formatCurrency(resumen?.total_monto || 0)}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                                    <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-solid-color" />
                                </div>
                            </div>
                            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">Compras Realizadas</h3>
                            <p className="mt-1 text-base sm:text-xl md:text-2xl font-semibold text-accessibility-text">
                                {resumen?.total_compras ? resumen.total_compras.toLocaleString('es-ES') : 0}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-solid-color" />
                                </div>
                            </div>
                            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">Promedio por Compra</h3>
                            <p className="mt-1 text-base sm:text-xl md:text-2xl font-semibold text-accessibility-text">
                                {formatCurrency(resumen?.promedio_compra || 0)}
                            </p>
                        </_motion.div>

                        <_motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
                        >
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-solid-color" />
                                </div>
                            </div>
                            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">Productos Comprados</h3>
                            <p className="mt-1 text-base sm:text-xl md:text-2xl font-semibold text-accessibility-text">
                                {(productosMasComprados?.reduce((sum, p) => sum + p.total_comprado, 0) || 0).toLocaleString('es-ES')}
                            </p>
                        </_motion.div>
                    </>
                )}
            </div>

            {/* Filtros y búsqueda */}
            <_motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-bg p-3 sm:p-4 rounded-lg border border-border"
            >
                <div className="flex-1 relative">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar compras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                </div>
                
                {/* Filtros de fechas para escritorio */}
                <div className="hidden sm:flex items-center space-x-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                    <input
                        type="date"
                        value={format(fechaInicio, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                                handleDateRangeChange(date, fechaFin);
                            }
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                    <span className="text-text-tertiary text-sm">hasta</span>
                    <input
                        type="date"
                        value={format(fechaFin, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                                handleDateRangeChange(fechaInicio, date);
                            }
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                </div>

                {/* Botón de filtros para móvil */}
                <div className="sm:hidden">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full px-3 py-1.5 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 text-sm"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Filtrar por fechas</span>
                    </button>
                    {showFilters && (
                        <div className="mt-3 p-3 bg-bg-secondary border border-border rounded-lg space-y-3">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-text-tertiary">
                                    Fecha inicio
                                </label>
                                <input
                                    type="date"
                                    value={format(fechaInicio, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        if (!isNaN(date.getTime())) {
                                            handleDateRangeChange(date, fechaFin);
                                        }
                                    }}
                                    className="w-full px-3 py-1.5 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color focus:border-transparent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-text-tertiary">
                                    Fecha fin
                                </label>
                                <input
                                    type="date"
                                    value={format(fechaFin, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        if (!isNaN(date.getTime())) {
                                            handleDateRangeChange(fechaInicio, date);
                                        }
                                    }}
                                    className="w-full px-3 py-1.5 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color focus:border-transparent"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="px-3 py-1.5 text-xs bg-solid-color hover:bg-solid-color-hover text-white rounded-lg transition-colors duration-200"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </_motion.div>

            {/* Tabla de compras para tablet/desktop */}
            <_motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="hidden sm:block bg-bg rounded-xl shadow-md border border-border overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-interactive-component">
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">ID</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Fecha</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Proveedor</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Productos</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Total</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Estado</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <LoadingIndicator
                                    variant="table"
                                    colSpan={7}
                                    text={isUpdating ? 'Actualizando datos...' : 'Cargando compras...'}
                                />
                            ) : filteredCompras.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 sm:px-6 py-6 sm:py-8 text-center text-text-tertiary">
                                        No se encontraron compras
                                    </td>
                                </tr>
                            ) : (
                                filteredCompras.map((compra, index) => (
                                    <_motion.tr
                                        key={compra.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-interactive-component/50 transition-colors duration-200"
                                    >
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-accessibility-text">
                                            #{compra.id}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-accessibility-text">
                                            {(() => {
                                                try {
                                                    const fecha = compra.created_at || compra.fecha;
                                                    if (!fecha) return 'N/A';
                                                    const dateObj = new Date(fecha);
                                                    if (isNaN(dateObj.getTime())) return 'N/A';
                                                    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es });
                                                } catch {
                                                    return 'Fecha inválida';
                                                }
                                            })()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-accessibility-text">
                                            {compra.proveedor?.nombre || 'No especificado'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-accessibility-text">
                                            {(compra.detalles?.length || 0).toLocaleString('es-ES')} productos
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-accessibility-text font-medium">
                                            {formatCurrency(compra.total)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                compra.estado === 'pendiente' ? 'bg-warning/10 text-warning' :
                                                compra.estado === 'completada' ? 'bg-success/10 text-success' :
                                                'bg-error/10 text-error'
                                            }`}>
                                                {compra.estado === 'pendiente' ? 'Pendiente' :
                                                 compra.estado === 'completada' ? 'Completada' :
                                                 'Cancelada'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleVerDetalles(compra)}
                                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200"
                                            >
                                                Ver detalles
                                            </button>
                                        </td>
                                    </_motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </_motion.div>

            {/* Vista de tarjetas para móvil */}
            <div className="sm:hidden space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingIndicator text={isUpdating ? 'Actualizando datos...' : 'Cargando compras...'} />
                    </div>
                ) : filteredCompras.length === 0 ? (
                    <div className="text-center py-8 text-text-tertiary text-sm">
                        No se encontraron compras
                    </div>
                ) : (
                    filteredCompras.map((compra) => {
                        const fecha = compra.created_at || compra.fecha;
                        let fechaFormateada = 'N/A';
                        try {
                            if (fecha) {
                                const dateObj = new Date(fecha);
                                if (!isNaN(dateObj.getTime())) {
                                    fechaFormateada = format(dateObj, "dd/MM/yyyy HH:mm", { locale: es });
                                }
                            }
                        } catch {
                            fechaFormateada = 'Fecha inválida';
                        }
                        
                        const getEstadoColor = (estado) => {
                            switch (estado) {
                                case 'pendiente': return 'bg-warning/10 text-warning';
                                case 'completada': return 'bg-success/10 text-success';
                                default: return 'bg-error/10 text-error';
                            }
                        };
                        
                        const getEstadoText = (estado) => {
                            switch (estado) {
                                case 'pendiente': return 'Pendiente';
                                case 'completada': return 'Completada';
                                default: return 'Cancelada';
                            }
                        };
                        
                        return (
                            <_motion.div
                                key={compra.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-bg rounded-lg border border-border p-3 hover:border-solid-color/40 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Truck className="h-4 w-4 text-solid-color" />
                                        <span className="text-sm font-medium text-accessibility-text">
                                            Compra #{compra.id}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-solid-color">
                                        {formatCurrency(compra.total)}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                    <div>
                                        <div className="text-text-tertiary">Fecha:</div>
                                        <div className="font-medium">{fechaFormateada}</div>
                                    </div>
                                    <div>
                                        <div className="text-text-tertiary">Proveedor:</div>
                                        <div className="font-medium">{compra.proveedor?.nombre || 'No especificado'}</div>
                                    </div>
                                    <div>
                                        <div className="text-text-tertiary">Productos:</div>
                                        <div className="font-medium">{(compra.detalles?.length || 0)} artículos</div>
                                    </div>
                                    <div>
                                        <div className="text-text-tertiary">Estado:</div>
                                        <div className="font-medium">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getEstadoColor(compra.estado)}`}>
                                                {getEstadoText(compra.estado)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleVerDetalles(compra)}
                                    className="w-full py-1.5 text-xs bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    Ver detalles
                                </button>
                            </_motion.div>
                        );
                    })
                )}
            </div>

            {/* Modales */}
            {showNuevaCompra && (
                <NuevaCompra
                    isOpen={showNuevaCompra}
                    onClose={async () => {
                        setShowNuevaCompra(false);
                        setIsUpdating(true);
                        try {
                            await Promise.all([
                                fetchCompras(),
                                fetchResumen(fechaInicio, fechaFin)
                            ]);
                        } catch (error) {
                            console.error('Error al actualizar después de nueva compra:', error);
                            setError(error.response?.data?.message || 'Error al actualizar después de nueva compra');
                        } finally {
                            setIsUpdating(false);
                        }
                    }}
                />
            )}

            {showDetalleCompra && selectedCompra && (
                <DetalleCompra
                    compra={selectedCompra}
                    isOpen={showDetalleCompra}
                    onClose={async () => {
                        setShowDetalleCompra(false);
                        setIsUpdating(true);
                        try {
                            await Promise.all([
                                fetchCompras(),
                                fetchResumen(fechaInicio, fechaFin)
                            ]);
                        } catch (error) {
                            console.error('Error al actualizar después de cambiar estado:', error);
                            setError(error.response?.data?.message || 'Error al actualizar después de cambiar estado');
                        } finally {
                            setIsUpdating(false);
                        }
                    }}
                />
            )}
        </_motion.div>
    );
};

export default Compras; 