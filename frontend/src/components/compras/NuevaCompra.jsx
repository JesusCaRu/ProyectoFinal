import React, { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { useCompraStore } from '../../store/compraStore';
import { useProductStore } from '../../store/productStore';
import { useProveedorStore } from '../../store/proveedorStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../lib/utils';
import { 
    X, 
    Plus, 
    Minus, 
    Loader2, 
    AlertCircle,
    Search,
    Package,
    User,
    DollarSign,
    Trash2
} from 'lucide-react';

const NuevaCompra = ({ isOpen, onClose }) => {
    const { createCompra, loading } = useCompraStore();
    const { products, loadProducts, isLoading: productsLoading } = useProductStore();
    const { proveedores, fetchProveedores, loading: proveedoresLoading } = useProveedorStore();
    const user = useAuthStore(state => state.user);
    const sedeId = user?.data?.sede?.id;
    console.log(sedeId);

    const [proveedorId, setProveedorId] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    loadProducts(),
                    fetchProveedores()
                ]);
                setError(null);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setError('Error al cargar los datos necesarios');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const handleAddProducto = () => {
        setDetalles([...detalles, { producto_id: '', cantidad: 1, precio_unitario: 0 }]);
    };

    const handleRemoveProducto = (index) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const handleProductoChange = (index, productoId) => {
        const producto = products.find(p => p.id === parseInt(productoId));
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            producto_id: productoId,
            precio_unitario: producto?.precio_compra || 0
        };
        setDetalles(newDetalles);
    };

    const handleCantidadChange = (index, cantidad) => {
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            cantidad: Math.max(1, parseInt(cantidad) || 1)
        };
        setDetalles(newDetalles);
    };

    const handlePrecioChange = (index, precio) => {
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            precio_unitario: Math.max(0, parseFloat(precio) || 0)
        };
        setDetalles(newDetalles);
    };

    const calcularSubtotal = (detalle) => {
        return detalle.cantidad * detalle.precio_unitario;
    };

    const calcularTotal = () => {
        return detalles.reduce((total, detalle) => total + calcularSubtotal(detalle), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!proveedorId) {
            setError('Debe seleccionar un proveedor');
            return;
        }

        if (detalles.length === 0) {
            setError('Debe agregar al menos un producto');
            return;
        }

        if (detalles.some(d => !d.producto_id)) {
            setError('Todos los productos deben estar seleccionados');
            return;
        }

        try {
            const compraData = {
                proveedor_id: parseInt(proveedorId),
                productos: detalles.map(d => ({
                    producto_id: parseInt(d.producto_id),
                    cantidad: d.cantidad,
                    precio_unitario: d.precio_unitario
                })),
                sede_id: sedeId,
                fecha: new Date().toISOString()
            };

            await createCompra(compraData);
            onClose();
        } catch (error) {
            console.error('Error al crear la compra:', error);
            setError(error.message);
        }
    };

    const filteredProducts = Array.isArray(products) ? products.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (!isOpen) return null;

    const filteredProveedores = Array.isArray(proveedores) ? proveedores : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-accessibility-text">Nueva Compra</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-interactive-component rounded-lg transition-colors duration-200"
                    >
                        <X className="h-5 w-5 text-text-tertiary" />
                    </button>
                </div>

                {/* Contenido */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {isLoading || productsLoading || proveedoresLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-solid-color mb-4" />
                            <p className="text-text-tertiary">Cargando datos...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 border border-error text-error p-4 rounded-lg flex items-center gap-3 mb-6">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selección de proveedor */}
                            <div className="bg-bg rounded-lg p-4 border border-border">
                                <div className="flex items-center space-x-3 mb-4">
                                    <User className="h-5 w-5 text-text-tertiary" />
                                    <h3 className="font-medium text-accessibility-text">Proveedor</h3>
                                </div>
                                <select
                                    value={proveedorId}
                                    onChange={(e) => setProveedorId(e.target.value)}
                                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccione un proveedor</option>
                                    {filteredProveedores.map(proveedor => (
                                        <option key={proveedor.id} value={proveedor.id}>
                                            {proveedor.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lista de productos */}
                            <div className="bg-bg rounded-lg p-4 border border-border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Package className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Productos</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddProducto}
                                        className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Agregar Producto</span>
                                    </button>
                                </div>

                                {/* Búsqueda de productos */}
                                <div className="relative mb-4">
                                    <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                                    />
                                </div>

                                {/* Tabla de productos */}
                                <div className="overflow-x-auto">
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
                                                <th className="px-6 py-3 text-center text-sm font-medium text-text-tertiary uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {detalles.map((detalle, index) => (
                                                <tr key={index} className="hover:bg-interactive-component/50 transition-colors duration-200">
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={detalle.producto_id}
                                                            onChange={(e) => handleProductoChange(index, e.target.value)}
                                                            className="w-full px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                                                            required
                                                        >
                                                            <option value="">Seleccione un producto</option>
                                                            {filteredProducts.map(producto => (
                                                                <option key={producto.id} value={producto.id}>
                                                                    {producto.nombre} ({producto.codigo})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCantidadChange(index, detalle.cantidad - 1)}
                                                                className="p-1 hover:bg-interactive-component rounded-lg transition-colors duration-200"
                                                            >
                                                                <Minus className="h-4 w-4 text-text-tertiary" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={detalle.cantidad}
                                                                onChange={(e) => handleCantidadChange(index, e.target.value)}
                                                                min="1"
                                                                className="w-20 px-2 py-1 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent text-right"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCantidadChange(index, detalle.cantidad + 1)}
                                                                className="p-1 hover:bg-interactive-component rounded-lg transition-colors duration-200"
                                                            >
                                                                <Plus className="h-4 w-4 text-text-tertiary" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end">
                                                            <input
                                                                type="number"
                                                                value={detalle.precio_unitario}
                                                                onChange={(e) => handlePrecioChange(index, e.target.value)}
                                                                min="0"
                                                                step="0.01"
                                                                className="w-32 px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent text-right"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium text-accessibility-text">
                                                        {formatCurrency(calcularSubtotal(detalle))}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProducto(index)}
                                                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-bg rounded-lg p-4 border border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <DollarSign className="h-5 w-5 text-text-tertiary" />
                                        <h3 className="font-medium text-accessibility-text">Total</h3>
                                    </div>
                                    <p className="text-2xl font-semibold text-accessibility-text">
                                        {formatCurrency(calcularTotal())}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-border rounded-lg text-text-tertiary hover:bg-interactive-component transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <span>Guardar Compra</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NuevaCompra; 