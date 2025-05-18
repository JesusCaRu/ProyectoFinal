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
  DollarSign,
  Building,
  Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { useSedeStore } from '../../store/sedeStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useBrandStore } from '../../store/brandStore';
import Modal from '../../components/Modal';
import ProductForm from '../../components/ProductForm';

const Inventario = () => {
  const { 
    products, 
    isLoading, 
    error,
    loadProducts,
    loadMovements,
    deleteProduct
  } = useProductStore();
  const { sedes, fetchSedes } = useSedeStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showMovements, setShowMovements] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
    loadMovements();
    fetchSedes();
    fetchCategories();
    fetchBrands();
  }, [loadProducts, loadMovements, fetchSedes, fetchCategories, fetchBrands]);

  const filteredProducts = products.filter(product => {
    console.log('Filtering product:', {
      id: product.id,
      sede_id: product.sede_id,
      selectedSede: selectedSede,
      sede_id_type: typeof product.sede_id,
      selectedSede_type: typeof selectedSede,
      matchesSede: !selectedSede || Number(product.sede_id) === Number(selectedSede)
    });

    const matchesSearch = 
      product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || Number(product.categoria_id) === Number(selectedCategory);
    const matchesSede = !selectedSede || Number(product.sede_id) === Number(selectedSede);
    const matchesBrand = !selectedBrand || Number(product.marca_id) === Number(selectedBrand);
    
    return matchesSearch && matchesCategory && matchesSede && matchesBrand;
  });

  const getProductStatus = (product) => {
    // Convertir a números para asegurar comparaciones correctas
    const stock = Number(product.stock);
    const stockMinimo = Number(product.stock_minimo);

    console.log('Calculating product status:', {
      id: product.id,
      nombre: product.nombre,
      raw_stock: product.stock,
      raw_stock_minimo: product.stock_minimo,
      processed_stock: stock,
      processed_stock_minimo: stockMinimo,
      stock_type: typeof stock,
      stock_minimo_type: typeof stockMinimo,
      is_zero: stock === 0,
      is_below_min: stock <= stockMinimo,
      is_above_min: stock > stockMinimo
    });

    // Si el stock es 0, está sin stock
    if (stock === 0) {
      console.log(`Product ${product.nombre} (${product.id}): Sin stock (stock = 0)`);
      return 'sin_stock';
    }

    // Si el stock es menor o igual al mínimo, está bajo
    if (stock <= stockMinimo) {
      console.log(`Product ${product.nombre} (${product.id}): Stock bajo (${stock} <= ${stockMinimo})`);
      return 'stock_bajo';
    }

    // Si el stock es mayor que el mínimo, está en stock
    console.log(`Product ${product.nombre} (${product.id}): En stock (${stock} > ${stockMinimo})`);
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
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const stats = [
    {
      title: 'Productos Totales',
      value: products.length.toString(),
      icon: <Package className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'En Stock',
      value: products.filter(product => getProductStatus(product) === 'en_stock').length.toString(),
      icon: <CheckCircle className="h-6 w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Stock Bajo',
      value: products.filter(product => getProductStatus(product) === 'stock_bajo').length.toString(),
      icon: <AlertCircle className="h-6 w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Sin Stock',
      value: products.filter(product => getProductStatus(product) === 'sin_stock').length.toString(),
      icon: <Clock className="h-6 w-6 text-error" />,
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
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setProductToDelete(null);
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
      Sede: product.sede?.nombre || 'Sin sede',
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
      selectedSede,
      selectedBrand
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Inventario</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreate}
            className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Producto</span>
          </button>
          <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <BarChart2 className="h-5 w-5" />
            <span>Reportes</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-interactive-component rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="mt-4 text-sm text-text-tertiary">{stat.title}</h3>
            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todas las marcas</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.nombre}
            </option>
          ))}
        </select>
        <select
          value={selectedSede}
          onChange={(e) => setSelectedSede(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todas las sedes</option>
          {sedes.map(sede => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
        <button 
          onClick={handleFilter}
          className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-8 py-4 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-8 py-4 text-center text-text-tertiary">
                    Cargando productos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-8 py-4 text-center text-text-tertiary">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-interactive-component rounded-lg">
                            <Box className="h-5 w-5 text-solid-color" />
                          </div>
                          <div>
                            <div className="text-base font-medium text-accessibility-text">
                              {product.nombre}
                            </div>
                            <div className="text-sm text-text-tertiary">
                              {product.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-base text-text-tertiary">
                          {product.sku || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Tag className="h-5 w-5 text-text-tertiary" />
                          <span className="text-base text-text-tertiary">
                            {product.categoria?.nombre || product.categoria || 'Sin categoría'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-text-tertiary" />
                          <div className="flex flex-col">
                            <span className="text-base text-text-tertiary">
                              {product.stock?.toLocaleString() || '0'}
                            </span>
                            <span className="text-sm text-text-tertiary">
                              Mín: {product.stock_minimo?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-text-tertiary" />
                          <div className="flex flex-col">
                            <span className="text-base text-text-tertiary">
                              {formatCurrency(product.precio_venta)}
                            </span>
                            {product.precio_compra && (
                              <span className="text-sm text-text-tertiary">
                                Compra: {formatCurrency(product.precio_compra)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className={`text-base font-medium ${getStatusColor(status)} px-3 py-1.5 rounded-full`}>
                            {getStatusText(status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-text-tertiary">
                            Actualizado: {formatDate(product.updated_at)}
                          </span>
                          <span className="text-sm text-text-tertiary">
                            Creado: {formatDate(product.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                            title="Editar producto"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product)}
                            className="p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => setShowMovements(!showMovements)}
                            className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                            title="Ver movimientos"
                          >
                            <ShoppingCart className="h-5 w-5" />
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
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventario; 