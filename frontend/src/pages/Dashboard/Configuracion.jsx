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

const Configuracion = () => {
  const sections = [
    {
      title: 'Perfil',
      icon: <User className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Nombre',
          value: 'Juan Pérez',
          type: 'text'
        },
        {
          label: 'Correo Electrónico',
          value: 'juan.perez@email.com',
          type: 'email'
        },
        {
          label: 'Teléfono',
          value: '+1 234 567 8901',
          type: 'tel'
        }
      ]
    },
    {
      title: 'Seguridad',
      icon: <Lock className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Contraseña Actual',
          value: '********',
          type: 'password'
        },
        {
          label: 'Nueva Contraseña',
          value: '',
          type: 'password'
        },
        {
          label: 'Confirmar Contraseña',
          value: '',
          type: 'password'
        }
      ]
    },
    {
      title: 'Notificaciones',
      icon: <Bell className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Notificaciones por Email',
          value: true,
          type: 'toggle'
        },
        {
          label: 'Notificaciones Push',
          value: true,
          type: 'toggle'
        },
        {
          label: 'Recordatorios de Stock',
          value: true,
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Pago',
      icon: <CreditCard className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Método de Pago',
          value: 'Tarjeta de Crédito',
          type: 'select',
          options: ['Tarjeta de Crédito', 'PayPal', 'Transferencia Bancaria']
        },
        {
          label: 'Moneda',
          value: 'USD',
          type: 'select',
          options: ['USD', 'EUR', 'MXN']
        }
      ]
    },
    {
      title: 'Idioma y Región',
      icon: <Globe className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Idioma',
          value: 'Español',
          type: 'select',
          options: ['Español', 'English', 'Français']
        },
        {
          label: 'Zona Horaria',
          value: 'UTC-6',
          type: 'select',
          options: ['UTC-6', 'UTC-5', 'UTC-4']
        }
      ]
    },
    {
      title: 'Apariencia',
      icon: <Palette className="h-5 w-5 text-solid-color" />,
      items: [
        {
          label: 'Tema',
          value: 'Claro',
          type: 'select',
          options: ['Claro', 'Oscuro', 'Sistema']
        },
        {
          label: 'Densidad',
          value: 'Normal',
          type: 'select',
          options: ['Compacto', 'Normal', 'Espacioso']
        }
      ]
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
        <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Save className="h-5 w-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border"
          >
            <div className="flex items-center space-x-3 mb-4">
              {section.icon}
              <h2 className="text-lg font-semibold text-accessibility-text">
                {section.title}
              </h2>
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
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
                      defaultValue={item.value}
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
                      defaultValue={item.value}
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
            <button className="w-full px-4 py-2 bg-error hover:bg-error-hover text-white rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
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