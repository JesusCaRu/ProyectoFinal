import { motion as _motion } from 'framer-motion';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Building,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Proveedores = () => {
  const suppliers = [
    {
      id: 'P001',
      name: 'RobotTech Solutions',
      email: 'contact@robottech.com',
      phone: '+1 234 567 8901',
      address: 'Calle Industrial 123, Ciudad',
      products: 25,
      orders: 12,
      totalSpent: 8999.97,
      status: 'active',
      lastOrder: '2024-05-01'
    },
    {
      id: 'P002',
      name: 'Future Robotics',
      email: 'sales@futurerobotics.com',
      phone: '+1 234 567 8902',
      address: 'Avenida Tecnológica 456, Ciudad',
      products: 18,
      orders: 8,
      totalSpent: 5999.98,
      status: 'active',
      lastOrder: '2024-05-02'
    },
    {
      id: 'P003',
      name: 'AI Systems Corp',
      email: 'info@aisystems.com',
      phone: '+1 234 567 8903',
      address: 'Boulevard Digital 789, Ciudad',
      products: 30,
      orders: 15,
      totalSpent: 12999.95,
      status: 'pending',
      lastOrder: '2024-05-03'
    },
    {
      id: 'P004',
      name: 'Smart Machines Inc',
      email: 'support@smartmachines.com',
      phone: '+1 234 567 8904',
      address: 'Plaza Innovación 101, Ciudad',
      products: 15,
      orders: 6,
      totalSpent: 3999.99,
      status: 'inactive',
      lastOrder: '2024-04-15'
    }
  ];

  const stats = [
    {
      title: 'Proveedores Activos',
      value: '45',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Productos Totales',
      value: '1,234',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pedidos Mensuales',
      value: '156',
      change: '+15%',
      trend: 'up'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'inactive':
        return 'bg-error/10 text-error';
      default:
        return 'bg-text-tertiary/10 text-text-tertiary';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Truck className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Proveedores</h1>
        </div>
        <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Plus className="h-5 w-5" />
          <span>Nuevo Proveedor</span>
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
            placeholder="Buscar proveedores..."
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {suppliers.map((supplier) => (
          <_motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-interactive-component rounded-lg">
                  <Building className="h-6 w-6 text-solid-color" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-accessibility-text">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(supplier.status)}
                    <span className={`text-sm font-medium ${getStatusColor(supplier.status)} px-2 py-1 rounded-full`}>
                      {getStatusText(supplier.status)}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{supplier.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{supplier.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">{supplier.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <Package className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-accessibility-text mt-1">
                    {supplier.products}
                  </span>
                  <span className="text-xs text-text-tertiary">Productos</span>
                </div>
                <div className="flex flex-col items-center">
                  <DollarSign className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-accessibility-text mt-1">
                    ${supplier.totalSpent.toFixed(2)}
                  </span>
                  <span className="text-xs text-text-tertiary">Total</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-accessibility-text mt-1">
                    {supplier.lastOrder}
                  </span>
                  <span className="text-xs text-text-tertiary">Último Pedido</span>
                </div>
              </div>
            </div>
          </_motion.div>
        ))}
      </div>
    </div>
  );
};

export default Proveedores; 