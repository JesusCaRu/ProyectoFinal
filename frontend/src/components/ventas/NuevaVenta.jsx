import React, { useState, useEffect } from 'react';
import { useVentaStore } from '../../store/ventaStore';
import { useProductStore } from '../../store/productStore';
import { formatCurrency } from '../../lib/utils';
import { X, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NuevaVenta = ({ onClose }) => {
    const { createVenta } = useVentaStore();
    const { products, loadProducts, isLoading: productsLoading, error: productsError } = useProductStore();
    const { user } = useAuthStore();
    const sedeId = user?.data?.sede?.id;
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Iniciando carga de productos...');
                await loadProducts();
                console.log('Productos cargados:', products);
            } catch (error) {
                console.error('Error al cargar productos:', error);
                setError('Error al cargar los productos. Por favor, intente nuevamente.');
            }
        };
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        setSelectedProducts([
            ...selectedProducts,
            { producto_id: '', cantidad: 1, precio_unitario: 0 }
        ]);
    };

    const handleRemoveProduct = (index) => {
        setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    };

    const getProductPrice = (productoId) => {
        const producto = products.find(p => p.id === productoId);
        if (!producto || !sedeId) return 0;
        const sedeStock = producto.sedes?.find(s => s.id === Number(sedeId));
        return sedeStock ? sedeStock.pivot.precio_venta : 0;
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...selectedProducts];
        if (field === 'producto_id') {
            newProducts[index] = {
                ...newProducts[index],
                producto_id: parseInt(value),
                precio_unitario: getProductPrice(parseInt(value))
            };
        } else {
            newProducts[index] = {
                ...newProducts[index],
                [field]: field === 'cantidad' ? parseInt(value) || 0 : value
            };
        }
        setSelectedProducts(newProducts);
    };

    const getProductStock = (productoId) => {
        const producto = products.find(p => p.id === productoId);
        if (!producto || !sedeId) return 0;
        const sedeStock = producto.sedes?.find(s => s.id === Number(sedeId));
        console.log(sedeStock);
        return sedeStock ? sedeStock.pivot.stock : 0;
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, item) => {
            return total + (item.cantidad * item.precio_unitario);
        }, 0);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validaciones antes de enviar
            if (selectedProducts.length === 0) {
                throw new Error('Debe seleccionar al menos un producto');
            }

            // Validar que todos los productos tengan datos válidos
            for (const item of selectedProducts) {
                if (!item.producto_id) {
                    throw new Error('Todos los productos deben estar seleccionados');
                }
                if (!item.cantidad || item.cantidad <= 0) {
                    throw new Error('La cantidad debe ser mayor a 0');
                }

                // Validar stock
                const stock = getProductStock(item.producto_id);
                console.log(stock);
                if (stock < item.cantidad) {
                    const producto = products.find(p => p.id === item.producto_id);
                    throw new Error(`Stock insuficiente para ${producto?.nombre || 'el producto'}. Stock disponible: ${stock}`);
                }
            }

            // Preparar datos de la venta en el formato que espera el backend
            const ventaData = {
                productos: selectedProducts.map(item => ({
                    producto_id: parseInt(item.producto_id),
                    cantidad: parseInt(item.cantidad)
                })),
                sede_id: sedeId,
                fecha: new Date().toLocaleString('sv', { timeZone: 'America/Mexico_City' }).replace(' ', 'T')
            };

            console.log('Enviando datos de venta:', ventaData);

            // Intentar crear la venta
            const response = await createVenta(ventaData);
            console.log('Respuesta del servidor:', response);

            if (response) {
                console.log('Venta creada exitosamente');
                onClose();
                setSelectedProducts([]);
            }
        } catch (error) {
            console.error('Error al crear venta:', error);
            // Mostrar mensaje de error más descriptivo
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'Error al registrar la venta';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-bg rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-accessibility-text">Nueva Venta</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-interactive-component rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-text-tertiary" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {productsError && (
                        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">
                            {productsError}
                        </div>
                    )}
                    {error && (
                        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {productsLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solid-color border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Lista de productos seleccionados */}
                            <div className="space-y-3">
                                {selectedProducts.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-border">
                                        <select
                                            className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                                            value={item.producto_id}
                                            onChange={e => handleProductChange(index, 'producto_id', e.target.value)}
                                        >
                                            <option value="">Seleccionar producto</option>
                                            {Array.isArray(products) && products.map((producto) => (
                                                <option 
                                                    key={producto.id} 
                                                    value={producto.id}
                                                    disabled={getProductStock(producto.id) <= 0}
                                                >
                                                    {producto.nombre} - Stock: {getProductStock(producto.id)}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="flex items-center gap-2 bg-bg rounded-lg border border-border">
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-interactive-component disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                                                onClick={() => handleProductChange(index, 'cantidad', item.cantidad - 1)}
                                                disabled={item.cantidad <= 1}
                                            >
                                                <Minus className="h-4 w-4 text-text-tertiary" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                                                className="w-16 px-2 py-1 text-center border-x border-border focus:outline-none bg-bg"
                                            />
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-interactive-component disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                                                onClick={() => handleProductChange(index, 'cantidad', item.cantidad + 1)}
                                                disabled={item.cantidad >= getProductStock(item.producto_id)}
                                            >
                                                <Plus className="h-4 w-4 text-text-tertiary" />
                                            </button>
                                        </div>

                                        <div className="w-32 text-right font-medium text-accessibility-text">
                                            {formatCurrency(item.cantidad * item.precio_unitario)}
                                        </div>

                                        <button
                                            type="button"
                                            className="p-2 text-text-tertiary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                            onClick={() => handleRemoveProduct(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Botón agregar producto */}
                            <button
                                type="button"
                                className="w-full p-3 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-text-tertiary hover:border-solid-color hover:text-solid-color hover:bg-interactive-component transition-colors"
                                onClick={handleAddProduct}
                            >
                                <Plus className="h-5 w-5" />
                                Agregar Producto
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 bg-bg-secondary">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-accessibility-text">Total:</span>
                        <span className="text-2xl font-bold text-solid-color">
                            {formatCurrency(calculateTotal())}
                        </span>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 border border-border rounded-lg bg-bg hover:bg-interactive-component text-accessibility-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 border border-transparent rounded-lg bg-solid-color hover:bg-solid-color-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleSubmit}
                            disabled={loading || selectedProducts.length === 0}
                        >
                            {loading ? 'Registrando...' : 'Registrar Venta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaVenta; 