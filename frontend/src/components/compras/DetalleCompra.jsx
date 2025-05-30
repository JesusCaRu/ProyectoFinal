import React, { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../lib/utils';
import { useCompraStore } from '../../store/compraStore';
import { 
    X, 
    Loader2, 
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    Euro,
    Truck,
    User
} from 'lucide-react';

const DetalleCompra = ({ compra, isOpen, onClose }) => {
    const { updateCompraEstado, loading, fetchCompras } = useCompraStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detallesProcesados, setDetallesProcesados] = useState(null);

    useEffect(() => {
        if (isOpen && compra) {
            setIsLoading(true);
            setError(null);

            // Simulamos un pequeño delay para mostrar el loading
            const timer = setTimeout(() => {
                try {
                    // Procesamos los detalles de la compra
                    const detalles = compra.detalles?.map(detalle => {
                        let fecha_formateada = 'Fecha no disponible';
                        try {
                            if (detalle.created_at) {
                                const fecha = new Date(detalle.created_at);
                                if (!isNaN(fecha.getTime())) {
                                    fecha_formateada = format(fecha, "dd/MM/yyyy HH:mm", { locale: es });
                                }
                            }
                        } catch (error) {
                            console.error('Error al formatear fecha:', error);
                        }

                        return {
                            ...detalle,
                            subtotal: detalle.cantidad * detalle.precio_unitario,
                            fecha_formateada
                        };
                    }) || [];

                    setDetallesProcesados(detalles);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error al procesar los detalles:', error);
                    setError('Error al procesar los detalles de la compra');
                    setIsLoading(false);
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isOpen, compra]);

    const handleEstadoChange = async (nuevoEstado) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Validar que el estado actual sea pendiente
            if (compra.estado !== 'pendiente') {
                setError('No se puede cambiar el estado de una compra que no está pendiente');
                return;
            }

            await updateCompraEstado(compra.id, nuevoEstado);
            // Actualizar la lista de compras después de cambiar el estado
            await fetchCompras();
            onClose();
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Error al actualizar el estado de la compra';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'completada':
                return <CheckCircle className="h-5 w-5 text-success" />;
            case 'pendiente':
                return <Clock className="h-5 w-5 text-warning" />;
            case 'cancelada':
                return <XCircle className="h-5 w-5 text-error" />;
            default:
                return null;
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 'completada':
                return 'Completada';
            case 'pendiente':
                return 'Pendiente';
            case 'cancelada':
                return 'Cancelada';
            default:
                return 'Desconocido';
        }
    };

    const formatCompraFecha = (fechaString) => {
        try {
            if (!fechaString) return 'Fecha no disponible';
            const fecha = new Date(fechaString);
            if (isNaN(fecha.getTime())) return 'Fecha inválida';
            return format(fecha, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
        } catch (error) {
            console.error('Error al formatear fecha de compra:', error);
            return 'Error al formatear fecha';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <_motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-bg rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Package className="h-6 w-6 text-solid-color" />
                        <h2 className="text-xl font-semibold text-accessibility-text">
                            Detalles de la Compra #{compra.id}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-interactive-component rounded-lg transition-colors duration-200"
                    >
                        <X className="h-5 w-5 text-text-tertiary" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-solid-color mb-4" />
                            <p className="text-text-tertiary">Cargando detalles...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 border border-error text-error p-4 rounded-lg flex items-center gap-3">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Información general */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-bg rounded-lg p-4 border border-border">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <User className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Proveedor</h3>
                                    </div>
                                    <p className="text-accessibility-text">{compra.proveedor?.nombre || 'No especificado'}</p>
                                    {compra.proveedor?.email && (
                                        <p className="text-text-tertiary mt-1">{compra.proveedor.email}</p>
                                    )}
                                </div>

                                <div className="bg-bg rounded-lg p-4 border border-border">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Truck className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Estado</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getEstadoIcon(compra.estado)}
                                        <span className={`font-medium ${
                                            compra.estado === 'completada' ? 'text-success' :
                                            compra.estado === 'pendiente' ? 'text-warning' :
                                            'text-error'
                                        }`}>
                                            {getEstadoText(compra.estado)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-bg rounded-lg p-4 border border-border">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Clock className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Fecha</h3>
                                    </div>
                                    <p className="text-accessibility-text">
                                        {formatCompraFecha(compra.fecha)}
                                    </p>
                                </div>

                                <div className="bg-bg rounded-lg p-4 border border-border">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Euro className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Total</h3>
                                    </div>
                                    <p className="text-2xl font-semibold text-accessibility-text">
                                        {formatCurrency(compra.total)}
                                    </p>
                                </div>
                            </div>

                            {/* Tabla de productos */}
                            <div className="bg-bg rounded-lg border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-interactive-component">
                                            <th className="px-6 py-3 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                                Producto
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                                Precio Unitario
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {detallesProcesados?.map((detalle, index) => (
                                            <tr key={index} className="hover:bg-interactive-component/50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-accessibility-text">
                                                        {detalle.producto?.nombre}
                                                    </div>
                                                    <div className="text-sm text-text-tertiary">
                                                        {detalle.producto?.codigo}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-accessibility-text">
                                                    {detalle.cantidad}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-accessibility-text">
                                                    {formatCurrency(detalle.precio_unitario)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-accessibility-text">
                                                    {formatCurrency(detalle.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Acciones */}
                            {compra.estado === 'pendiente' && (
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => handleEstadoChange('cancelada')}
                                        disabled={loading || isLoading}
                                        className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading || isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        <span>Cancelar Compra</span>
                                    </button>
                                    <button
                                        onClick={() => handleEstadoChange('completada')}
                                        disabled={loading || isLoading}
                                        className="px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading || isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        <span>Completar Compra</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </_motion.div>
        </div>
    );
};

export default DetalleCompra; 