import { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { Search, Filter, Package, Tag, Info, Building2, Menu } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useSedeStore } from '../../store/sedeStore';

const CatalogoProductos = () => {
    const { products, isLoading, error, loadProducts } = useProductStore();
    const { sedes, fetchSedes } = useSedeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSede, setSelectedSede] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadProducts();
        fetchSedes();
    }, [loadProducts, fetchSedes]);

    // Obtener el stock de un producto en una sede específica
    const getStockInSede = (product, sedeId) => {
        if (!product.sedes) return 0;
        const sede = product.sedes.find(s => s.id === Number(sedeId));
        return Number(sede?.stock) || 0;
    };

    // Obtener el precio de venta de un producto en una sede específica
    const getPrecioVentaInSede = (product, sedeId) => {
        if (!product.sedes) return Number(product.precio_venta) || 0;
        const sede = product.sedes.find(s => s.id === Number(sedeId));
        return Number(sede?.precio_venta) || Number(product.precio_venta) || 0;
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.categoria_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Catálogo de Productos</h1>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Búsqueda para escritorio y móvil */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    {/* Filtros para escritorio */}
                    <div className="hidden sm:flex gap-4">
                        <select
                            value={selectedSede}
                            onChange={(e) => setSelectedSede(e.target.value)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        >
                            <option value="">Todas las sedes</option>
                            {sedes.map(sede => (
                                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                            ))}
                        </select>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        >
                            <option value="">Todas las categorías</option>
                            {/* Aquí irían las categorías */}
                        </select>
                    </div>

                    {/* Botón de filtros para móvil */}
                    <button
                        className="sm:hidden flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filtros</span>
                    </button>
                </div>
            </div>

            {/* Panel de filtros para móvil */}
            {showFilters && (
                <div className="mb-4 p-3 bg-bg-secondary rounded-lg border border-border shadow-md sm:hidden space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-text-tertiary mb-1">Sede</label>
                        <select
                            value={selectedSede}
                            onChange={(e) => setSelectedSede(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color bg-bg text-accessibility-text"
                        >
                            <option value="">Todas las sedes</option>
                            {sedes.map(sede => (
                                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-tertiary mb-1">Categoría</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color bg-bg text-accessibility-text"
                        >
                            <option value="">Todas las categorías</option>
                            {/* Aquí irían las categorías */}
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowFilters(false)}
                            className="px-3 py-1.5 text-xs bg-solid-color hover:bg-solid-color-hover text-white rounded-lg transition-colors duration-200"
                        >
                            Aplicar filtros
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 sm:p-4 bg-error/10 text-error rounded-lg text-xs sm:text-sm">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-40 sm:h-64">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-solid-color"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map((product) => {
                        const stock = selectedSede ? getStockInSede(product, selectedSede) : 
                            product.sedes?.reduce((total, sede) => total + (Number(sede.stock) || 0), 0) || 0;
                        const precioVenta = selectedSede ? getPrecioVentaInSede(product, selectedSede) : Number(product.precio_venta) || 0;

                        return (
                        <_motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-bg-secondary rounded-lg shadow-md overflow-hidden border border-border hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-3 sm:p-6">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="p-2 sm:p-3 bg-interactive-component rounded-lg">
                                        <Package className="h-4 w-4 sm:h-6 sm:w-6 text-solid-color" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-text-tertiary">
                                        SKU: {product.sku || 'N/A'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 sm:space-y-3">
                                    <h3 className="text-base sm:text-lg font-semibold text-accessibility-text line-clamp-1">
                                        {product.nombre}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-text-tertiary line-clamp-2">
                                        {product.descripcion}
                                    </p>
                                    
                                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-text-tertiary">
                                        <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span>{product.categoria?.nombre || 'Sin categoría'}</span>
                                    </div>

                                    {selectedSede && (
                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-text-tertiary">
                                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>{sedes.find(s => s.id === Number(selectedSede))?.nombre}</span>
                                        </div>
                                    )}

                                    <div className="pt-2 sm:pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base sm:text-xl font-bold text-solid-color">
                                                    €{precioVenta.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </span>
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <span className={`text-xs sm:text-sm font-medium ${
                                                        stock > 5 
                                                        ? 'text-success' 
                                                            : stock > 0 
                                                            ? 'text-warning' 
                                                            : 'text-error'
                                                }`}>
                                                        {stock > 0 
                                                            ? `${stock} unidades`
                                                        : 'Sin stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </_motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CatalogoProductos; 