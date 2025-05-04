import { motion as _motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  Archive,
  Settings,
  Mail,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useState } from 'react';

const Notificaciones = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Pedido Completado',
      message: 'El pedido #ORD-1234 ha sido completado exitosamente',
      time: 'Hace 5 minutos',
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Stock Bajo',
      message: 'El producto "Robot Asistente X-2000" tiene stock bajo',
      time: 'Hace 1 hora',
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Nuevo Cliente',
      message: 'Se ha registrado un nuevo cliente: María García',
      time: 'Hace 2 horas',
      icon: <Info className="h-5 w-5 text-info" />,
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Error en Pago',
      message: 'Error al procesar el pago del pedido #ORD-1235',
      time: 'Hace 3 horas',
      icon: <X className="h-5 w-5 text-error" />,
      read: false
    },
    {
      id: 5,
      type: 'pending',
      title: 'Pedido Pendiente',
      message: 'El pedido #ORD-1236 está pendiente de aprobación',
      time: 'Hace 5 horas',
      icon: <Clock className="h-5 w-5 text-warning" />,
      read: true
    }
  ]);

  const stats = [
    {
      title: 'Total',
      value: '156',
      icon: <Bell className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'No Leídas',
      value: '3',
      icon: <Mail className="h-6 w-6 text-solid-color" />,
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Hoy',
      value: '8',
      icon: <Clock className="h-6 w-6 text-solid-color" />,
      change: '+15%',
      trend: 'up'
    }
  ];

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'info':
        return 'bg-info/10 text-info';
      case 'error':
        return 'bg-error/10 text-error';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-text-tertiary/10 text-text-tertiary';
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleArchiveAll = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bell className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Notificaciones</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Filter className="h-5 w-5" />
            <span>Filtrar</span>
          </button>
          <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Settings className="h-5 w-5" />
            <span>Configurar</span>
          </button>
        </div>
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

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                filter === 'all' 
                  ? 'bg-solid-color text-white' 
                  : 'bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text'
              }`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                filter === 'unread' 
                  ? 'bg-solid-color text-white' 
                  : 'bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text'
              }`}
            >
              No Leídas
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                filter === 'read' 
                  ? 'bg-solid-color text-white' 
                  : 'bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text'
              }`}
            >
              Leídas
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleArchiveAll}
              className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
            >
              <Archive className="h-5 w-5" />
            </button>
            <button 
              onClick={handleDeleteAll}
              className="p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredNotifications.map((notification) => (
            <_motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 flex items-start space-x-4 ${
                !notification.read ? 'bg-interactive-component/50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {notification.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-text-tertiary">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-text-tertiary mt-1">
                  {notification.message}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-2">
                {!notification.read && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notification.id)}
                  className="p-1 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </_motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notificaciones; 