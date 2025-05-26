import React, { useState, useEffect } from 'react';
import { useAuditoriaStore } from '../../store/auditoriaStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        switch (accion) {
            case 'CREATE':
                return 'text-success';
            case 'UPDATE':
                return 'text-warning';
            case 'DELETE':
                return 'text-error';
            default:
                return 'text-text-tertiary';
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
                                        IP
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
                                                    {registro.accion}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.tabla}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.registro_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                                {registro.ip_address}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auditoria; 