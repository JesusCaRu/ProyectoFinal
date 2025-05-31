import { motion as _motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  User, 
  Lock,
  Database,
  Shield,
  HelpCircle,
  LogOut,
  BookOpen,
  FileText,
  Mail,
  Phone,
  Monitor,
  Coffee,
  Star,
  Download,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const Configuracion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { userData, logout } = useAuthStore();
  const [formData, setFormData] = useState({
    perfil: {
      nombre: '',
      email: ''
    },
    seguridad: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Cargar el perfil del usuario actual
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar userData del store de autenticación en lugar de hacer una llamada API
      if (userData) {
        setFormData(prev => ({
          ...prev,
          perfil: {
            nombre: userData.nombre || '',
            email: userData.email || ''
          }
        }));
      }
    } catch (error) {
      setError(error.message || 'Error al cargar el perfil');
      toast.error('Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Mostrar mensaje de éxito con efecto de desaparición
  const showSuccessMessage = (message) => {
    setSuccess(message);
    toast.success(message);
    
    // Limpiar el mensaje después de 4 segundos
    setTimeout(() => {
      setSuccess(null);
    }, 4000);
  };

  const handleSubmit = async (section) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      if (section === 'seguridad') {
        if (formData.seguridad.newPassword !== formData.seguridad.confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        
        if (formData.seguridad.newPassword.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        
        // Usar el servicio userService para actualizar la contraseña
        await userService.updatePassword({
          current_password: formData.seguridad.currentPassword,
          password: formData.seguridad.newPassword,
          password_confirmation: formData.seguridad.confirmPassword
        });
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Contraseña actualizada correctamente');
        
        // Limpiar campos
        setFormData(prev => ({
          ...prev,
          seguridad: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      } else if (section === 'perfil') {
        if (!formData.perfil.nombre || !formData.perfil.email) {
          toast.error('El nombre y el correo electrónico son obligatorios');
          return;
        }
        
        // Usar el servicio userService para actualizar el perfil
        await userService.updateProfile({
          nombre: formData.perfil.nombre,
          email: formData.perfil.email
        });
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Perfil actualizado correctamente');
      }
    } catch (error) {
      setError(error.message || 'Error al actualizar la configuración');
      toast.error(error.message || 'Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
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
          value: formData.perfil.nombre || '',
          type: 'text',
          placeholder: 'Tu nombre completo',
          required: true,
          onChange: (e) => handleChange('perfil', 'nombre', e.target.value)
        },
        {
          label: 'Correo Electrónico',
          value: formData.perfil.email || '',
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          required: true,
          onChange: (e) => handleChange('perfil', 'email', e.target.value)
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
          placeholder: 'Ingresa tu contraseña actual',
          required: true,
          onChange: (e) => handleChange('seguridad', 'currentPassword', e.target.value)
        },
        {
          label: 'Nueva Contraseña',
          value: formData.seguridad.newPassword,
          type: 'password',
          placeholder: 'Mínimo 6 caracteres',
          required: true,
          onChange: (e) => handleChange('seguridad', 'newPassword', e.target.value)
        },
        {
          label: 'Confirmar Contraseña',
          value: formData.seguridad.confirmPassword,
          type: 'password',
          placeholder: 'Confirma tu nueva contraseña',
          required: true,
          onChange: (e) => handleChange('seguridad', 'confirmPassword', e.target.value)
        }
      ],
      onSubmit: () => handleSubmit('seguridad')
    }
  ];

  const systemInfo = [
    {
      label: 'Versión',
      value: '1.0.0'
    },
    {
      label: 'Última Actualización',
      value: new Date().toLocaleDateString()
    },
    {
      label: 'Base de Datos',
      value: 'MySQL 8.0'
    }
  ];
  
  const helpArticles = [
    {
      title: 'Primeros pasos con StockFlow',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Aprende lo básico para comenzar a utilizar la plataforma de manera efectiva.'
    },
    {
      title: 'Gestión de inventario',
      icon: <Database className="h-5 w-5" />,
      description: 'Cómo realizar un seguimiento eficiente de tus productos y existencias.'
    },
    {
      title: 'Transferencias entre sedes',
      icon: <FileText className="h-5 w-5" />,
      description: 'Guía para gestionar movimientos de inventario entre diferentes ubicaciones.'
    },
    {
      title: 'Gestión de compras y ventas',
      icon: <Star className="h-5 w-5" />,
      description: 'Procedimientos para registrar y dar seguimiento a transacciones comerciales.'
    }
  ];
  
  const quickLinks = [
    {
      title: 'Contactar Soporte',
      icon: <Mail className="h-5 w-5" />,
      description: 'Envía un correo a nuestro equipo de soporte para resolver dudas.'
    },
    {
      title: 'Ayuda telefónica',
      icon: <Phone className="h-5 w-5" />,
      description: 'Llama a nuestro centro de atención al cliente: 01-800-123-4567'
    },
    {
      title: 'Tutoriales en video',
      icon: <Monitor className="h-5 w-5" />,
      description: 'Visualiza guías paso a paso para sacar el máximo provecho.'
    },
    {
      title: 'Actualizaciones',
      icon: <Download className="h-5 w-5" />,
      description: 'Revisa las novedades y mejoras más recientes del sistema.'
    }
  ];

  return (
    <div className="h-screen overflow-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-solid-color/10 rounded-full">
            <Settings className="h-7 w-7 text-solid-color" />
          </div>
          <h1 className="text-2xl font-bold text-accessibility-text">Configuración</h1>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <_motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-8 bg-green-100 border border-green-600 text-green-700 px-4 py-3 rounded-lg flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          <span>{success}</span>
        </_motion.div>
      )}

      <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-10rem)]">
        {/* Sección principal - 2/3 del ancho */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Tarjetas de configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <_motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-bg rounded-xl shadow-md p-6 border border-border hover:border-solid-color/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-solid-color/10 rounded-lg">
                      {section.icon}
                    </div>
                    <h2 className="text-lg font-semibold text-accessibility-text">
                      {section.title}
                    </h2>
                  </div>
                  <button
                    onClick={section.onSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-5">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <label className="text-sm font-medium text-text-tertiary flex items-center">
                        {item.label}
                        {item.required && <span className="text-error ml-1">*</span>}
                      </label>
                      <input
                        type={item.type}
                        value={item.value}
                        onChange={item.onChange}
                        placeholder={item.placeholder}
                        className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent transition-all"
                      />
                    </div>
                  ))}
                </div>
              </_motion.div>
            ))}
          </div>
          
          {/* Sección de ayuda y soporte */}
          <_motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border hover:border-solid-color/40 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-solid-color/10 rounded-lg">
                <HelpCircle className="h-5 w-5 text-solid-color" />
              </div>
              <h2 className="text-lg font-semibold text-accessibility-text">
                Centro de Ayuda
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpArticles.map((article, index) => (
                <div 
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-solid-color/10 rounded-lg text-solid-color shrink-0">
                      {article.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-accessibility-text mb-1">{article.title}</h3>
                      <p className="text-sm text-text-tertiary">{article.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </_motion.div>
        </div>
        
        {/* Sidebar - 1/3 del ancho */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Panel de información del sistema */}
          <_motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border hover:border-solid-color/40 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-solid-color/10 rounded-lg">
                <Database className="h-5 w-5 text-solid-color" />
              </div>
              <h2 className="text-lg font-semibold text-accessibility-text">
                Información del Sistema
              </h2>
            </div>
            <div className="space-y-4">
              {systemInfo.map((info, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-text-tertiary">{info.label}</span>
                  <span className="text-sm font-medium text-accessibility-text">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </_motion.div>
          
          {/* Enlaces rápidos */}
          <_motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border hover:border-solid-color/40 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-solid-color/10 rounded-lg">
                <Coffee className="h-5 w-5 text-solid-color" />
              </div>
              <h2 className="text-lg font-semibold text-accessibility-text">
                Enlaces Rápidos
              </h2>
            </div>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <div 
                  key={index} 
                  className="p-3 border border-border rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-solid-color/10 rounded-lg text-solid-color shrink-0">
                      {link.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-accessibility-text text-sm">{link.title}</h3>
                      <p className="text-xs text-text-tertiary mt-0.5">{link.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full mt-3 px-4 py-3 bg-error/10 hover:bg-error/20 text-error rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </_motion.div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 