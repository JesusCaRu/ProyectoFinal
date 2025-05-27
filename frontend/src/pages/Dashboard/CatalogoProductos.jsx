import { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { Search, Filter, Package, Tag, Info } from 'lucide-react';
import { useProductStore } from '../../store/productStore';

const CatalogoProductos = () => {
    const { products, isLoading, error, loadProducts } = useProductStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.categoria_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-accessibility-text">Catálogo de Productos</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                        />
                        <Search className="absolute left-3 top-2.5 text-text-tertiary" size={20} />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color bg-bg text-accessibility-text"
                    >
                        <option value="">Todas las categorías</option>
                        {/* Aquí irían las categorías */}
                    </select>
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <_motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-bg-secondary rounded-lg shadow-md overflow-hidden border border-border hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-interactive-component rounded-lg">
                                        <Package className="h-6 w-6 text-solid-color" />
                                    </div>
                                    <span className="text-sm font-medium text-text-tertiary">
                                        SKU: {product.sku || 'N/A'}
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-accessibility-text line-clamp-1">
                                        {product.nombre}
                                    </h3>
                                    <p className="text-text-tertiary text-sm line-clamp-2">
                                        {product.descripcion}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                                        <Tag className="h-4 w-4" />
                                        <span>{product.categoria?.nombre || 'Sin categoría'}</span>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-solid-color">
                                                ${product.precio_venta}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${
                                                    product.stock > 5 
                                                        ? 'text-success' 
                                                        : product.stock > 0 
                                                            ? 'text-warning' 
                                                            : 'text-error'
                                                }`}>
                                                    {product.stock > 0 
                                                        ? `${product.stock} unidades disponibles`
                                                        : 'Sin stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </_motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogoProductos; 