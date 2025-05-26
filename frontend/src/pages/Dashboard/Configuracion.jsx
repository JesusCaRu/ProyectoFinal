import { motion as _motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  User, 
  Lock,
  Bell,
  CreditCard,
  Globe,
  Palette,
  Database,
  Shield,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useConfigStore from '../../store/configStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const Configuracion = () => {
  const { config, fetchConfig, updateConfig, updatePassword, isLoading, error } = useConfigStore();
  const { logout } = useAuthStore();
  const [formData, setFormData] = useState({
    perfil: {
      nombre: '',
      email: '',
      telefono: ''
    },
    seguridad: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    notificaciones: {
      notificaciones_email: true,
      notificaciones_push: true,
      recordatorios_stock: true
    },
    pago: {
      metodo_pago: 'Tarjeta de Crédito',
      moneda: 'MXN'
    },
    idioma: {
      idioma: 'Español',
      zona_horaria: 'UTC-6'
    },
    apariencia: {
      tema: 'Claro',
      densidad: 'Normal'
    }
  });

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        perfil: config.perfil || prev.perfil,
        notificaciones: config.seguridad || prev.notificaciones,
        pago: config.pago || prev.pago,
        idioma: config.idioma || prev.idioma,
        apariencia: config.apariencia || prev.apariencia
      }));
    }
  }, [config]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (section) => {
    try {
      if (section === 'seguridad') {
        if (formData.seguridad.newPassword !== formData.seguridad.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        const success = await updatePassword(
          formData.seguridad.currentPassword,
          formData.seguridad.newPassword
        );
        if (success) {
          toast.success('Contraseña actualizada correctamente');
          setFormData(prev => ({
            ...prev,
            seguridad: {
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
          }));
        }
      } else {
        const success = await updateConfig(section, formData[section]);
        if (success) {
          toast.success('Configuración actualizada correctamente');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar la configuración');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const sections = [
    {
      title: 'Perfil',
      icon: <User className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Nombre',
          value: formData.perfil.nombre,
          type: 'text',
          onChange: (e) => handleChange('perfil', 'nombre', e.target.value)
        },
        {
          label: 'Correo Electrónico',
          value: formData.perfil.email,
          type: 'email',
          onChange: (e) => handleChange('perfil', 'email', e.target.value)
        },
        {
          label: 'Teléfono',
          value: formData.perfil.telefono,
          type: 'tel',
          onChange: (e) => handleChange('perfil', 'telefono', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('perfil')
    },
    {
      title: 'Seguridad',
      icon: <Lock className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Contraseña Actual',
          value: formData.seguridad.currentPassword,
          type: 'password',
          onChange: (e) => handleChange('seguridad', 'currentPassword', e.target.value)
        },
        {
          label: 'Nueva Contraseña',
          value: formData.seguridad.newPassword,
          type: 'password',
          onChange: (e) => handleChange('seguridad', 'newPassword', e.target.value)
        },
        {
          label: 'Confirmar Contraseña',
          value: formData.seguridad.confirmPassword,
          type: 'password',
          onChange: (e) => handleChange('seguridad', 'confirmPassword', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('seguridad')
    },
    {
      title: 'Notificaciones',
      icon: <Bell className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Notificaciones por Email',
          value: formData.notificaciones.notificaciones_email,
          type: 'toggle',
          onChange: (value) => handleChange('notificaciones', 'notificaciones_email', value)
        },
        {
          label: 'Notificaciones Push',
          value: formData.notificaciones.notificaciones_push,
          type: 'toggle',
          onChange: (value) => handleChange('notificaciones', 'notificaciones_push', value)
        },
        {
          label: 'Recordatorios de Stock',
          value: formData.notificaciones.recordatorios_stock,
          type: 'toggle',
          onChange: (value) => handleChange('notificaciones', 'recordatorios_stock', value)
        }
      ],
      onSubmit: () => handleSubmit('seguridad')
    },
    {
      title: 'Pago',
      icon: <CreditCard className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Método de Pago',
          value: formData.pago.metodo_pago,
          type: 'select',
          options: ['Tarjeta de Crédito', 'PayPal', 'Transferencia Bancaria'],
          onChange: (e) => handleChange('pago', 'metodo_pago', e.target.value)
        },
        {
          label: 'Moneda',
          value: formData.pago.moneda,
          type: 'select',
          options: ['MXN', 'USD', 'EUR'],
          onChange: (e) => handleChange('pago', 'moneda', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('pago')
    },
    {
      title: 'Idioma y Región',
      icon: <Globe className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Idioma',
          value: formData.idioma.idioma,
          type: 'select',
          options: ['Español', 'English', 'Français'],
          onChange: (e) => handleChange('idioma', 'idioma', e.target.value)
        },
        {
          label: 'Zona Horaria',
          value: formData.idioma.zona_horaria,
          type: 'select',
          options: ['UTC-6', 'UTC-5', 'UTC-4'],
          onChange: (e) => handleChange('idioma', 'zona_horaria', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('idioma')
    },
    {
      title: 'Apariencia',
      icon: <Palette className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Tema',
          value: formData.apariencia.tema,
          type: 'select',
          options: ['Claro', 'Oscuro', 'Sistema'],
          onChange: (e) => handleChange('apariencia', 'tema', e.target.value)
        },
        {
          label: 'Densidad',
          value: formData.apariencia.densidad,
          type: 'select',
          options: ['Compacto', 'Normal', 'Espacioso'],
          onChange: (e) => handleChange('apariencia', 'densidad', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('apariencia')
    }
  ];

  const systemInfo = [
    {
      label: 'Versión',
      value: '1.0.0'
    },
    {
      label: 'Última Actualización',
      value: '2024-05-01'
    },
    {
      label: 'Base de Datos',
      value: 'PostgreSQL 14'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Settings className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Configuración</h1>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {section.icon}
                <h2 className="text-lg font-semibold text-accessibility-text">
                  {section.title}
                </h2>
              </div>
              <button
                onClick={section.onSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>Guardar</span>
              </button>
            </div>
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-2">
                  <label className="text-sm font-medium text-text-tertiary">
                    {item.label}
                  </label>
                  {item.type === 'toggle' ? (
                    <div className="flex items-center">
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          item.value ? 'bg-success' : 'bg-text-tertiary'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ) : item.type === 'select' ? (
                    <select
                      value={item.value}
                      onChange={item.onChange}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    >
                      {item.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={item.type}
                      value={item.value}
                      onChange={item.onChange}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
          </_motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-5 w-5 text-solid-color" />
            <h2 className="text-lg font-semibold text-accessibility-text">
              Sistema
            </h2>
          </div>
          <div className="space-y-4">
            {systemInfo.map((info, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-text-tertiary">{info.label}</span>
                <span className="text-sm font-medium text-accessibility-text">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </_motion.div>

        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-solid-color" />
            <h2 className="text-lg font-semibold text-accessibility-text">
              Privacidad
            </h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
              <Shield className="h-5 w-5" />
              <span>Política de Privacidad</span>
            </button>
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
              <HelpCircle className="h-5 w-5" />
              <span>Centro de Ayuda</span>
            </button>
          </div>
        </_motion.div>

        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-center space-x-3 mb-4">
            <LogOut className="h-5 w-5 text-solid-color" />
            <h2 className="text-lg font-semibold text-accessibility-text">
              Sesión
            </h2>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-error hover:bg-error-hover text-white rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </_motion.div>
      </div>
    </div>
  );
};

export default Configuracion; 