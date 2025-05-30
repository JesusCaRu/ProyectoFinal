import { motion as _motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Star,
  ShoppingCart,
  Euro
} from 'lucide-react';

const Clientes = () => {
  const customers = [
    {
      id: 'C001',
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+1 234 567 8901',
      address: 'Calle Principal 123, Ciudad',
      company: 'Tech Solutions Inc.',
      purchases: 12,
      totalSpent: 8999.97,
      rating: 4.5
    },
    {
      id: 'C002',
      name: 'María García',
      email: 'maria.garcia@email.com',
      phone: '+1 234 567 8902',
      address: 'Avenida Central 456, Ciudad',
      company: 'Innovation Labs',
      purchases: 8,
      totalSpent: 5999.98,
      rating: 4.8
    },
    {
      id: 'C003',
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+1 234 567 8903',
      address: 'Boulevard Norte 789, Ciudad',
      company: 'Digital Systems',
      purchases: 15,
      totalSpent: 12999.95,
      rating: 4.2
    },
    {
      id: 'C004',
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+1 234 567 8904',
      address: 'Plaza Sur 101, Ciudad',
      company: 'Future Tech',
      purchases: 6,
      totalSpent: 3999.99,
      rating: 4.7
    }
  ];

  const stats = [
    {
      title: 'Clientes Totales',
      value: '1,234',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Compras Promedio',
      value: '8.5',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Valor Promedio',
      value: '€7.499,97',
      change: '+8%',
      trend: 'up'
    }
  ];

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Clientes</h1>
        </div>
        <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Plus className="h-5 w-5" />
          <span>Nuevo Cliente</span>
        </button>
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
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-error" />
                )}
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

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {customers.map((customer) => (
          <_motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-interactive-component rounded-lg">
                  <User className="h-6 w-6 text-solid-color" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-accessibility-text">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-text-tertiary">{customer.company}</p>
                </div>
              </div>
              <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{customer.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <ShoppingCart className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-accessibility-text mt-1">
                    {customer.purchases}
                  </span>
                  <span className="text-xs text-text-tertiary">Compras</span>
                </div>
                <div className="flex flex-col items-center">
                  <Euro className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-accessibility-text mt-1">
                    €{customer.totalSpent.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                  <span className="text-xs text-text-tertiary">Total</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className={`h-4 w-4 ${getRatingColor(customer.rating)}`} />
                  <span className={`text-sm font-medium ${getRatingColor(customer.rating)} mt-1`}>
                    {customer.rating}
                  </span>
                  <span className="text-xs text-text-tertiary">Rating</span>
                </div>
              </div>
            </div>
          </_motion.div>
        ))}
      </div>
    </div>
  );
};

export default Clientes; 