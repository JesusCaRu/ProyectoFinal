import React, { useState } from 'react';
import { motion as _motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Tag, 
  Building2, 
  ShoppingCart, 
  Layers,
  Settings,
  AlertTriangle,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react';
import Modal from '../../components/Modal';
import { useProductStore } from '../../store/productStore';
import { useProveedorStore } from '../../store/proveedorStore';
import { useBrandStore } from '../../store/brandStore';
import { useSedeStore } from '../../store/sedeStore';
import { useCategoryStore } from '../../store/categoryStore';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../lib/utils';

const Gestiones = () => {
  const [activeTab, setActiveTab] = useState('productos');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [productSedeData, setProductSedeData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    loadProducts,
    deleteProduct,
    createProduct,
    updateProduct
  } = useProductStore();

  const {
    proveedores: providers,
    isLoading: providersLoading,
    error: providersError,
    fetchProveedores,
    deleteProveedor: deleteProvider,
    createProveedor,
    updateProveedor
  } = useProveedorStore();

  const {
    brands,
    isLoading: brandsLoading,
    error: brandsError,
    fetchBrands,
    deleteBrand,
    createBrand,
    updateBrand
  } = useBrandStore();

  const {
    sedes,
    isLoading: sedesLoading,
    error: sedesError,
    fetchSedes,
    deleteSede,
    createSede,
    updateSede
  } = useSedeStore();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    deleteCategory,
    createCategory,
    updateCategory
  } = useCategoryStore();

  React.useEffect(() => {
    loadProducts();
    fetchProveedores();
    fetchBrands();
    fetchSedes();
    fetchCategories();
  }, [loadProducts, fetchProveedores, fetchBrands, fetchSedes, fetchCategories]);

  const handleAdd = (type) => {
    setModalType(type);
    setSelectedItem(null);
    setFormData({});
    
    if (type === 'productos') {
      // Inicializar datos de sedes vacíos
      const initialSedeData = sedes.map(sede => ({
        sede_id: sede.id,
        stock: 0,
        precio_compra: 0,
        precio_venta: 0
      }));
      setProductSedeData(initialSedeData);
    }
    
    setModalOpen(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    
    if (type === 'productos' && item.sedes) {
      // Para productos, preparamos los datos de relación con sedes
      const sedeData = item.sedes.map(sede => ({
        sede_id: sede.id,
        stock: sede.pivot.stock,
        precio_compra: sede.pivot.precio_compra,
        precio_venta: sede.pivot.precio_venta
      }));
      setProductSedeData(sedeData);
      
      // Para el formulario principal solo incluimos datos del producto
      const productData = {
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        sku: item.sku,
        stock_minimo: item.stock_minimo,
        categoria_id: item.categoria_id,
        marca_id: item.marca_id,
        tipo_producto: item.tipo_producto
      };
      setFormData(productData);
    } else {
      setFormData(item);
    }
    
    setModalOpen(true);
  };

  const handleDelete = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      let success = false;
      let itemName = selectedItem?.nombre || '';
      
      switch (modalType) {
        case 'productos':
          success = await deleteProduct(selectedItem.id);
          break;
        case 'proveedores':
          success = await deleteProvider(selectedItem.id);
          break;
        case 'marcas':
          success = await deleteBrand(selectedItem.id);
          break;
        case 'sedes':
          success = await deleteSede(selectedItem.id);
          break;
        case 'categorias':
          success = await deleteCategory(selectedItem.id);
          break;
        default:
          break;
      }

      if (success) {
        toast.success(`"${itemName}" eliminado correctamente`);
        setDeleteModalOpen(false);
        
        // Recargar los datos correspondientes
        switch (modalType) {
          case 'productos':
            loadProducts();
            break;
          case 'proveedores':
            fetchProveedores();
            break;
          case 'marcas':
            fetchBrands();
            break;
          case 'sedes':
            fetchSedes();
            break;
          case 'categorias':
            fetchCategories();
            break;
          default:
            break;
        }
      } else {
        toast.error(`Error al eliminar "${itemName}"`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      const errorMessage = error.response?.data?.message || error.message || `Error al eliminar el elemento`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSedeDataChange = (sedeId, field, value) => {
    setProductSedeData(prevData => 
      prevData.map(item => 
        item.sede_id === sedeId 
          ? { ...item, [field]: value } 
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let success = false;
      let dataToSubmit = { ...formData };
      let itemName = formData.nombre || '';
      
      // Para productos, necesitamos preparar los datos de sedes
      if (modalType === 'productos') {
        // Validar que el SKU no esté vacío
        if (!dataToSubmit.sku) {
          toast.error('El SKU es obligatorio');
          return;
        }
        
        // Validar que la categoría y marca estén seleccionadas
        if (!dataToSubmit.categoria_id) {
          toast.error('Debe seleccionar una categoría');
          return;
        }
        
        if (!dataToSubmit.marca_id) {
          toast.error('Debe seleccionar una marca');
          return;
        }
        
        // Asegurar que tipo_producto esté definido
        if (!dataToSubmit.tipo_producto) {
          toast.error('Debe seleccionar un tipo de producto');
          return;
        }
        
        // Preparar datos de sedes
        dataToSubmit.sedes = productSedeData;
      }
      
      const action = selectedItem ? 'actualizado' : 'creado';
      
      switch (modalType) {
        case 'productos':
          if (selectedItem) {
            success = await updateProduct(selectedItem.id, dataToSubmit);
          } else {
            success = await createProduct(dataToSubmit);
          }
          break;
        case 'proveedores':
          if (selectedItem) {
            success = await updateProveedor(selectedItem.id, dataToSubmit);
          } else {
            success = await createProveedor(dataToSubmit);
          }
          break;
        case 'marcas':
          if (selectedItem) {
            success = await updateBrand(selectedItem.id, dataToSubmit);
          } else {
            success = await createBrand(dataToSubmit);
          }
          break;
        case 'sedes':
          if (selectedItem) {
            success = await updateSede(selectedItem.id, dataToSubmit);
          } else {
            success = await createSede(dataToSubmit);
          }
          break;
        case 'categorias':
          if (selectedItem) {
            success = await updateCategory(selectedItem.id, dataToSubmit);
          } else {
            success = await createCategory(dataToSubmit);
          }
          break;
        default:
          break;
      }

      if (success) {
        toast.success(`"${itemName}" ${action} correctamente`);
        setModalOpen(false);
        
        // Recargar los datos correspondientes
        switch (modalType) {
          case 'productos':
            loadProducts();
            break;
          case 'proveedores':
            fetchProveedores();
            break;
          case 'marcas':
            fetchBrands();
            break;
          case 'sedes':
            fetchSedes();
            break;
          case 'categorias':
            fetchCategories();
            break;
          default:
            break;
        }
      } else {
        toast.error(`Error al ${action} "${itemName}"`);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la solicitud';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const getFormFields = () => {
    switch (modalType) {
      case 'productos':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'sku', label: 'SKU', type: 'text', required: true },
          { name: 'tipo_producto', label: 'Tipo de Producto', type: 'select', required: true,
            options: [
              { value: 'ROB', label: 'Robot (ROB)' },
              { value: 'REP', label: 'Repuesto (REP)' },
              { value: 'ACC', label: 'Accesorio (ACC)' },
              { value: 'OTR', label: 'Otro (OTR)' }
            ]
          },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { 
            name: 'categoria_id', 
            label: 'Categoría', 
            type: 'select', 
            required: true,
            options: categories.map(cat => ({ value: cat.id, label: cat.nombre }))
          },
          { 
            name: 'marca_id', 
            label: 'Marca', 
            type: 'select', 
            required: true,
            options: brands.map(brand => ({ value: brand.id, label: brand.nombre }))
          },
          { name: 'stock_minimo', label: 'Stock Mínimo', type: 'number', required: true, min: 0 }
        ];
      case 'proveedores':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'contacto', label: 'Persona de Contacto', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'telefono', label: 'Teléfono', type: 'tel' }
        ];
      case 'marcas':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' }
        ];
      case 'sedes':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'direccion', label: 'Dirección', type: 'text' },
          { name: 'telefono', label: 'Teléfono', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email' }
        ];
      case 'categorias':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' }
        ];
      default:
        return [];
    }
  };

  const tabs = [
    {
      id: 'productos',
      name: 'Productos',
      icon: Package,
      data: products,
      isLoading: productsLoading,
      error: productsError,
      columns: [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'SKU', accessor: 'sku' },
        { 
          header: 'Categoría', 
          accessor: 'categoria_id', 
          render: (value) => {
            const categoria = categories.find(c => c.id === value);
            return categoria ? categoria.nombre : 'Sin categoría';
          }
        },
        { 
          header: 'Marca', 
          accessor: 'marca_id', 
          render: (value) => {
            const marca = brands.find(b => b.id === value);
            return marca ? marca.nombre : 'Sin marca';
          }
        },
        { 
          header: 'Stock', 
          accessor: 'sedes', 
          render: (sedes) => {
            // Mostrar stock total sumando todas las sedes
            const totalStock = sedes?.reduce((sum, sede) => sum + (sede.pivot?.stock || 0), 0) || 0;
            return totalStock.toLocaleString('es-ES');
          }
        },
        { 
          header: 'Precio Compra', 
          accessor: 'sedes',
          render: (sedes) => {
            // Mostrar el precio promedio de compra
            if (!sedes || sedes.length === 0) return formatCurrency(0);
            const totalSedes = sedes.length;
            const sumPrecio = sedes.reduce((sum, sede) => sum + (sede.pivot?.precio_compra || 0), 0);
            return formatCurrency(sumPrecio / totalSedes);
          }
        },
        { 
          header: 'Precio Venta', 
          accessor: 'sedes',
          render: (sedes) => {
            // Mostrar el precio promedio de venta
            if (!sedes || sedes.length === 0) return formatCurrency(0);
            const totalSedes = sedes.length;
            const sumPrecio = sedes.reduce((sum, sede) => sum + (sede.pivot?.precio_venta || 0), 0);
            return formatCurrency(sumPrecio / totalSedes);
          }
        },
      ]
    },
    {
      id: 'proveedores',
      name: 'Proveedores',
      icon: Truck,
      data: providers,
      isLoading: providersLoading,
      error: providersError,
      columns: [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Contacto', accessor: 'contacto' },
        { header: 'Teléfono', accessor: 'telefono' },
        { header: 'Email', accessor: 'email' },
        { header: 'Ciudad', accessor: 'ciudad' },
        { header: 'País', accessor: 'pais' },
      ]
    },
    {
      id: 'marcas',
      name: 'Marcas',
      icon: Tag,
      data: brands,
      isLoading: brandsLoading,
      error: brandsError,
      columns: [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Descripción', accessor: 'descripcion' },
      ]
    },
    {
      id: 'sedes',
      name: 'Sedes',
      icon: Building2,
      data: sedes,
      isLoading: sedesLoading,
      error: sedesError,
      columns: [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Dirección', accessor: 'direccion' },
        { header: 'Teléfono', accessor: 'telefono' },
      ]
    },
    {
      id: 'categorias',
      name: 'Categorías',
      icon: Layers,
      data: categories,
      isLoading: categoriesLoading,
      error: categoriesError,
      columns: [
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Descripción', accessor: 'descripcion' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Settings className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Gestión del Sistema</h1>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-solid-color text-solid-color'
                  : 'border-transparent text-text-tertiary hover:text-accessibility-text hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-accessibility-text">
                  {tab.name}
                </h2>
                <button
                  onClick={() => handleAdd(tab.id)}
                  className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <span>Agregar {tab.name.slice(0, -1)}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-bg-secondary">
                    <tr>
                      {tab.columns.map((column, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider"
                        >
                          {column.header}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg divide-y divide-border">
                    {tab.isLoading ? (
                      <tr>
                        <td colSpan={tab.columns.length + 1} className="px-6 py-4 text-center">
                          Cargando...
                        </td>
                      </tr>
                    ) : tab.error ? (
                      <tr>
                        <td colSpan={tab.columns.length + 1} className="px-6 py-4 text-center text-error">
                          Error: {tab.error}
                        </td>
                      </tr>
                    ) : tab.data?.length === 0 ? (
                      <tr>
                        <td colSpan={tab.columns.length + 1} className="px-6 py-4 text-center text-text-tertiary">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      tab.data?.map((item) => (
                        <tr key={item.id} className="hover:bg-interactive-component/50">
                          {tab.columns.map((column, index) => (
                            <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                              {column.render ? column.render(item[column.accessor], item) : item[column.accessor]}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(tab.id, item)}
                                className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(tab.id, item)}
                                className="p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={`${selectedItem ? 'Editar' : 'Agregar'} ${modalType.slice(0, -1)}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFormFields().map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {field.label} {field.required && <span className="text-error">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={!!formData[field.name]}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-solid-color focus:ring-solid-color border-border rounded"
                    />
                    <span className="ml-2 text-sm text-text-secondary">
                      {field.checkboxLabel || `¿${field.label}?`}
                    </span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Gestión de stock y precios por sede para productos */}
          {modalType === 'productos' && sedes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-accessibility-text mb-4">Stock y Precios por Sede</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Sede
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Precio Compra (€)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Precio Venta (€)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg divide-y divide-border">
                    {productSedeData.map((sedeItem) => {
                      const sede = sedes.find(s => s.id === sedeItem.sede_id);
                      return (
                        <tr key={sedeItem.sede_id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-accessibility-text">{sede?.nombre || 'Sede desconocida'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={sedeItem.stock || 0}
                              onChange={(e) => handleSedeDataChange(sedeItem.sede_id, 'stock', parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-solid-color"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={sedeItem.precio_compra || 0}
                              onChange={(e) => handleSedeDataChange(sedeItem.sede_id, 'precio_compra', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-solid-color"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={sedeItem.precio_venta || 0}
                              onChange={(e) => handleSedeDataChange(sedeItem.sede_id, 'precio_venta', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 bg-bg border border-border rounded focus:outline-none focus:ring-1 focus:ring-solid-color"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-text-tertiary hover:text-accessibility-text disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg disabled:opacity-50 flex items-center space-x-1"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{selectedItem ? 'Guardar cambios' : 'Agregar'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isSubmitting && setDeleteModalOpen(false)}
        title="Confirmar eliminación"
        size="md"
      >
        <div className="p-4">
          <div className="flex items-center space-x-3 text-error mb-4">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-lg font-medium">
              ¿Estás seguro de que deseas eliminar este elemento?
            </p>
          </div>
          <p className="text-text-tertiary mb-6">
            Esta acción no se puede deshacer. Se eliminará permanentemente el elemento seleccionado.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-text-tertiary hover:text-accessibility-text disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-error hover:bg-error-hover text-white rounded-lg disabled:opacity-50 flex items-center space-x-1"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Gestiones; 