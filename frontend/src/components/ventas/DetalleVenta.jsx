import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../lib/utils';
import { X, Loader2 } from 'lucide-react';
import { motion as _motion } from 'framer-motion';

const DetalleVenta = ({ venta, isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ventaData, setVentaData] = useState(null);

    useEffect(() => {
        if (isOpen && venta) {
            setIsLoading(true);
            setError(null);
            try {
                // Asegurarnos de que estamos usando los datos correctos
                const ventaInfo = venta.data || venta;
                console.log('Datos de venta recibidos:', ventaInfo);
                
                // Validar que los datos necesarios estén presentes
                if (!ventaInfo || !ventaInfo.id) {
                    throw new Error('Datos de venta inválidos');
                }

                // Validar y procesar los detalles
                const detallesProcesados = Array.isArray(ventaInfo.detalles) 
                    ? ventaInfo.detalles.map(detalle => ({
                        ...detalle,
                        cantidad: Number(detalle.cantidad) || 0,
                        precio_unitario: Number(detalle.precio_unitario) || 0,
                        producto: detalle.producto || { nombre: 'Producto no disponible' }
                    }))
                    : [];

                setVentaData({
                    ...ventaInfo,
                    detalles: detallesProcesados,
                    total: Number(ventaInfo.total) || 0
                });

                // Simular carga para mejor UX
                const timer = setTimeout(() => {
                    setIsLoading(false);
                }, 500);
                return () => clearTimeout(timer);
            } catch (error) {
                console.error('Error al procesar datos de venta:', error);
                setError(error.message);
                setIsLoading(false);
            }
        }
    }, [isOpen, venta]);

    if (!ventaData || !isOpen) return null;

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Fecha no disponible';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return format(date, "dd/MM/yyyy HH:mm", { locale: es });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Error al formatear fecha';
        }
    };

    return (
        <_motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
            <_motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-bg rounded-lg p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-border"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-accessibility-text">Detalles de la Venta #{ventaData.id}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-interactive-component rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-text-tertiary" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-solid-color mb-2" />
                        <p className="text-text-tertiary">Cargando detalles...</p>
                    </div>
                ) : error ? (
                    <div className="bg-error/10 border border-error text-error p-4 rounded">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-text-tertiary">Fecha</p>
                                <p className="font-medium text-accessibility-text">
                                    {formatDate(ventaData.fecha)}
                                </p>
                            </div>
                            <div>
                                <p className="text-text-tertiary">Vendedor</p>
                                <p className="font-medium text-accessibility-text">
                                    {ventaData.usuario?.nombre || 'No especificado'}
                                </p>
                            </div>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-interactive-component">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-text-tertiary">Producto</th>
                                        <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Cantidad</th>
                                        <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Precio Unit.</th>
                                        <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {!ventaData.detalles || ventaData.detalles.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-4 text-center text-text-tertiary">
                                                No hay productos en esta venta
                                            </td>
                                        </tr>
                                    ) : (
                                        ventaData.detalles.map((detalle, index) => (
                                            <_motion.tr
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className="hover:bg-bg-secondary"
                                            >
                                                <td className="px-4 py-2 text-accessibility-text">
                                                    {detalle.producto?.nombre || 'Producto no disponible'}
                                                </td>
                                                <td className="px-4 py-2 text-right text-accessibility-text">
                                                    {detalle.cantidad}
                                                </td>
                                                <td className="px-4 py-2 text-right text-accessibility-text">
                                                    {formatCurrency(detalle.precio_unitario)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-accessibility-text font-medium">
                                                    {formatCurrency(detalle.cantidad * detalle.precio_unitario)}
                                                </td>
                                            </_motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="font-medium text-accessibility-text">Total:</span>
                            <span className="text-xl font-bold text-solid-color">
                                {formatCurrency(ventaData.total)}
                            </span>
                        </div>
                    </div>
                )}
            </_motion.div>
        </_motion.div>
    );
};

export default DetalleVenta; 