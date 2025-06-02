import { useState, useEffect } from 'react';
import { useMovimientoStore } from '../../store/movimientoStore';
import { useSedeStore } from '../../store/sedeStore';
import { useAuthStore } from '../../store/authStore';
import { 
    Calendar,
    Search,
    Filter,
    ArrowDownToLine,
    ArrowUpFromLine,
    Truck,
    RefreshCw
} from 'lucide-react';
import LoadingIndicator from '../../components/LoadingIndicator';

const HistorialMovimientos = () => {
    const { movimientos, loadMovimientos, isLoading, error } = useMovimientoStore();
    const { sedes, fetchSedes } = useSedeStore();
    const { user } = useAuthStore();
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Obtener la sede del usuario actual
    const userSedeId = user?.data?.sede?.id;

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    loadMovimientos(),
                    fetchSedes()
                ]);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };

        loadData();
    }, [loadMovimientos, fetchSedes]);

    // Asegurarnos de que movimientos sea un array
    const movimientosArray = Array.isArray(movimientos) ? movimientos : [];

    // Filtrar movimientos
    const movimientosFiltrados = movimientosArray
        .filter(mov => {
            // Filtrar por sede
            const esDeSede = mov.sede_id === userSedeId || 
                           mov.sede_origen_id === userSedeId || 
                           mov.sede_destino_id === userSedeId;

            // Filtrar por tipo
            const tipoValido = tipoFiltro === 'todos' || mov.tipo === tipoFiltro;

            // Filtrar por búsqueda
            const coincideBusqueda = searchTerm === '' || 
                mov.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mov.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtrar por fecha
            const fechaMovimiento = new Date(mov.fecha);
            const fechaInicioValida = !fechaInicio || fechaMovimiento >= new Date(fechaInicio);
            const fechaFinValida = !fechaFin || fechaMovimiento <= new Date(fechaFin + 'T23:59:59');

            return esDeSede && tipoValido && coincideBusqueda && fechaInicioValida && fechaFinValida;
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Función para obtener el icono según el tipo de movimiento
    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'entrada':
                return <ArrowDownToLine className="h-4 w-4 mr-1" />;
            case 'salida':
                return <ArrowUpFromLine className="h-4 w-4 mr-1" />;
            case 'transferencia':
                return <Truck className="h-4 w-4 mr-1" />;
            default:
                return <RefreshCw className="h-4 w-4 mr-1" />;
        }
    };

    // Función para obtener el color según el tipo de movimiento
    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'entrada':
                return 'bg-success/10 text-success';
            case 'salida':
                return 'bg-error/10 text-error';
            case 'transferencia':
                return 'bg-info/10 text-info';
            default:
                return 'bg-warning/10 text-warning';
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <LoadingIndicator
                    variant="container"
                    text="Cargando historial de movimientos..."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-error/10 text-error p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-accessibility-text">Historial de Movimientos</h1>
            </div>

            {/* Filtros */}
            <div className="bg-bg-secondary p-4 rounded-lg shadow-md border border-border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por producto o descripción..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-accessibility-text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro por tipo */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
                        <select
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-accessibility-text"
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value)}
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="entrada">Entradas</option>
                            <option value="salida">Salidas</option>
                            <option value="transferencia">Transferencias</option>
                        </select>
                    </div>

                    {/* Fecha inicio */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-accessibility-text"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>

                    {/* Fecha fin */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary h-4 w-4" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-accessibility-text"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de movimientos */}
            <div className="bg-bg-secondary rounded-lg shadow-md border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-bg border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Cantidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Sede</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {movimientosFiltrados.length > 0 ? (
                                movimientosFiltrados.map((movimiento) => (
                                    <tr key={movimiento.id} className="hover:bg-bg/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">
                                                {new Date(movimiento.fecha).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(movimiento.tipo)}`}>
                                                {getTipoIcon(movimiento.tipo)}
                                                {movimiento.tipo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-accessibility-text">
                                                {movimiento.producto?.nombre || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">
                                                {movimiento.cantidad} unidades
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-text-tertiary">
                                                {movimiento.descripcion || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">
                                                {movimiento.sede?.nombre || 
                                                 movimiento.sede_origen_id === userSedeId ? 'Esta sede' : 
                                                 sedes.find(s => s.id === movimiento.sede_origen_id)?.nombre || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">
                                                {movimiento.usuario?.nombre || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-text-tertiary">
                                        No se encontraron movimientos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistorialMovimientos; 