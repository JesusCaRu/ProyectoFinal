import { useState, useEffect } from 'react';
import useStockStore from '../store/stockStore';

const StockManager = () => {
  const { 
    products, 
    categories, 
    brands, 
    locations,
    loading, 
    error, 
    fetchProducts, 
    fetchCategories,
    fetchBrands,
    fetchLocations,
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useStockStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    marca_id: '',
    stock: 0,
    precio_compra: 0,
    precio_venta: 0,
    sede_id: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchLocations();
  }, [fetchProducts, fetchCategories, fetchBrands, fetchLocations]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      categoria_id: product.categoria_id || '',
      marca_id: product.marca_id || '',
      stock: product.stock || 0,
      precio_compra: product.precio_compra || 0,
      precio_venta: product.precio_venta || 0,
      sede_id: product.sede_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingProduct
      ? await updateProduct(editingProduct.id, formData)
      : await addProduct(formData);

    if (result.success) {
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: '',
        marca_id: '',
        stock: 0,
        precio_compra: 0,
        precio_venta: 0,
        sede_id: ''
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Stock</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              nombre: '',
              descripcion: '',
              categoria_id: '',
              marca_id: '',
              stock: 0,
              precio_compra: 0,
              precio_venta: 0,
              sede_id: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Producto
        </button>
      </div>

      {Array.isArray(products) && products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left">Nombre</th>
                <th className="px-6 py-3 border-b text-left">Descripción</th>
                <th className="px-6 py-3 border-b text-left">Categoría</th>
                <th className="px-6 py-3 border-b text-left">Marca</th>
                <th className="px-6 py-3 border-b text-right">Stock</th>
                <th className="px-6 py-3 border-b text-right">Precio Compra</th>
                <th className="px-6 py-3 border-b text-right">Precio Venta</th>
                <th className="px-6 py-3 border-b text-left">Sede</th>
                <th className="px-6 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{product.nombre || '-'}</td>
                  <td className="px-6 py-4 border-b">{product.descripcion || '-'}</td>
                  <td className="px-6 py-4 border-b">{product.categoria?.nombre || '-'}</td>
                  <td className="px-6 py-4 border-b">{product.marca?.nombre || '-'}</td>
                  <td className="px-6 py-4 border-b text-right">{product.stock || 0}</td>
                  <td className="px-6 py-4 border-b text-right">${product.precio_compra || 0}</td>
                  <td className="px-6 py-4 border-b text-right">${product.precio_venta || 0}</td>
                  <td className="px-6 py-4 border-b">{product.sede?.nombre || '-'}</td>
                  <td className="px-6 py-4 border-b text-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4">No hay productos disponibles</div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select
                  value={formData.marca_id}
                  onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione una marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Precio de Compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Precio de Venta</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Sede</label>
                <select
                  value={formData.sede_id}
                  onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione una sede</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingProduct ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManager; 