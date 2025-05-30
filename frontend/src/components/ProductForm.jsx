import { useState, useEffect } from 'react';
import { useProductStore } from '../store/productStore';
import { useSedeStore } from '../store/sedeStore';
import { useCategoryStore } from '../store/categoryStore';
import { useBrandStore } from '../store/brandStore';
import { useAuthStore } from '../store/authStore';

const ProductForm = ({ product, onClose }) => {
  const { createProduct, updateProduct, products } = useProductStore();
  const { sedes, fetchSedes } = useSedeStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();
  const { user } = useAuthStore();
  
  // Extraer el ID de la sede del usuario
  const userSedeId = user?.data?.sede_id || user?.data?.sede?.id;  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    sku: '',
    tipo_producto: 'ROB', // Por defecto: Robot
    categoria_id: '',
    marca_id: '',
    stock: 0,
    stock_minimo: 0,
    precio_compra: 0,
    precio_venta: 0,
    sede_id: userSedeId || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tipos de productos disponibles
  const tiposProducto = [
    { id: 'ROB', nombre: 'Robot' },
    { id: 'REP', nombre: 'Repuesto' },
    { id: 'ACC', nombre: 'Accesorio' },
    { id: 'OTR', nombre: 'Otro' }
  ];

  useEffect(() => {
    fetchSedes();
    fetchCategories();
    fetchBrands();
  }, [fetchSedes, fetchCategories, fetchBrands]);

  // Actualizar la sede_id cuando se carga el usuario
  useEffect(() => {
    if (userSedeId) {
      setFormData(prev => ({
        ...prev,
        sede_id: userSedeId
      }));
    }
  }, [userSedeId]);

  // Generar SKU automáticamente cuando cambia el tipo de producto
  useEffect(() => {
    if (!product && formData.tipo_producto) {
      // Solo generar SKU para nuevos productos, no para ediciones
      generateSku(formData.tipo_producto);
    }
  }, [formData.tipo_producto, product, products]);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        sku: product.sku || '',
        tipo_producto: product.tipo_producto || 'ROB',
        categoria_id: product.categoria_id || '',
        marca_id: product.marca_id || '',
        stock: product.stock || 0,
        stock_minimo: product.stock_minimo || 0,
        precio_compra: product.precio_compra || 0,
        precio_venta: product.precio_venta || 0,
        sede_id: userSedeId || product.sede_id || ''
      });
    }
  }, [product, userSedeId]);

  // Función para generar el SKU automáticamente
  const generateSku = (tipoProducto) => {
    // Filtrar productos del mismo tipo
    const productosDelMismoTipo = products.filter(p => {
      const skuPrefix = p.sku ? p.sku.split('-')[0] : '';
      return skuPrefix === tipoProducto;
    });

    // Encontrar el número más alto actual
    let maxNumber = 0;
    productosDelMismoTipo.forEach(p => {
      if (p.sku) {
        const parts = p.sku.split('-');
        if (parts.length === 2) {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });

    // Generar nuevo número
    const newNumber = maxNumber + 1;
    const formattedNumber = String(newNumber).padStart(3, '0'); // Asegurar que tenga 3 dígitos (001, 002, etc.)
    const newSku = `${tipoProducto}-${formattedNumber}`;

    setFormData(prev => ({
      ...prev,
      sku: newSku
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Para el cambio de tipo de producto, actualizar el SKU
    if (name === 'tipo_producto') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name.includes('precio') || name.includes('stock') ? Number(value) : value
      }));
    }
    
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
    if (!formData.sku) newErrors.sku = 'El SKU es requerido';
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

  // Obtener el nombre de la sede actual para mostrar en el formulario
  const currentSedeName = userSedeId 
    ? sedes.find(sede => sede.id === parseInt(userSedeId))?.nombre || 'Tu sede actual'
    : 'Sede no determinada';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <div className="bg-bg-secondary p-3 rounded-lg mb-4">
        <p className="text-sm text-text-secondary">
          Este producto se creará en: <strong>{currentSedeName}</strong>
        </p>
      </div>

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
            Tipo de Producto
          </label>
          <select
            name="tipo_producto"
            value={formData.tipo_producto}
            onChange={handleChange}
            disabled={!!product} // Deshabilitar en modo edición
            className={`w-full px-3 py-2 bg-bg border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color ${
              errors.tipo_producto ? 'border-error' : 'border-border'
            } ${product ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {tiposProducto.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre} ({tipo.id})
              </option>
            ))}
          </select>
          {product && (
            <p className="mt-1 text-xs text-text-tertiary">
              El tipo de producto no se puede cambiar una vez creado.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            readOnly
            className={`w-full px-3 py-2 bg-bg-secondary border rounded-lg focus:outline-none ${
              errors.sku ? 'border-error' : 'border-border'
            } cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-text-tertiary">
            El SKU se genera automáticamente basado en el tipo de producto.
          </p>
          {errors.sku && (
            <p className="mt-1 text-sm text-error">{errors.sku}</p>
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
            Precio de Compra (€)
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
            Precio de Venta (€)
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

        {/* Campo oculto para la sede */}
        <input 
          type="hidden" 
          name="sede_id" 
          value={formData.sede_id} 
        />
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