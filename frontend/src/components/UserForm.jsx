import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useSedeStore } from '../store/sedeStore';
import { Shield, Building } from 'lucide-react';

const UserForm = ({ user = null, onClose }) => {
  const { createUser, updateUser, cambiarEstado } = useUserStore();
  const { sedes, fetchSedes } = useSedeStore();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: 2,
    sede_id: 1,
    activo: 1
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSedes();
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '',
        rol_id: user.rol_id || 2,
        sede_id: user.sede_id || 1,
        activo: user.activo ?? 1
      });
    }
  }, [user, fetchSedes]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!user && !formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const dataToSubmit = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol_id: parseInt(formData.rol_id),
        sede_id: parseInt(formData.sede_id)
      };

      // Si es edición y no hay contraseña, no la enviamos
      if (user && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      console.log('Enviando datos:', dataToSubmit);

      if (user) {
        await updateUser(user.id, dataToSubmit);
      } else {
        await createUser(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setErrors({
        general: error.response?.data?.message || 'Error al procesar la solicitud'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstadoChange = async (e) => {
    const newEstado = e.target.checked ? 1 : 0;
    try {
      setIsLoading(true);
      await cambiarEstado(user.id, newEstado);
      setFormData(prev => ({ ...prev, activo: newEstado }));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setErrors({
        general: error.response?.data?.message || 'Error al cambiar el estado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-accessibility-text">
          Nombre
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent ${
            errors.nombre ? 'border-red-500' : ''
          }`}
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-accessibility-text">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent ${
            errors.email ? 'border-red-500' : ''
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-accessibility-text">
          Contraseña {user && '(dejar en blanco para mantener)'}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!user}
          className={`mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent ${
            errors.password ? 'border-red-500' : ''
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="rol_id" className="block text-sm font-medium text-accessibility-text">
          Rol
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Shield className="h-5 w-5 text-text-tertiary" />
          </div>
          <select
            id="rol_id"
            name="rol_id"
            value={formData.rol_id}
            onChange={handleChange}
            required
            className={`block w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent ${
              errors.rol_id ? 'border-red-500' : ''
            }`}
          >
            <option value="1">Administrador</option>
            <option value="2">Vendedor</option>
            <option value="3">Almacén</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="sede_id" className="block text-sm font-medium text-accessibility-text">
          Sede
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-text-tertiary" />
          </div>
          <select
            id="sede_id"
            name="sede_id"
            value={formData.sede_id}
            onChange={handleChange}
            required
            className={`block w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent ${
              errors.sede_id ? 'border-red-500' : ''
            }`}
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {user && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo === 1}
            onChange={handleEstadoChange}
            disabled={isLoading}
            className="h-4 w-4 rounded border-border text-solid-color focus:ring-solid-color disabled:opacity-50"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-accessibility-text">
            Usuario Activo
          </label>
        </div>
      )}

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
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-solid-color hover:bg-solid-color-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default UserForm; 