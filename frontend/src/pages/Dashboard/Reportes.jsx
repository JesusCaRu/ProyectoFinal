import { motion as _motion } from 'framer-motion';
import { 
  BarChart2, 
  PieChart, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart
} from 'lucide-react';

const Reportes = () => {
  const salesData = [
    { month: 'Ene', sales: 12000, purchases: 8000 },
    { month: 'Feb', sales: 15000, purchases: 9000 },
    { month: 'Mar', sales: 18000, purchases: 10000 },
    { month: 'Abr', sales: 14000, purchases: 8500 },
    { month: 'May', sales: 16000, purchases: 9500 },
    { month: 'Jun', sales: 20000, purchases: 11000 }
  ];

  const categoryData = [
    { name: 'Asistentes', value: 35, color: 'bg-solid-color' },
    { name: 'Educación', value: 25, color: 'bg-success' },
    { name: 'Hogar', value: 20, color: 'bg-warning' },
    { name: 'Industrial', value: 15, color: 'bg-info' },
    { name: 'Otros', value: 5, color: 'bg-error' }
  ];

  const stats = [
    {
      title: 'Ventas Totales',
      value: '$95,000',
      change: '+12%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6 text-success" />
    },
    {
      title: 'Productos Vendidos',
      value: '1,234',
      change: '+8%',
      trend: 'up',
      icon: <Package className="h-6 w-6 text-info" />
    },
    {
      title: 'Compras Totales',
      value: '$56,000',
      change: '+15%',
      trend: 'up',
      icon: <ShoppingCart className="h-6 w-6 text-warning" />
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BarChart2 className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Reportes</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Calendar className="h-5 w-5" />
            <span>Seleccionar Período</span>
          </button>
          <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Download className="h-5 w-5" />
            <span>Exportar</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <_motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <h2 className="text-lg font-semibold text-accessibility-text mb-4">
            Ventas vs Compras
          </h2>
          <div className="h-64">
            <div className="flex items-end h-full space-x-2">
              {salesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex space-x-1">
                    <div 
                      className="w-1/2 bg-solid-color rounded-t-lg"
                      style={{ height: `${(data.sales / 20000) * 100}%` }}
                    />
                    <div 
                      className="w-1/2 bg-success rounded-t-lg"
                      style={{ height: `${(data.purchases / 20000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-tertiary mt-2">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-solid-color rounded-full" />
              <span className="text-sm text-text-tertiary">Ventas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="text-sm text-text-tertiary">Compras</span>
            </div>
          </div>
        </_motion.div>

        <_motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-bg rounded-xl shadow-md p-6 border border-border"
        >
          <h2 className="text-lg font-semibold text-accessibility-text mb-4">
            Ventas por Categoría
          </h2>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48 relative">
              {categoryData.map((category, index) => {
                const startAngle = index === 0 ? 0 : 
                  categoryData.slice(0, index).reduce((acc, curr) => acc + curr.value, 0) * 3.6;
                const endAngle = startAngle + category.value * 3.6;
                
                return (
                  <div
                    key={index}
                    className={`absolute w-full h-full rounded-full ${category.color}`}
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${category.color} rounded-full`} />
                <span className="text-sm text-text-tertiary">{category.name}</span>
                <span className="text-sm font-medium text-accessibility-text">
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </_motion.div>
      </div>
    </div>
  );
};

export default Reportes; 