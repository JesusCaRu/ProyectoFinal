import { motion as _motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Download,
  Printer,
  Tag,
  Box,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  BarChart2,
  ShoppingCart,
  Euro,
  Building,
  Briefcase,
  Menu
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useBrandStore } from '../../store/brandStore';
import { useAuthStore } from '../../store/authStore';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';
import LoadingIndicator from '../../components/LoadingIndicator';

const Inventario = () => {
  const { 
    products, 
    isLoading, 
    error,
    loadProducts,
    loadMovements,
    deleteProduct
  } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();
  const { user } = useAuthStore();
  const sedeId = user?.data?.sede?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showMovements, setShowMovements] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (sedeId) {
      loadProducts(sedeId);
      loadMovements(sedeId);
    }
    fetchCategories();
    fetchBrands();
  }, [sedeId, loadProducts, loadMovements, fetchCategories, fetchBrands]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || Number(product.categoria_id) === Number(selectedCategory);
    const matchesSede = product.sedes?.some(s => s.id === Number(sedeId));
    const matchesBrand = !selectedBrand || Number(product.marca_id) === Number(selectedBrand);
    return matchesSearch && matchesCategory && matchesSede && matchesBrand;
  });

  const getProductStock = (product) => {
    const sedeStock = product.sedes?.find(s => s.id === Number(sedeId))?.pivot;
    return sedeStock ? sedeStock.stock : 0;
  };

  const getProductPrice = (product, type = 'venta') => {
    const sedeStock = product.sedes?.find(s => s.id === Number(sedeId))?.pivot;
    return sedeStock ? sedeStock[`precio_${type}`] : 0;
  };

  const getProductStatus = (product) => {
    const stock = getProductStock(product);
    const stockMinimo = Number(product.stock_minimo);

    if (stock === 0) {
      return 'sin_stock';
    }

    if (stock <= stockMinimo) {
      return 'stock_bajo';
    }

    return 'en_stock';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const stats = [
    {
      title: 'Productos Totales',
      value: products.length.toString(),
      icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'En Stock',
      value: products.filter(product => getProductStatus(product) === 'en_stock').length.toString(),
      icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Stock Bajo',
      value: products.filter(product => getProductStatus(product) === 'stock_bajo').length.toString(),
      icon: <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Sin Stock',
      value: products.filter(product => getProductStatus(product) === 'sin_stock').length.toString(),
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-error" />,
      change: '+2%',
      trend: 'up'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_stock':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'stock_bajo':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'sin_stock':
        return <Clock className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_stock':
        return 'En Stock';
      case 'stock_bajo':
        return 'Stock Bajo';
      case 'sin_stock':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_stock':
        return 'bg-success/10 text-success';
      case 'stock_bajo':
        return 'bg-warning/10 text-warning';
      case 'sin_stock':
        return 'bg-error/10 text-error';
      default:
        return 'bg-text-tertiary/10 text-text-tertiary';
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setProductToDelete(null);
        setIsDeleting(false);
      }
    }
  };

  const handleExport = () => {
    // Implementar lógica de exportación
    const data = filteredProducts.map(product => ({
      Nombre: product.nombre,
      Descripción: product.descripcion,
      Categoría: product.categoria?.nombre || 'Sin categoría',
      Marca: product.marca?.nombre || 'Sin marca',
      Sede: product.sedes?.find(s => s.id === Number(sedeId))?.nombre || 'Sin sede',
      Stock: product.stock,
      'Stock Mínimo': product.stock_minimo,
      'Precio de Compra': product.precio_compra,
      'Precio de Venta': product.precio_venta,
      Estado: getStatusText(getProductStatus(product))
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleFilter = () => {
    // Aquí podríamos implementar filtros adicionales si es necesario
    // Por ahora, los filtros ya se aplican automáticamente con los estados
    console.log('Filtros aplicados:', {
      searchTerm,
      selectedCategory,
      sedeId,
      selectedBrand
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-solid-color" />
          <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Inventario</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={handleCreate}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Nuevo Producto</span>
          </button>
          <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-sm sm:text-base">
            <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Reportes</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-3 sm:p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">{stat.title}</h3>
            <p className="mt-1 text-base sm:text-xl md:text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>

        {/* Filtros para tablet/desktop */}
        <div className="hidden sm:flex sm:items-center sm:gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          >
            <option value="">Categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          >
            <option value="">Marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.nombre}
              </option>
            ))}
          </select>
          <button 
            onClick={handleFilter}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200"
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Filtrar</span>
          </button>
          <button 
            onClick={handleExport}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Exportar</span>
          </button>
        </div>

        {/* Filtros para móvil */}
        <div className="flex sm:hidden gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-3 py-1.5 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-bg border border-border rounded-lg shadow-lg z-50 w-64">
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color focus:border-transparent"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1">
                      Marca
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color focus:border-transparent"
                    >
                      <option value="">Todas las marcas</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        handleFilter();
                        setShowFilterMenu(false);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-solid-color hover:bg-solid-color-hover text-white rounded-lg transition-colors duration-200"
                    >
                      Aplicar
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedBrand('');
                        setShowFilterMenu(false);
                      }}
                      className="px-3 py-1.5 text-xs text-text-tertiary hover:text-text-primary rounded-lg transition-colors duration-200"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={handleFilter}
            className="p-1.5 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={handleExport}
            className="p-1.5 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabla de productos (para pantallas medianas y grandes) */}
      <div className="hidden md:block bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <LoadingIndicator 
                  variant="table" 
                  colSpan={8} 
                  text="Cargando productos..."
                />
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-8 py-3 sm:py-4 text-center text-text-tertiary">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  const stock = getProductStock(product);
                  const precioVenta = getProductPrice(product, 'venta');
                  const precioCompra = getProductPrice(product, 'compra');

                  return (
                    <tr key={product.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                            <Box className="h-4 w-4 sm:h-5 sm:w-5 text-solid-color" />
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-medium text-accessibility-text">
                              {product.nombre}
                            </div>
                            <div className="text-xs sm:text-sm text-text-tertiary">
                              {product.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <span className="text-sm sm:text-base text-text-tertiary">
                          {product.sku || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                          <span className="text-sm sm:text-base text-text-tertiary">
                            {product.categoria?.nombre || product.categoria || 'Sin categoría'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base text-text-tertiary">
                              {stock.toLocaleString()}
                            </span>
                            <span className="text-xs sm:text-sm text-text-tertiary">
                              Mín: {product.stock_minimo?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base text-text-tertiary">
                              {formatCurrency(precioVenta)}
                            </span>
                            {precioCompra && (
                              <span className="text-xs sm:text-sm text-text-tertiary">
                                Compra: {formatCurrency(precioCompra)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {getStatusIcon(status)}
                          <span className={`text-sm sm:text-base font-medium ${getStatusColor(status)} px-2 py-1 sm:px-3 sm:py-1.5 rounded-full`}>
                            {getStatusText(status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-text-tertiary">
                            Actualizado: {formatDate(product.updated_at)}
                          </span>
                          <span className="text-xs sm:text-sm text-text-tertiary">
                            Creado: {formatDate(product.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 sm:p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product)}
                            className="p-1.5 sm:p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator text="Cargando productos..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-sm">
            No se encontraron productos
          </div>
        ) : (
          filteredProducts.map((product) => {
            const status = getProductStatus(product);
            const stock = getProductStock(product);
            const precioVenta = getProductPrice(product, 'venta');
            
            return (
              <div 
                key={product.id} 
                className="bg-bg rounded-lg border border-border p-3 hover:border-solid-color/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-interactive-component rounded-lg">
                      <Box className="h-4 w-4 text-solid-color" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-accessibility-text">
                        {product.nombre}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {product.sku || 'Sin SKU'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-1.5 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                      title="Editar producto"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product)}
                      className="p-1.5 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-3 w-3 text-text-tertiary" />
                    <div>
                      <div className="text-xs text-text-tertiary">Categoría:</div>
                      <div className="text-xs font-medium text-accessibility-text">
                        {product.categoria?.nombre || 'Sin categoría'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="h-3 w-3 text-text-tertiary" />
                    <div>
                      <div className="text-xs text-text-tertiary">Precio:</div>
                      <div className="text-xs font-medium text-accessibility-text">
                        {formatCurrency(precioVenta)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-3 w-3 text-text-tertiary" />
                    <div>
                      <div className="text-xs text-text-tertiary">Stock:</div>
                      <div className="text-xs font-medium text-accessibility-text">
                        {stock.toLocaleString()} (Mín: {product.stock_minimo || 0})
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">Estado:</div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(status)}
                      <span className={`text-xs font-medium ${getStatusColor(status)} px-2 py-0.5 rounded-full`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="text-xs text-text-tertiary">
                    Actualizado: {formatDate(product.updated_at)}
                  </span>
                  <button 
                    onClick={() => setShowMovements(!showMovements)}
                    className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200 flex items-center space-x-1"
                    title="Ver movimientos"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span className="text-xs">Movimientos</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para crear/editar producto */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            ¿Estás seguro de que deseas eliminar el producto {productToDelete?.nombre}?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              {isDeleting ? (
                <LoadingIndicator variant="button" text="Eliminando..." />
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventario; 