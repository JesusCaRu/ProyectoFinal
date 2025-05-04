import { motion as _motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Building,
  Calendar,
  Edit,
  Save,
  Bell,
  Lock,
  CreditCard,
  Settings,
  LogOut,
  Star,
  ShoppingCart,
  DollarSign,
  Package
} from 'lucide-react';

const Perfil = () => {
  const user = {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+1 234 567 8901',
    address: 'Calle Principal 123, Ciudad',
    company: 'Tech Solutions Inc.',
    role: 'Administrador',
    joinDate: '2024-01-01',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=0D8ABC&color=fff'
  };

  const stats = [
    {
      title: 'Productos Vendidos',
      value: '1,234',
      icon: <Package className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Ventas Totales',
      value: '$89,999.97',
      icon: <DollarSign className="h-6 w-6 text-solid-color" />,
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Clientes Atendidos',
      value: '456',
      icon: <User className="h-6 w-6 text-solid-color" />,
      change: '+8%',
      trend: 'up'
    }
  ];

  const activities = [
    {
      date: '2024-05-01',
      time: '10:30 AM',
      action: 'Agregó un nuevo producto',
      details: 'Robot Asistente X-2000'
    },
    {
      date: '2024-05-01',
      time: '02:15 PM',
      action: 'Actualizó el inventario',
      details: 'Stock de Robot Educativo Y-1000'
    },
    {
      date: '2024-04-30',
      time: '09:45 AM',
      action: 'Generó un reporte',
      details: 'Reporte de Ventas Mensual'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <User className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Perfil</h1>
        </div>
        <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Edit className="h-5 w-5" />
          <span>Editar Perfil</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-start space-x-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full"
              />
              <button className="absolute bottom-0 right-0 p-1 bg-solid-color hover:bg-solid-color-hover text-white rounded-full transition-colors duration-200">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-accessibility-text">
                {user.name}
              </h2>
              <p className="text-sm text-text-tertiary mb-4">{user.role}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">{user.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">{user.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">
                    Miembro desde {user.joinDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </_motion.div>

        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <h2 className="text-lg font-semibold text-accessibility-text mb-6">
            Acciones Rápidas
          </h2>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Bell className="h-5 w-5" />
              <span>Notificaciones</span>
            </button>
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Lock className="h-5 w-5" />
              <span>Seguridad</span>
            </button>
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <CreditCard className="h-5 w-5" />
              <span>Pagos</span>
            </button>
            <button className="w-full px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </button>
            <button className="w-full px-4 py-2 bg-error hover:bg-error-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </_motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="bg-bg rounded-xl shadow-md p-6 border border-border">
        <h2 className="text-xl font-semibold text-accessibility-text mb-6">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <_motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 bg-interactive-component rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-solid-color rounded-full mt-2" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-accessibility-text">
                    {activity.action}
                  </p>
                  <span className="text-xs text-text-tertiary">
                    {activity.date} {activity.time}
                  </span>
                </div>
                <p className="text-sm text-text-tertiary mt-1">
                  {activity.details}
                </p>
              </div>
            </_motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Perfil; 