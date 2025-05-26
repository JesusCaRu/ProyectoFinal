import { motion as _motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Printer,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  User,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVentaStore } from '../../store/ventaStore';
import { useSedeStore } from '../../store/sedeStore';
import Modal from '../../components/Modal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Funciones de utilidad
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completada':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'pendiente':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'cancelada':
      return <XCircle className="h-4 w-4 text-error" />;
    default:
      return null;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completada':
      return 'Completada';
    case 'pendiente':
      return 'Pendiente';
    case 'cancelada':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completada':
      return 'bg-success/10 text-success';
    case 'pendiente':
      return 'bg-warning/10 text-warning';
    case 'cancelada':
      return 'bg-error/10 text-error';
    default:
      return 'bg-text-tertiary/10 text-text-tertiary';
  }
};

const Facturas = () => {
  const { 
    ventas, 
    loading: isLoading, 
    error,
    fetchVentas,
    deleteVenta
  } = useVentaStore();
  const { sedes, fetchSedes } = useSedeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [ventaToView, setVentaToView] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState(null);

  useEffect(() => {
    fetchVentas();
    fetchSedes();
  }, [fetchVentas, fetchSedes]);

  const stats = [
    {
      title: 'Total Ventas',
      value: ventas.length.toString(),
      icon: <FileText className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Facturado',
      value: formatCurrency(ventas.reduce((sum, venta) => sum + Number(venta.total), 0)),
      icon: <DollarSign className="h-6 w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Ventas Pendientes',
      value: ventas.filter(venta => venta.estado === 'pendiente').length.toString(),
      icon: <Clock className="h-6 w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    }
  ];

  const filteredVentas = ventas.filter(venta => {
    const matchesSearch = 
      venta.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente?.documento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSede = !selectedSede || Number(venta.sede_id) === Number(selectedSede);
    const matchesClient = !selectedClient || Number(venta.cliente_id) === Number(selectedClient);
    const matchesStatus = !selectedStatus || venta.estado === selectedStatus;
    const matchesDateRange = (!dateRange.start || new Date(venta.fecha) >= new Date(dateRange.start)) &&
                            (!dateRange.end || new Date(venta.fecha) <= new Date(dateRange.end));
    
    return matchesSearch && matchesSede && matchesClient && matchesStatus && matchesDateRange;
  });

  const handleView = (venta) => {
    setVentaToView(venta);
    setViewModalOpen(true);
  };

  const handleDelete = (venta) => {
    setVentaToDelete(venta);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (ventaToDelete) {
      try {
        await deleteVenta(ventaToDelete.id);
        setDeleteModalOpen(false);
        setVentaToDelete(null);
      } catch (error) {
        console.error('Error al eliminar la venta:', error);
      }
    }
  };

  const handleExport = () => {
    const data = filteredVentas.map(venta => ({
      'Número': venta.numero,
      'Cliente': venta.cliente?.nombre || 'N/A',
      'Documento': venta.cliente?.documento || 'N/A',
      'Fecha': formatDate(venta.fecha),
      'Total': formatCurrency(venta.total),
      'Estado': getStatusText(venta.estado),
      'Sede': venta.sede?.nombre || 'N/A'
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `facturas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateFactura = async (ventaId) => {
    try {
      const response = await axios.get(`${API_URL}/ventas/${ventaId}/factura`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al generar factura:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Facturas de Ventas</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">
          {error}
        </div>
      )}

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

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ventas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <select
          value={selectedSede}
          onChange={(e) => setSelectedSede(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todas las sedes</option>
          {sedes.map(sede => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="pendiente">Pendiente</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => {
            setSearchTerm('');
            setSelectedSede('');
            setSelectedClient('');
            setSelectedStatus('');
            setDateRange({ start: '', end: '' });
          }}
          className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Filter className="h-5 w-5" />
          <span>Limpiar Filtros</span>
        </button>
      </div>

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Total
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-8 py-4 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-8 py-4 text-center text-text-tertiary">
                    Cargando ventas...
                  </td>
                </tr>
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-4 text-center text-text-tertiary">
                    No se encontraron ventas
                  </td>
                </tr>
              ) : (
                filteredVentas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-interactive-component rounded-lg">
                          <FileText className="h-5 w-5 text-solid-color" />
                        </div>
                        <div>
                          <div className="text-base font-medium text-accessibility-text">
                            {venta.numero}
                          </div>
                          <div className="text-sm text-text-tertiary">
                            ID: {venta.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-text-tertiary" />
                        <div>
                          <div className="text-base text-text-tertiary">
                            {venta.cliente?.nombre || 'N/A'}
                          </div>
                          <div className="text-sm text-text-tertiary">
                            {venta.cliente?.documento || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-text-tertiary" />
                        <span className="text-base text-text-tertiary">
                          {formatDate(venta.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-text-tertiary" />
                        <span className="text-base font-medium text-accessibility-text">
                          {formatCurrency(venta.total)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(venta.estado)}
                        <span className={`text-base font-medium ${getStatusColor(venta.estado)} px-3 py-1.5 rounded-full`}>
                          {getStatusText(venta.estado)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-text-tertiary" />
                        <span className="text-base text-text-tertiary">
                          {venta.sede?.nombre || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => handleView(venta)}
                          className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                          title="Ver venta"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => generateFactura(venta.id)}
                          className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                          title="Generar factura"
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                        {venta.estado === 'pendiente' && (
                          <button 
                            onClick={() => handleDelete(venta)}
                            className="p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                            title="Eliminar venta"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para ver venta */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Venta ${ventaToView?.numero}`}
        size="lg"
      >
        {ventaToView && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Cliente</h3>
                <p className="text-base text-accessibility-text">{ventaToView.cliente?.nombre}</p>
                <p className="text-sm text-text-tertiary">{ventaToView.cliente?.documento}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Fecha</h3>
                <p className="text-base text-accessibility-text">{formatDate(ventaToView.fecha)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Estado</h3>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(ventaToView.estado)}`}>
                  {getStatusIcon(ventaToView.estado)}
                  <span className="ml-2">{getStatusText(ventaToView.estado)}</span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Total</h3>
                <p className="text-xl font-semibold text-accessibility-text">{formatCurrency(ventaToView.total)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Productos</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-interactive-component">
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-tertiary">Producto</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Cantidad</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Precio</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ventaToView.detalles?.map((detalle, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-accessibility-text">{detalle.producto?.nombre}</td>
                        <td className="px-4 py-2 text-sm text-accessibility-text text-right">{detalle.cantidad}</td>
                        <td className="px-4 py-2 text-sm text-accessibility-text text-right">{formatCurrency(detalle.precio_unitario)}</td>
                        <td className="px-4 py-2 text-sm text-accessibility-text text-right">{formatCurrency(detalle.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-interactive-component/50">
                      <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Subtotal</td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                        {formatCurrency(ventaToView.subtotal)}
                      </td>
                    </tr>
                    <tr className="bg-interactive-component/50">
                      <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">IVA</td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                        {formatCurrency(ventaToView.iva)}
                      </td>
                    </tr>
                    <tr className="bg-interactive-component">
                      <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Total</td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                        {formatCurrency(ventaToView.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => generateFactura(ventaToView.id)}
                className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Printer className="h-5 w-5" />
                <span>Generar Factura</span>
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            ¿Estás seguro de que deseas eliminar la venta {ventaToDelete?.numero}?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Facturas; 