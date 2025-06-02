import { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { 
  Building2, 
  Package, 
  MessageSquare, 
  ArrowRightLeft,
  Search,
  Filter,
  Download,
  Printer,
  Check,
  AlertCircle,
  Menu
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSedeStore } from '../../store/sedeStore';
import { useProductStore } from '../../store/productStore';
import { useTransferenciaStore } from '../../store/transferenciaStore';
import { useAuthStore } from '../../store/authStore';

const Sedes = () => {
  const { sedes, isLoading, error, fetchSedes } = useSedeStore();
  const { products, loadProducts } = useProductStore();
  const { 
    createTransferencia, 
    updateTransferencia, 
    transferencias, 
    fetchTransferencias,
    isLoading: isTransferLoading,
    error: transferError 
  } = useTransferenciaStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    origen: '',
    destino: '',
    producto: '',
    cantidad: ''
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Obtener la sede del usuario actual
  const currentUserSedeId = user?.data?.sede_id;

  useEffect(() => {
    fetchSedes();
    loadProducts();
    fetchTransferencias();
  }, [fetchSedes, loadProducts, fetchTransferencias]);

  // Calcular el stock total de una sede
  const getStockTotal = (sedeId) => {
    return products.reduce((sum, product) => {
      const sede = product.sedes?.find(s => s.id === sedeId);
      return sum + (sede?.pivot?.stock || 0);
    }, 0);
  };

  // Calcular el inventario total de todas las sedes
  const totalInventario = sedes.reduce((sum, sede) => sum + getStockTotal(sede.id), 0);

  // Estadísticas
  const stats = [
    {
      title: 'Total de Sedes',
      value: sedes.length,
      icon: <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-solid-color" />,
      trend: 'up',
      change: '+2'
    },
    {
      title: 'Total de Inventario',
      value: totalInventario.toLocaleString(),
      icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 text-solid-color" />,
      trend: 'up',
      change: '+5%'
    },
    {
      title: 'Transferencias Pendientes',
      value: '3',
      icon: <ArrowRightLeft className="h-5 w-5 sm:h-6 sm:w-6 text-solid-color" />,
      trend: 'down',
      change: '-2'
    }
  ];

  // Obtener transferencias pendientes para una sede
  const getTransferenciasPendientes = (sedeId) => {
    return transferencias.filter(t => 
      // Solo mostrar transferencias donde esta sede es el destino
      t.sede_destino_id === sedeId && t.estado === 'pendiente'
    );
  };

  // Manejar aceptación de transferencia
  const handleAceptarTransferencia = async (transferenciaId) => {
    try {
      // Verificar que el usuario pertenece a la sede destino
      const transferencia = transferencias.find(t => t.id === transferenciaId);
      
      if (!transferencia) {
        toast.error('Transferencia no encontrada');
        return;
      }
      
      if (currentUserSedeId !== transferencia.sede_destino_id) {
        toast.error('Solo la sede destino puede aceptar transferencias');
        return;
      }
      
      await updateTransferencia(transferenciaId, { estado: 'recibido' });
      toast.success('Transferencia aceptada correctamente');
      fetchTransferencias(); // Recargar transferencias
    } catch (err) {
      console.error('Error al aceptar transferencia:', err);
      toast.error('Error al aceptar la transferencia');
    }
  };

  const handleTransfer = async () => {
    // Validar campos
    if (!transferData.origen || !transferData.destino || !transferData.producto || !transferData.cantidad) {
      toast.error('Completa todos los campos de la transferencia');
      return;
    }
    if (transferData.origen === transferData.destino) {
      toast.error('La sede origen y destino deben ser diferentes');
      return;
    }

    // Validar stock disponible
    const producto = products.find(p => p.id === Number(transferData.producto));
    const stockDisponible = producto?.sedes?.find(s => s.id === Number(transferData.origen))?.pivot?.stock || 0;
    
    if (Number(transferData.cantidad) > stockDisponible) {
      toast.error(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles en la sede origen.`);
      return;
    }

    const data = {
      producto_id: transferData.producto,
      cantidad: Number(transferData.cantidad),
      sede_origen_id: transferData.origen,
      sede_destino_id: transferData.destino,
      estado: 'pendiente',
      fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    const ok = await createTransferencia(data);
    if (ok) {
      toast.success('Transferencia iniciada correctamente');
      setIsTransferModalOpen(false);
      setTransferData({ origen: '', destino: '', producto: '', cantidad: '' });
    } else {
      toast.error('Error al iniciar la transferencia');
    }
  };

  const filteredSedes = sedes.filter(sede =>
    sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sede.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-solid-color" />
          <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Gestión de Sedes</h1>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 text-sm sm:text-base"
          >
            <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Nueva Transferencia</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-4 sm:p-6 border border-border"
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
            <p className="mt-1 text-lg sm:text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <div className="flex justify-end sm:justify-start gap-2 sm:gap-4">
          {/* Menú desplegable para móviles */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-3 py-1.5 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-1 transition-colors duration-200 text-sm"
            >
              <Menu className="h-4 w-4" />
              <span>Menú</span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-bg border border-border rounded-lg shadow-lg z-50 min-w-[150px]">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-interactive-component/50 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar</span>
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-interactive-component/50 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-interactive-component/50 flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </button>
              </div>
            )}
          </div>

          {/* Botones para desktop */}
          <div className="hidden sm:flex sm:space-x-4">
            <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Filter className="h-5 w-5" />
              <span>Filtrar</span>
            </button>
            <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="h-5 w-5" />
              <span>Exportar</span>
            </button>
            <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Printer className="h-5 w-5" />
              <span>Imprimir</span>
            </button>
          </div>

          {/* Botones compactos para tablets */}
          <div className="flex sm:hidden space-x-2">
            <button className="p-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
            <button className="p-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200">
              <Download className="h-4 w-4" />
            </button>
            <button className="p-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors duration-200">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sedes Table (Desktop) */}
      <div className="hidden md:block bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Stock Total
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Transferencias
                </th>
                <th className="px-4 sm:px-8 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <LoadingIndicator
                  variant="table"
                  colSpan={6}
                  text="Cargando sedes..."
                />
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-8 py-3 sm:py-4 text-center text-error">
                    {error}
                  </td>
                </tr>
              ) : filteredSedes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-8 py-3 sm:py-4 text-center text-text-tertiary">
                    No se encontraron sedes
                  </td>
                </tr>
              ) : (
                filteredSedes.map((sede) => {
                  const transferenciasPendientes = getTransferenciasPendientes(sede.id);
                  return (
                    <tr key={sede.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-solid-color" />
                          </div>
                          <div>
                            <div className="text-sm sm:text-base font-medium text-accessibility-text">
                              {sede.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap text-sm sm:text-base text-accessibility-text">
                        {sede.direccion}
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap text-sm sm:text-base text-accessibility-text">
                        {sede.telefono}
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                          <span className="text-sm sm:text-base text-text-tertiary">
                            {getStockTotal(sede.id)} unidades
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        {transferenciasPendientes.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                            <span className="text-sm text-warning">{transferenciasPendientes.length} pendientes</span>
                            <div className="flex space-x-2">
                              {transferenciasPendientes.map(t => (
                                <div key={t.id}>
                                  {/* Solo mostrar el botón de aceptar si el usuario pertenece a esta sede */}
                                  {currentUserSedeId === sede.id ? (
                                    <button
                                      onClick={() => handleAceptarTransferencia(t.id)}
                                      className="p-1 rounded-full hover:bg-success/20 text-success"
                                      title={`Aceptar transferencia #${t.id} - ${t.cantidad} unidades`}
                                    >
                                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                  ) : (
                                    <span 
                                      className="text-xs text-text-tertiary italic" 
                                      title="Solo la sede destino puede aceptar transferencias"
                                    >
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-text-tertiary">Sin transferencias pendientes</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => {
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1.5 sm:p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                            title="Transferir stock"
                          >
                            <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingIndicator text="Cargando sedes..." />
          </div>
        ) : error ? (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : filteredSedes.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-sm">
            No se encontraron sedes
          </div>
        ) : (
          filteredSedes.map((sede) => {
            const transferenciasPendientes = getTransferenciasPendientes(sede.id);
            return (
              <div 
                key={sede.id} 
                className="bg-bg rounded-lg border border-border p-3 hover:border-solid-color/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-interactive-component rounded-lg">
                      <Building2 className="h-4 w-4 text-solid-color" />
                    </div>
                    <div className="text-base font-medium text-accessibility-text">
                      {sede.nombre}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsTransferModalOpen(true);
                    }}
                    className="p-1.5 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                    title="Transferir stock"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <div className="text-text-tertiary text-xs mb-1">Dirección:</div>
                    <div className="text-accessibility-text">{sede.direccion}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary text-xs mb-1">Teléfono:</div>
                    <div className="text-accessibility-text">{sede.telefono}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm text-text-tertiary">
                    {getStockTotal(sede.id)} unidades en stock
                  </span>
                </div>

                <div className="border-t border-border pt-2">
                  {transferenciasPendientes.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm text-warning">
                          {transferenciasPendientes.length} transferencias pendientes
                        </span>
                      </div>
                      {currentUserSedeId === sede.id && (
                        <button
                          onClick={() => handleAceptarTransferencia(transferenciasPendientes[0].id)}
                          className="p-1.5 rounded-lg bg-success/10 text-success flex items-center space-x-1"
                        >
                          <Check className="h-3 w-3" />
                          <span className="text-xs">Aceptar</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">Sin transferencias pendientes</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Nueva Transferencia"
        size="md"
      >
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1">
              Sede Origen
            </label>
            <select
              value={transferData.origen}
              onChange={(e) => setTransferData({ ...transferData, origen: e.target.value })}
              className="w-full text-sm rounded-lg border border-border bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent py-1.5 sm:py-2"
            >
              <option value="">Seleccionar sede origen</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1">
              Sede Destino
            </label>
            <select
              value={transferData.destino}
              onChange={(e) => setTransferData({ ...transferData, destino: e.target.value })}
              className="w-full text-sm rounded-lg border border-border bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent py-1.5 sm:py-2"
            >
              <option value="">Seleccionar sede destino</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1">
              Producto
            </label>
            <select
              value={transferData.producto}
              onChange={(e) => setTransferData({ ...transferData, producto: e.target.value })}
              className="w-full text-sm rounded-lg border border-border bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent py-1.5 sm:py-2"
            >
              <option value="">Seleccionar producto</option>
              {products.map((producto) => {
                const sedeStock = producto.sedes?.find(s => s.id === Number(transferData.origen))?.pivot?.stock || 0;
                return (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - Stock en sede: {sedeStock}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1">
              Cantidad
            </label>
            <input
              type="number"
              value={transferData.cantidad}
              onChange={(e) => setTransferData({ ...transferData, cantidad: e.target.value })}
              className="w-full text-sm rounded-lg border border-border bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent py-1.5 sm:py-2"
              placeholder="Ingrese la cantidad"
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-6 flex justify-end space-x-3 sm:space-x-4">
          <button
            onClick={() => setIsTransferModalOpen(false)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-accessibility-text hover:bg-interactive-component rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleTransfer}
            disabled={isTransferLoading}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-solid-color hover:bg-solid-color-hover text-white rounded-lg transition-colors"
          >
            {isTransferLoading ? (
              <LoadingIndicator variant="button" text="Enviando..." />
            ) : 'Iniciar Transferencia'}
          </button>
        </div>
        {transferError && (
          <div className="mt-3 sm:mt-4 text-center text-error text-xs sm:text-sm">
            {transferError}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sedes; 