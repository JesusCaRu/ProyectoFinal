import { motion as _motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Download,
  Printer,
  Tag,
  Box,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  BarChart2,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';

const Inventario = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Robot Asistente X-2000',
      sku: 'ROB-X2000',
      category: 'Robots',
      stock: 15,
      minStock: 5,
      price: 899.99,
      status: 'in-stock',
      lastRestock: '2024-04-28'
    },
    {
      id: 2,
      name: 'Kit de Mantenimiento Premium',
      sku: 'KIT-MNT-PRM',
      category: 'Accesorios',
      stock: 8,
      minStock: 10,
      price: 149.99,
      status: 'low-stock',
      lastRestock: '2024-04-15'
    },
    {
      id: 3,
      name: 'Batería de Larga Duración',
      sku: 'BAT-LG-DUR',
      category: 'Componentes',
      stock: 0,
      minStock: 20,
      price: 79.99,
      status: 'out-of-stock',
      lastRestock: '2024-03-20'
    },
    {
      id: 4,
      name: 'Sensor de Movimiento Avanzado',
      sku: 'SNS-MOV-ADV',
      category: 'Componentes',
      stock: 25,
      minStock: 15,
      price: 49.99,
      status: 'in-stock',
      lastRestock: '2024-05-01'
    }
  ]);

  const stats = [
    {
      title: 'Productos Totales',
      value: '156',
      icon: <Package className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'En Stock',
      value: '142',
      icon: <CheckCircle className="h-6 w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Stock Bajo',
      value: '14',
      icon: <AlertCircle className="h-6 w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'low-stock':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'out-of-stock':
        return <Clock className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in-stock':
        return 'En Stock';
      case 'low-stock':
        return 'Stock Bajo';
      case 'out-of-stock':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-success/10 text-success';
      case 'low-stock':
        return 'bg-warning/10 text-warning';
      case 'out-of-stock':
        return 'bg-error/10 text-error';
      default:
        return 'bg-text-tertiary/10 text-text-tertiary';
    }
  };

  const handleEdit = (id) => {
    // Implementar lógica de edición
    console.log('Editar producto:', id);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Inventario</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Plus className="h-5 w-5" />
            <span>Nuevo Producto</span>
          </button>
          <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <BarChart2 className="h-5 w-5" />
            <span>Reportes</span>
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

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-interactive-component rounded-lg">
                        <Box className="h-5 w-5 text-solid-color" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-accessibility-text">
                          {product.name}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-text-tertiary" />
                      <span className="text-sm text-text-tertiary">{product.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-text-tertiary" />
                      <span className="text-sm text-text-tertiary">{product.stock} / {product.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-text-tertiary" />
                      <span className="text-sm text-text-tertiary">${product.price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(product.status)}
                      <span className={`text-sm font-medium ${getStatusColor(product.status)} px-2 py-1 rounded-full`}>
                        {getStatusText(product.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product.id)}
                        className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventario; 