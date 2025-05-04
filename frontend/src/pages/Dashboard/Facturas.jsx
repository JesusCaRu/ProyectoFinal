import { motion as _motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Facturas = () => {
  const invoices = [
    {
      id: 'FAC-001',
      customer: 'Juan Pérez',
      date: '2024-05-01',
      amount: 899.97,
      status: 'paid',
      dueDate: '2024-05-15'
    },
    {
      id: 'FAC-002',
      customer: 'María García',
      date: '2024-05-02',
      amount: 499.99,
      status: 'paid',
      dueDate: '2024-05-16'
    },
    {
      id: 'FAC-003',
      customer: 'Carlos López',
      date: '2024-05-03',
      amount: 1299.95,
      status: 'pending',
      dueDate: '2024-05-17'
    },
    {
      id: 'FAC-004',
      customer: 'Ana Martínez',
      date: '2024-05-04',
      amount: 699.98,
      status: 'overdue',
      dueDate: '2024-05-10'
    }
  ];

  const stats = [
    {
      title: 'Total Facturado',
      value: '$3,399.89',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pendiente de Pago',
      value: '$1,999.93',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Vencidas',
      value: '$699.98',
      change: '+8%',
      trend: 'up'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencida';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-text-tertiary/10 text-text-tertiary';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Facturas</h1>
        </div>
        <button className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Plus className="h-5 w-5" />
          <span>Nueva Factura</span>
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
            placeholder="Buscar facturas..."
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Calendar className="h-5 w-5" />
          <span>Filtrar por fecha</span>
        </button>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Monto
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-accessibility-text">
                      {invoice.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-tertiary">
                      {invoice.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-tertiary">
                      {invoice.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-tertiary">
                      {invoice.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-accessibility-text">
                      ${invoice.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invoice.status)}
                      <span className={`text-sm font-medium ${getStatusColor(invoice.status)} px-2 py-1 rounded-full`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                        <Printer className="h-4 w-4" />
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

export default Facturas; 