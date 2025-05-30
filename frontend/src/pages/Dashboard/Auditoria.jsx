import React, { useState, useEffect } from 'react';
import { useAuditoriaStore } from '../../store/auditoriaStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    Search, 
    Filter, 
    Calendar, 
    Eye, 
    LogIn, 
    LogOut, 
    ShoppingCart, 
    Package, 
    ArrowRightLeft, 
    User, 
    Building2, 
    MessageSquare,
    FileText,
    Clipboard,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';
import LoadingIndicator from '../../components/LoadingIndicator';

const Auditoria = () => {
    const {
        registros = [],
        tablas = [],
        isLoading,
        error,
        fetchRegistros,
        fetchAcciones,
        fetchTablas,
        fetchLogNames
    } = useAuditoriaStore();

    const [filtros, setFiltros] = useState({
        usuario_id: '',
        accion: '',
        tabla: '',
        log_name: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const [detallesModal, setDetallesModal] = useState({
        isOpen: false,
        data: null
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchRegistros(filtros),
                    fetchAcciones(),
                    fetchTablas(),
                    fetchLogNames()
                ]);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error(error.message || 'Error al cargar los datos de auditoría');
            }
        };
        loadData();
    }, [filtros, fetchRegistros, fetchAcciones, fetchTablas, fetchLogNames]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getAccionColor = (accion, logName) => {
        // Por tipo de log
        if (logName === 'autenticacion') {
            return accion.toLowerCase().includes('sesión') ? 'text-info' : 'text-warning';
        }
        
        if (logName === 'ventas') return 'text-success';
        if (logName === 'compras') return 'text-warning';
        if (logName === 'transferencias') return 'text-info';
        
        // Por acción
        const accionLower = accion.toLowerCase();
        if (accionLower.includes('crear') || accionLower.includes('create') || accionLower.includes('registr')) {
            return 'text-success';
        } else if (accionLower.includes('actualizar') || accionLower.includes('update') || accionLower.includes('modific')) {
            return 'text-warning';
        } else if (accionLower.includes('eliminar') || accionLower.includes('delete') || accionLower.includes('borr')) {
            return 'text-error';
        }
        return 'text-text-tertiary';
    };

    const getAccionIcon = (accion, logName, properties) => {
        // Iconos específicos por tipo de log
        if (logName === 'autenticacion') {
            if (accion.toLowerCase().includes('iniciado')) return <LogIn className="h-4 w-4" />;
            if (accion.toLowerCase().includes('cerrado')) return <LogOut className="h-4 w-4" />;
            return <User className="h-4 w-4" />;
        }
        
        if (logName === 'ventas') return <ShoppingCart className="h-4 w-4" />;
        if (logName === 'compras') return <Package className="h-4 w-4" />;
        if (logName === 'transferencias') return <ArrowRightLeft className="h-4 w-4" />;
        if (logName === 'inventario') return <Clipboard className="h-4 w-4" />;
        if (logName === 'sistema') return <AlertCircle className="h-4 w-4" />;
        
        // Iconos por tipo de tabla
        const tabla = properties?.subject_type?.split('\\').pop() || '';
        if (tabla.toLowerCase().includes('usuario')) return <User className="h-4 w-4" />;
        if (tabla.toLowerCase().includes('sede')) return <Building2 className="h-4 w-4" />;
        if (tabla.toLowerCase().includes('producto')) return <Package className="h-4 w-4" />;
        if (tabla.toLowerCase().includes('mensaje')) return <MessageSquare className="h-4 w-4" />;
        
        return <FileText className="h-4 w-4" />;
    };

    const formatDetalles = (properties) => {
        if (!properties) return null;
        
        // Manejo de propiedades en el nuevo formato
        if (properties.tipo) {
            switch (properties.tipo) {
                case 'login':
                case 'logout':
                    return [
                        { campo: 'Usuario', nuevo: properties.email },
                        { campo: 'IP', nuevo: properties.ip }
                    ];
                case 'venta_creada':
                    return [
                        { campo: 'Total', nuevo: `$${properties.total}` },
                        { campo: 'Sede', nuevo: `ID: ${properties.sede_id}` },
                        { campo: 'Productos', nuevo: `${properties.productos?.length || 0} productos` }
                    ];
                case 'compra_creada':
                    return [
                        { campo: 'Total', nuevo: `$${properties.total}` },
                        { campo: 'Sede', nuevo: `ID: ${properties.sede_id}` },
                        { campo: 'Proveedor', nuevo: `ID: ${properties.proveedor_id}` },
                        { campo: 'Productos', nuevo: `${properties.productos?.length || 0} productos` }
                    ];
                case 'compra_estado_actualizado':
                    return [
                        { campo: 'Estado Anterior', anterior: properties.estado_anterior },
                        { campo: 'Estado Nuevo', nuevo: properties.estado_nuevo }
                    ];
                default:
                    break;
            }
        }
        
        // Formato tradicional de cambios
        const { attributes, old } = properties;
        const cambios = [];

        if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                const valorAnterior = old?.[key];
                if (valorAnterior !== value) {
                    cambios.push({
                        campo: key,
                        anterior: valorAnterior,
                        nuevo: value
                    });
                }
            });
        }

        return cambios.length > 0 ? cambios : null;
    };

    const formatAccion = (accion) => {
        if (!accion) return '';
        return accion;
    };

    const formatCampo = (campo) => {
        if (!campo) return '';
        return campo
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatLogName = (logName) => {
        if (!logName) return 'Sistema';
        
        switch (logName) {
            case 'autenticacion': return 'Autenticación';
            case 'ventas': return 'Ventas';
            case 'compras': return 'Compras';
            case 'transferencias': return 'Transferencias';
            case 'inventario': return 'Inventario';
            case 'sistema': return 'Sistema';
            default: return logName.charAt(0).toUpperCase() + logName.slice(1);
        }
    };

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-accessibility-text mb-4">Registro de Auditoría</h1>
                
                {/* Filtros */}
                <div className="bg-bg-secondary p-4 rounded-lg shadow-md border border-border mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-tertiary mb-1">
                                Tipo
                            </label>
                            <select
                                name="log_name"
                                value={filtros.log_name}
                                onChange={handleFiltroChange}
                                className="w-full rounded-lg border border-border bg-bg-secondary text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="autenticacion">Autenticación</option>
                                <option value="ventas">Ventas</option>
                                <option value="compras">Compras</option>
                                <option value="transferencias">Transferencias</option>
                                <option value="inventario">Inventario</option>
                                <option value="sistema">Sistema</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-tertiary mb-1">
                                Tabla
                            </label>
                            <select
                                name="tabla"
                                value={filtros.tabla}
                                onChange={handleFiltroChange}
                                className="w-full rounded-lg border border-border bg-bg-secondary text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent"
                            >
                                <option value="">Todas</option>
                                {Array.isArray(tablas) && tablas.map(tabla => (
                                    <option key={tabla} value={tabla}>{tabla}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-tertiary mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={filtros.fecha_inicio}
                                onChange={handleFiltroChange}
                                className="w-full rounded-lg border border-border bg-bg-secondary text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-tertiary mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={filtros.fecha_fin}
                                onChange={handleFiltroChange}
                                className="w-full rounded-lg border border-border bg-bg-secondary text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabla de Registros */}
                <div className="bg-bg-secondary rounded-lg shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-interactive-component">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Acción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Detalles
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-bg-secondary divide-y divide-border">
                                {isLoading ? (
                                    <LoadingIndicator
                                        variant="table"
                                        colSpan={5}
                                        text="Cargando registros de auditoría..."
                                    />
                                ) : !Array.isArray(registros) || registros.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-text-tertiary">
                                            No hay registros de auditoría
                                        </td>
                                    </tr>
                                ) : (
                                    registros.map((registro) => (
                                        <tr key={registro.id} className="hover:bg-interactive-component/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {format(new Date(registro.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.usuario?.nombre || 'Sistema'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {formatLogName(registro.log_name)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`p-1 rounded-full ${getAccionColor(registro.accion, registro.log_name)} bg-opacity-20`}>
                                                        {getAccionIcon(registro.accion, registro.log_name, registro.properties)}
                                                    </span>
                                                    <span className={`font-medium ${getAccionColor(registro.accion, registro.log_name)}`}>
                                                        {formatAccion(registro.accion)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                <button
                                                    onClick={() => setDetallesModal({
                                                        isOpen: true,
                                                        data: registro
                                                    })}
                                                    className="text-primary hover:text-primary-dark transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Detalles */}
            <Modal
                isOpen={detallesModal.isOpen}
                onClose={() => setDetallesModal({ isOpen: false, data: null })}
                title="Detalles de la Auditoría"
            >
                {detallesModal.data && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Fecha</p>
                                <p className="text-sm text-accessibility-text">
                                    {format(new Date(detallesModal.data.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </p>
                            </div>
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Usuario</p>
                                <p className="text-sm text-accessibility-text">{detallesModal.data.usuario?.nombre || 'Sistema'}</p>
                            </div>
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Tipo</p>
                                <p className="text-sm text-accessibility-text">{formatLogName(detallesModal.data.log_name)}</p>
                            </div>
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Acción</p>
                                <div className="flex items-center space-x-2">
                                    <span className={`p-1 rounded-full ${getAccionColor(detallesModal.data.accion, detallesModal.data.log_name)} bg-opacity-20`}>
                                        {getAccionIcon(detallesModal.data.accion, detallesModal.data.log_name, detallesModal.data.properties)}
                                    </span>
                                    <p className={`text-sm font-medium ${getAccionColor(detallesModal.data.accion, detallesModal.data.log_name)}`}>
                                        {formatAccion(detallesModal.data.accion)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {detallesModal.data.properties && (
                            <div>
                                <h4 className="text-sm font-medium text-text-tertiary mb-3">Detalles</h4>
                                <div className="bg-bg-primary rounded-lg p-4">
                                    <div className="space-y-4">
                                        {formatDetalles(detallesModal.data.properties)?.map((cambio, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-text-tertiary mb-2">
                                                        {formatCampo(cambio.campo)}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {cambio.anterior !== undefined && (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs font-medium text-text-tertiary">Anterior:</span>
                                                                <p className="text-sm text-error">{String(cambio.anterior)}</p>
                                                            </div>
                                                        )}
                                                        {cambio.nuevo !== undefined && (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs font-medium text-text-tertiary">Nuevo:</span>
                                                                <p className="text-sm text-success">{String(cambio.nuevo)}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {!formatDetalles(detallesModal.data.properties) && (
                                            <p className="text-sm text-text-tertiary">No hay detalles adicionales disponibles</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Auditoria; 