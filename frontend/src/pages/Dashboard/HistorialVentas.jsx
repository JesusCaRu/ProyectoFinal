import { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { Search, Filter, Download, Eye, X, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useVentaStore } from '../../store/ventaStore';

const HistorialVentas = () => {
    const { ventas, fetchVentas, downloadFactura } = useVentaStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const loadVentas = async () => {
            try {
                setIsLoading(true);
                await fetchVentas();
            } catch (error) {
                setError('Error al cargar el historial de ventas');
                console.error('Error al cargar ventas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadVentas();
    }, [fetchVentas]);

    const filteredVentas = (ventas || []).filter(venta => {
        if (!venta) return false;
        
        const matchesSearch = 
            (venta.id?.toString() || '').includes(searchTerm) ||
            (venta.usuario?.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
        const matchesDate = (!dateRange.start || new Date(venta.fecha) >= new Date(dateRange.start)) &&
                          (!dateRange.end || new Date(venta.fecha) <= new Date(dateRange.end));
                          
        return matchesSearch && matchesDate;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '€0,00';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleViewDetails = (venta) => {
        if (!venta) return;
        setSelectedVenta(venta);
        setIsModalOpen(true);
    };

    const handleDownloadFactura = async (ventaId) => {
        if (!ventaId) return;
        try {
            setIsDownloading(true);
            await downloadFactura(ventaId);
        } catch (error) {
            setError('Error al descargar la factura');
            console.error('Error al descargar factura:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-accessibility-text">Historial de Ventas</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por ID o vendedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        />
                        <Search className="absolute left-3 top-2.5 text-text-tertiary" size={20} />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-error/10 text-error rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solid-color"></div>
                </div>
            ) : filteredVentas.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                    No se encontraron ventas
                </div>
            ) : (
                <div className="bg-bg-secondary rounded-lg shadow overflow-hidden border border-border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-bg">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    Vendedor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    Productos
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-bg-secondary divide-y divide-border">
                            {filteredVentas.map((venta) => (
                                <_motion.tr
                                    key={venta?.id || Math.random()}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-interactive-component/50 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                        #{venta?.id || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                                        {formatDate(venta?.fecha)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-text-tertiary" />
                                            {venta?.usuario?.nombre || 'Vendedor no especificado'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                        {formatCurrency(venta?.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                                        {venta?.detalles?.length || 0} productos
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(venta)}
                                                className="text-solid-color hover:text-solid-color-hover transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadFactura(venta?.id)}
                                                disabled={isDownloading}
                                                className={`text-text-tertiary hover:text-accessibility-text transition-colors ${
                                                    isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                title="Descargar factura"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </_motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Detalles */}
            {isModalOpen && selectedVenta && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-bg-secondary rounded-lg shadow-lg w-full max-w-2xl mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-accessibility-text">
                                    Detalles de la Venta #{selectedVenta?.id || 'N/A'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-text-tertiary hover:text-accessibility-text transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-text-tertiary">Fecha</p>
                                        <p className="text-accessibility-text">{formatDate(selectedVenta?.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-tertiary">Vendedor</p>
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-text-tertiary" />
                                            <p className="text-accessibility-text">
                                                {selectedVenta?.usuario?.nombre || 'Vendedor no especificado'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-tertiary">Total</p>
                                        <p className="text-accessibility-text font-semibold">
                                            {formatCurrency(selectedVenta?.total)}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <h3 className="text-lg font-semibold text-accessibility-text mb-4">
                                        Productos
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedVenta?.detalles?.map((detalle, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-bg rounded-lg">
                                                <div>
                                                    <p className="text-accessibility-text font-medium">{detalle?.producto?.nombre || 'Producto no especificado'}</p>
                                                    <p className="text-sm text-text-tertiary">
                                                        {detalle?.cantidad || 0} x {formatCurrency(detalle?.precio_unitario)}
                                                    </p>
                                                </div>
                                                <p className="text-accessibility-text font-semibold">
                                                    {formatCurrency((detalle?.cantidad || 0) * (detalle?.precio_unitario || 0))}
                                                </p>
                                            </div>
                                        )) || (
                                            <p className="text-text-tertiary text-center py-4">
                                                No hay productos disponibles
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialVentas; 