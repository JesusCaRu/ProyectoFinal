import React, { useState, useEffect } from 'react';
import { useAuditoriaStore } from '../../store/auditoriaStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Calendar, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/Modal';

const Auditoria = () => {
    const {
        registros = [],
        acciones = [],
        tablas = [],
        isLoading,
        error,
        fetchRegistros,
        fetchAcciones,
        fetchTablas
    } = useAuditoriaStore();

    const [filtros, setFiltros] = useState({
        usuario_id: '',
        accion: '',
        tabla: '',
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
                    fetchTablas()
                ]);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error(error.message || 'Error al cargar los datos de auditoría');
            }
        };
        loadData();
    }, [filtros, fetchRegistros, fetchAcciones, fetchTablas]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getAccionColor = (accion) => {
        const accionLower = accion.toLowerCase();
        if (accionLower.includes('crear') || accionLower.includes('create')) {
            return 'text-success';
        } else if (accionLower.includes('actualizar') || accionLower.includes('update')) {
            return 'text-warning';
        } else if (accionLower.includes('eliminar') || accionLower.includes('delete')) {
            return 'text-error';
        }
        return 'text-text-tertiary';
    };

    const formatDetalles = (properties) => {
        if (!properties) return null;
        
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

        return cambios;
    };

    const formatAccion = (accion) => {
        if (!accion) return '';
        return accion.toUpperCase();
    };

    const formatCampo = (campo) => {
        if (!campo) return '';
        return campo
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
                                Acción
                            </label>
                            <select
                                name="accion"
                                value={filtros.accion}
                                onChange={handleFiltroChange}
                                className="w-full rounded-lg border border-border bg-bg-secondary text-accessibility-text focus:ring-2 focus:ring-solid-color focus:border-transparent"
                            >
                                <option value="">Todas</option>
                                {Array.isArray(acciones) && acciones.map(accion => (
                                    <option key={accion} value={accion}>{accion}</option>
                                ))}
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
                                        Acción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Tabla
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Registro ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        Detalles
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-bg-secondary divide-y divide-border">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <tr key={index}>
                                            {Array(6).fill(0).map((_, i) => (
                                                <td key={i} className="px-6 py-4">
                                                    <div className="h-4 bg-interactive-component animate-pulse rounded"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : !Array.isArray(registros) || registros.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-text-tertiary">
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
                                                {registro.usuario?.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-medium ${getAccionColor(registro.accion)}`}>
                                                    {formatAccion(registro.accion)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.tabla}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.registro_id}
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
                                <p className="text-sm text-accessibility-text">{detallesModal.data.usuario?.nombre}</p>
                            </div>
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Acción</p>
                                <p className={`text-sm font-medium ${getAccionColor(detallesModal.data.accion)}`}>
                                    {formatAccion(detallesModal.data.accion)}
                                </p>
                            </div>
                            <div className="bg-bg-primary p-4 rounded-lg">
                                <p className="text-sm font-medium text-text-tertiary mb-1">Tabla</p>
                                <p className="text-sm text-accessibility-text">{detallesModal.data.tabla}</p>
                            </div>
                        </div>

                        {detallesModal.data.properties && (
                            <div>
                                <h4 className="text-sm font-medium text-text-tertiary mb-3">Cambios Realizados</h4>
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
                                                                <p className="text-sm text-error">{cambio.anterior}</p>
                                                            </div>
                                                        )}
                                                        {cambio.nuevo !== undefined && (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xs font-medium text-text-tertiary">Nuevo:</span>
                                                                <p className="text-sm text-success">{cambio.nuevo}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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