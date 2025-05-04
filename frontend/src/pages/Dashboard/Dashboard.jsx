import { motion as _motion } from 'framer-motion';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Users,
  Settings,
  FileText,
  BarChart2
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Productos en Stock',
      value: '1,234',
      icon: <Package className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Ventas Totales',
      value: '$45,678',
      icon: <DollarSign className="h-6 w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      icon: <ShoppingCart className="h-6 w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Usuarios Activos',
      value: '89',
      icon: <Users className="h-6 w-6 text-info" />,
      change: '+15%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-accessibility-text">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <_motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-accessibility-text">
              Ventas Recientes
            </h2>
            <BarChart2 className="h-5 w-5 text-solid-color" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-interactive-component rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-solid-color/10 rounded-lg">
                    <DollarSign className="h-4 w-4 text-solid-color" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-accessibility-text">Venta #{item}</p>
                    <p className="text-xs text-text-tertiary">Hace {item} hora{item !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-success">+${item * 100}</span>
              </div>
            ))}
          </div>
        </_motion.div>

        <_motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-accessibility-text">
              Actividad Reciente
            </h2>
            <TrendingUp className="h-5 w-5 text-solid-color" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-interactive-component rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-solid-color/10 rounded-lg">
                    <FileText className="h-4 w-4 text-solid-color" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-accessibility-text">Nuevo pedido #{item}</p>
                    <p className="text-xs text-text-tertiary">Usuario {item}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-info">Ver detalles</span>
              </div>
            ))}
          </div>
        </_motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 