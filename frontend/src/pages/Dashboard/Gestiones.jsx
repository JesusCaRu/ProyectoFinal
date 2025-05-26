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
  Trash2
} from 'lucide-react';
import Modal from '../../components/Modal';
import { useProductStore } from '../../store/productStore';
import { useProveedorStore } from '../../store/proveedorStore';
import { useBrandStore } from '../../store/brandStore';
import { useSedeStore } from '../../store/sedeStore';
import { useCategoryStore } from '../../store/categoryStore';

const Gestiones = () => {
  const [activeTab, setActiveTab] = useState('productos');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

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
    setModalOpen(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item);
    setModalOpen(true);
  };

  const handleDelete = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      switch (modalType) {
        case 'productos':
          await deleteProduct(selectedItem.id);
          break;
        case 'proveedores':
          await deleteProvider(selectedItem.id);
          break;
        case 'marcas':
          await deleteBrand(selectedItem.id);
          break;
        case 'sedes':
          await deleteSede(selectedItem.id);
          break;
        case 'categorias':
          await deleteCategory(selectedItem.id);
          break;
        default:
          break;
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (modalType) {
        case 'productos':
          if (selectedItem) {
            await updateProduct(selectedItem.id, formData);
          } else {
            await createProduct(formData);
          }
          break;
        case 'proveedores':
          if (selectedItem) {
            await updateProveedor(selectedItem.id, formData);
          } else {
            await createProveedor(formData);
          }
          break;
        case 'marcas':
          if (selectedItem) {
            await updateBrand(selectedItem.id, formData);
          } else {
            await createBrand(formData);
          }
          break;
        case 'sedes':
          if (selectedItem) {
            await updateSede(selectedItem.id, formData);
          } else {
            await createSede(formData);
          }
          break;
        case 'categorias':
          if (selectedItem) {
            await updateCategory(selectedItem.id, formData);
          } else {
            await createCategory(formData);
          }
          break;
        default:
          break;
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getFormFields = () => {
    switch (modalType) {
      case 'productos':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'sku', label: 'SKU', type: 'text', required: true },
          { name: 'stock', label: 'Stock', type: 'number', required: true },
          { name: 'precio', label: 'Precio', type: 'number', required: true },
        ];
      case 'proveedores':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'contacto', label: 'Contacto', type: 'text', required: true },
          { name: 'telefono', label: 'Teléfono', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ];
      case 'marcas':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'text' },
        ];
      case 'sedes':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'direccion', label: 'Dirección', type: 'text', required: true },
          { name: 'telefono', label: 'Teléfono', type: 'text' },
        ];
      case 'categorias':
        return [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'text' },
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
        { header: 'Stock', accessor: 'stock' },
        { header: 'Precio', accessor: 'precio' },
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
                              {item[column.accessor]}
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
        onClose={() => setModalOpen(false)}
        title={`${selectedItem ? 'Editar' : 'Agregar'} ${modalType.slice(0, -1)}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {getFormFields().map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                required={field.required}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-text-tertiary hover:text-accessibility-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg"
            >
              {selectedItem ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
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
              className="px-4 py-2 text-text-tertiary hover:text-accessibility-text"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-error hover:bg-error-hover text-white rounded-lg"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Gestiones; 