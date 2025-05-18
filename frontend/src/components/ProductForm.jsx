import { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import { useSedeStore } from '../store/sedeStore';
import { useCategoryStore } from '../store/categoryStore';
import { useBrandStore } from '../store/brandStore';

const ProductForm = ({ product, onClose }) => {
  const { createProduct, updateProduct } = useProductStore();
  const { sedes, fetchSedes } = useSedeStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    marca_id: '',
    stock: 0,
    stock_minimo: 0,
    precio_compra: 0,
    precio_venta: 0,
    sede_id: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSedes();
    fetchCategories();
    fetchBrands();
  }, [fetchSedes, fetchCategories, fetchBrands]);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        categoria_id: product.categoria_id || '',
        marca_id: product.marca_id || '',
        stock: product.stock || 0,
        stock_minimo: product.stock_minimo || 0,
        precio_compra: product.precio_compra || 0,
        precio_venta: product.precio_venta || 0,
        sede_id: product.sede_id || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('precio') || name.includes('stock') ? Number(value) : value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.categoria_id) newErrors.categoria_id = 'La categoría es requerida';
    if (!formData.marca_id) newErrors.marca_id = 'La marca es requerida';
    if (!formData.sede_id) newErrors.sede_id = 'La sede es requerida';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (formData.stock_minimo < 0) newErrors.stock_minimo = 'El stock mínimo no puede ser negativo';
    if (formData.precio_compra < 0) newErrors.precio_compra = 'El precio de compra no puede ser negativo';
    if (formData.precio_venta < 0) newErrors.precio_venta = 'El precio de venta no puede ser negativo';
    if (formData.precio_venta < formData.precio_compra) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor al precio de compra';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar el producto'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.nombre ? 'border-error' : 'border-border'
            }`}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-error">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Descripción
          </label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Categoría
          </label>
          <select
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.categoria_id ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          {errors.categoria_id && (
            <p className="mt-1 text-sm text-error">{errors.categoria_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Marca
          </label>
          <select
            name="marca_id"
            value={formData.marca_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.marca_id ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Seleccionar marca</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.nombre}
              </option>
            ))}
          </select>
          {errors.marca_id && (
            <p className="mt-1 text-sm text-error">{errors.marca_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Stock Actual
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.stock ? 'border-error' : 'border-border'
            }`}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-error">{errors.stock}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Stock Mínimo
          </label>
          <input
            type="number"
            name="stock_minimo"
            value={formData.stock_minimo}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.stock_minimo ? 'border-error' : 'border-border'
            }`}
          />
          {errors.stock_minimo && (
            <p className="mt-1 text-sm text-error">{errors.stock_minimo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Precio de Compra
          </label>
          <input
            type="number"
            name="precio_compra"
            value={formData.precio_compra}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.precio_compra ? 'border-error' : 'border-border'
            }`}
          />
          {errors.precio_compra && (
            <p className="mt-1 text-sm text-error">{errors.precio_compra}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Precio de Venta
          </label>
          <input
            type="number"
            name="precio_venta"
            value={formData.precio_venta}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.precio_venta ? 'border-error' : 'border-border'
            }`}
          />
          {errors.precio_venta && (
            <p className="mt-1 text-sm text-error">{errors.precio_venta}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Sede
          </label>
          <select
            name="sede_id"
            value={formData.sede_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.sede_id ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Seleccionar sede</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
          {errors.sede_id && (
            <p className="mt-1 text-sm text-error">{errors.sede_id}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-solid-color hover:bg-solid-color-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 