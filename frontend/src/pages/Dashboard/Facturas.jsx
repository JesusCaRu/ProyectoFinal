import React, { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Printer,
  Eye,
  Euro,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useFacturaStore } from '../../store/facturaStore';
import { useSedeStore } from '../../store/sedeStore';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import LoadingIndicator from '../../components/LoadingIndicator';

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
  if (amount === null || amount === undefined) return '€0,00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
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

const getTipoIcon = (tipo) => {
  switch (tipo) {
    case 'venta':
      return <ShoppingCart className="h-4 w-4 text-success" />;
    case 'compra':
      return <Package className="h-4 w-4 text-warning" />;
    default:
      return <FileText className="h-4 w-4 text-text-tertiary" />;
  }
};

const getTipoText = (tipo) => {
  switch (tipo) {
    case 'venta':
      return 'Venta';
    case 'compra':
      return 'Compra';
    default:
      return 'Desconocido';
  }
};

const getTipoColor = (tipo) => {
  switch (tipo) {
    case 'venta':
      return 'bg-success/10 text-success';
    case 'compra':
      return 'bg-warning/10 text-warning';
    default:
      return 'bg-text-tertiary/10 text-text-tertiary';
  }
};

const Facturas = () => {
  const { 
    facturas, 
    loading: isLoading, 
    error,
    fetchFacturas,
    descargarFactura,
    abrirFactura
  } = useFacturaStore();
  
  const { sedes, fetchSedes } = useSedeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [facturaToView, setFacturaToView] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchFacturas({
            fecha_inicio: dateRange.start || undefined,
            fecha_fin: dateRange.end || undefined
          }),
          fetchSedes()
        ]);
      } catch (error) {
        toast.error('Error al cargar las facturas: ' + (error.message || 'Error desconocido'));
      }
    };
    
    loadData();
  }, [fetchFacturas, fetchSedes, dateRange]);

  const stats = [
    {
      title: 'Total Facturas',
      value: facturas.length.toString(),
      icon: <FileText className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Facturado',
      value: formatCurrency(facturas.reduce((sum, factura) => sum + Number(factura.total), 0)),
      icon: <Euro className="h-6 w-6 text-success" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Facturas Pendientes',
      value: facturas.filter(factura => factura.estado === 'pendiente').length.toString(),
      icon: <Clock className="h-6 w-6 text-warning" />,
      change: '-5%',
      trend: 'down'
    }
  ];

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (factura.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSede = !selectedSede || Number(factura.sede_id) === Number(selectedSede);
    const matchesTipo = !selectedTipo || factura.tipo === selectedTipo;
    const matchesStatus = !selectedStatus || factura.estado === selectedStatus;
    const matchesDateRange = (!dateRange.start || new Date(factura.fecha) >= new Date(dateRange.start)) &&
                            (!dateRange.end || new Date(factura.fecha) <= new Date(dateRange.end));
    
    return matchesSearch && matchesSede && matchesTipo && matchesStatus && matchesDateRange;
  });

  const handleView = (factura) => {
    setFacturaToView(factura);
    setViewModalOpen(true);
  };

  const handleDownload = async (factura) => {
    try {
      setIsDownloading(true);
      await descargarFactura(factura.tipo, factura.id);
      toast.success('Factura descargada correctamente');
    } catch (error) {
      toast.error('Error al descargar la factura: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPdf = async (factura) => {
    try {
      setIsPdfLoading(true);
      await abrirFactura(factura.tipo, factura.id);
    } catch (error) {
      toast.error('Error al abrir la factura: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleExport = () => {
    const data = filteredFacturas.map(factura => ({
      'Número': factura.numero,
      'Tipo': getTipoText(factura.tipo),
      'Fecha': formatDate(factura.fecha),
      'Total': formatCurrency(factura.total),
      'Estado': getStatusText(factura.estado),
      'Sede': factura.sede?.nombre || 'N/A',
      'Usuario': factura.usuario?.nombre || 'N/A'
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

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-solid-color" />
          <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Facturas</h1>
        </div>
        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
          <button 
            onClick={handleExport}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-xs sm:text-base"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">{stat.title}</h3>
            <p className="mt-1 text-base sm:text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar facturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        
        {/* Filtros para tablet/desktop */}
        <div className="hidden sm:flex sm:flex-wrap gap-2 sm:gap-4">
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          >
            <option value="">Todas las sedes</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="venta">Ventas</option>
            <option value="compra">Compras</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
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
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Filtros para móvil - Mostrar desplegables simples */}
        <div className="flex flex-wrap sm:hidden gap-2 w-full">
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color"
          >
            <option value="">Tipo</option>
            <option value="venta">Ventas</option>
            <option value="compra">Compras</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color"
          >
            <option value="">Estado</option>
            <option value="completada">Completada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex sm:hidden gap-2 w-full">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-3 py-1.5 text-xs bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color"
              placeholder="Fecha inicio"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-3 py-1.5 text-xs bg-bg border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-solid-color"
              placeholder="Fecha fin"
            />
          </div>
          
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSede('');
              setSelectedTipo('');
              setSelectedStatus('');
              setDateRange({ start: '', end: '' });
            }}
            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-colors duration-200"
          >
            <Filter className="h-3 w-3 sm:h-5 sm:w-5" />
            <span>Limpiar Filtros</span>
          </button>
        </div>
      </div>

      {/* Tabla para tablets/desktop */}
      <div className="hidden sm:block bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Total
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-3 sm:px-8 py-2 sm:py-4 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <LoadingIndicator 
                  variant="table" 
                  colSpan={7} 
                  text="Cargando facturas..."
                />
              ) : filteredFacturas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 sm:px-8 py-2 sm:py-4 text-center text-text-tertiary text-xs sm:text-sm">
                    No se encontraron facturas
                  </td>
                </tr>
              ) : (
                filteredFacturas.map((factura) => (
                  <tr key={`${factura.tipo}-${factura.id}`} className="hover:bg-interactive-component/50 transition-colors duration-200">
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-solid-color" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-base font-medium text-accessibility-text">
                            {factura.numero}
                          </div>
                          <div className="text-xs sm:text-sm text-text-tertiary">
                            ID: {factura.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {getTipoIcon(factura.tipo)}
                        <span className={`text-xs sm:text-base font-medium ${getTipoColor(factura.tipo)} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full`}>
                          {getTipoText(factura.tipo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                        <span className="text-xs sm:text-base text-text-tertiary">
                          {formatDate(factura.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                        <span className="text-xs sm:text-base font-medium text-accessibility-text">
                          {formatCurrency(factura.total)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {getStatusIcon(factura.estado)}
                        <span className={`text-xs sm:text-base font-medium ${getStatusColor(factura.estado)} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full`}>
                          {getStatusText(factura.estado)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                        <span className="text-xs sm:text-base text-text-tertiary">
                          {factura.sede?.nombre || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                        <button 
                          onClick={() => handleView(factura)}
                          className="p-1.5 sm:p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                          title="Ver factura"
                        >
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button 
                          onClick={() => handleOpenPdf(factura)}
                          className="p-1.5 sm:p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                          title="Ver PDF"
                          disabled={isPdfLoading}
                        >
                          {isPdfLoading ? (
                            <LoadingIndicator variant="button" text="Cargando PDF..." />
                          ) : (
                            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleDownload(factura)}
                          className="p-1.5 sm:p-2 text-success hover:text-success-hover rounded-lg transition-colors duration-200"
                          title="Descargar factura"
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <LoadingIndicator variant="button" text="Descargando..." />
                          ) : (
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator text="Cargando facturas..." />
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-xs">
            No se encontraron facturas
          </div>
        ) : (
          filteredFacturas.map((factura) => (
            <div 
              key={`${factura.tipo}-${factura.id}`} 
              className="bg-bg rounded-lg border border-border p-3 hover:border-solid-color/40 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-interactive-component rounded-lg">
                    <FileText className="h-4 w-4 text-solid-color" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-accessibility-text">
                      {factura.numero}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      ID: {factura.id}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(factura.estado)} px-2 py-1 rounded-full`}>
                  {getStatusText(factura.estado)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <div className="text-text-tertiary mb-1">Tipo:</div>
                  <div className="flex items-center space-x-1">
                    {getTipoIcon(factura.tipo)}
                    <span>{getTipoText(factura.tipo)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-text-tertiary mb-1">Fecha:</div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-text-tertiary" />
                    <span>{formatDate(factura.fecha)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-text-tertiary mb-1">Total:</div>
                  <div className="flex items-center space-x-1">
                    <Euro className="h-3 w-3 text-text-tertiary" />
                    <span className="font-medium">{formatCurrency(factura.total)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-text-tertiary mb-1">Sede:</div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-3 w-3 text-text-tertiary" />
                    <span>{factura.sede?.nombre || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-border pt-2">
                <button 
                  onClick={() => handleView(factura)}
                  className="p-1.5 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                  title="Ver factura"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleOpenPdf(factura)}
                  className="p-1.5 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                  title="Ver PDF"
                  disabled={isPdfLoading}
                >
                  {isPdfLoading ? (
                    <LoadingIndicator variant="button" size="sm" text="" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={() => handleDownload(factura)}
                  className="p-1.5 text-success hover:text-success-hover rounded-lg transition-colors duration-200"
                  title="Descargar factura"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <LoadingIndicator variant="button" size="sm" text="" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para ver factura */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Factura ${facturaToView?.numero}`}
        size="lg"
      >
        {facturaToView && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Tipo</h3>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getTipoColor(facturaToView.tipo)}`}>
                  {getTipoIcon(facturaToView.tipo)}
                  <span className="ml-2">{getTipoText(facturaToView.tipo)}</span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Fecha</h3>
                <p className="text-base text-accessibility-text">{formatDate(facturaToView.fecha)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Estado</h3>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(facturaToView.estado)}`}>
                  {getStatusIcon(facturaToView.estado)}
                  <span className="ml-2">{getStatusText(facturaToView.estado)}</span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Total</h3>
                <p className="text-xl font-semibold text-accessibility-text">{formatCurrency(facturaToView.total)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Sede</h3>
                <p className="text-base text-accessibility-text">{facturaToView.sede?.nombre || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-tertiary mb-1">Usuario</h3>
                <p className="text-base text-accessibility-text">{facturaToView.usuario?.nombre || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleOpenPdf(facturaToView)}
                className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200"
                disabled={isPdfLoading}
              >
                {isPdfLoading ? (
                  <LoadingIndicator variant="button" text="Cargando PDF..." />
                ) : (
                  <>
                    <Printer className="h-5 w-5" />
                    <span>Ver PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownload(facturaToView)}
                className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <LoadingIndicator variant="button" text="Descargando..." />
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Descargar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Facturas; 