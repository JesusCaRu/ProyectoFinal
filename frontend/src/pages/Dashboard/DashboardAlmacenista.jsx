import { useState, useEffect } from 'react';
import { motion as _motion } from 'framer-motion';
import { 
    Package, 
    ArrowDownToLine, 
    ArrowUpFromLine, 
    AlertTriangle,
    Building2,
    Truck
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useMovimientoStore } from '../../store/movimientoStore';
import { useTransferenciaStore } from '../../store/transferenciaStore';
import { useSedeStore } from '../../store/sedeStore';
import { useAuthStore } from '../../store/authStore';
import LoadingIndicator from '../../components/LoadingIndicator';

const DashboardAlmacenista = () => {
    const { products, loadProducts } = useProductStore();
    const { movimientos, loadMovimientos } = useMovimientoStore();
    const { transferencias, fetchTransferencias } = useTransferenciaStore();
    const { sedes, fetchSedes } = useSedeStore();
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener la sede del usuario actual
    const userSedeId = user?.data?.sede?.id;

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    loadProducts(),
                    loadMovimientos(),
                    fetchTransferencias(),
                    fetchSedes()
                ]);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
                setError('Error al cargar los datos iniciales');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [loadProducts, loadMovimientos, fetchTransferencias, fetchSedes]);

    // Asegurarnos de que movimientos y transferencias sean arrays
    const movimientosArray = Array.isArray(movimientos) ? movimientos : [];
    const transferenciasArray = Array.isArray(transferencias) ? transferencias : [];

    // Filtrar productos por sede del usuario
    const productosPorSede = products.filter(product => 
        product.sedes?.some(sede => sede.id === userSedeId)
    );

    // Productos con stock bajo (menos de 5 unidades)
    const productosStockBajo = productosPorSede.filter(product => {
        const stock = product.sedes?.find(s => s.id === userSedeId)?.stock || 0;
        return stock < 5;
    });

    // Movimientos recientes
    const movimientosRecientes = movimientosArray
        .filter(mov => 
            (mov.sede_id === userSedeId || mov.sede_origen_id === userSedeId || mov.sede_destino_id === userSedeId) &&
            mov.tipo !== 'transferencia'
        )
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

    // Transferencias recientes (entrantes y salientes)
    const transferenciasRecientes = transferenciasArray
        .filter(trans => 
            trans.sede_origen_id === userSedeId || trans.sede_destino_id === userSedeId
        )
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

    // Para debug
    console.log('Transferencias completas:', transferenciasArray);
    console.log('Transferencias filtradas:', transferenciasRecientes);
    console.log('Sede del usuario:', userSedeId);
    console.log('Estructura de una transferencia:', transferenciasArray[0]);

    // Estadísticas
    const stats = {
        totalProductos: productosPorSede.length,
        stockBajo: productosStockBajo.length,
        entradasHoy: movimientosArray
            .filter(m => 
                (m.sede_id === userSedeId || m.sede_destino_id === userSedeId) &&
                m.tipo === 'entrada' &&
                new Date(m.fecha).toDateString() === new Date().toDateString()
            ).length,
        salidasHoy: movimientosArray
            .filter(m => 
                (m.sede_id === userSedeId || m.sede_origen_id === userSedeId) &&
                m.tipo === 'salida' &&
                new Date(m.fecha).toDateString() === new Date().toDateString()
            ).length,
        transferenciasHoy: transferenciasArray
            .filter(t => 
                (t.sede_origen_id === userSedeId || t.sede_destino_id === userSedeId) &&
                new Date(t.fecha).toDateString() === new Date().toDateString()
            ).length
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <LoadingIndicator
                    variant="container"
                    text="Cargando datos del dashboard..."
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

    // Obtener el nombre de la sede actual
    const sedeActual = sedes.find(s => s.id === userSedeId);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-accessibility-text">Dashboard Almacenista</h1>
                    {sedeActual && (
                        <p className="text-text-tertiary mt-1">
                            <Building2 className="inline-block h-4 w-4 mr-1" />
                            {sedeActual.nombre}
                        </p>
                    )}
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <_motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-secondary p-6 rounded-lg shadow-md border border-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm">Total Productos</p>
                            <h3 className="text-2xl font-bold text-accessibility-text">{stats.totalProductos}</h3>
                        </div>
                        <div className="p-3 bg-interactive-component rounded-lg">
                            <Package className="h-6 w-6 text-solid-color" />
                        </div>
                    </div>
                </_motion.div>

                <_motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-bg-secondary p-6 rounded-lg shadow-md border border-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm">Stock Bajo</p>
                            <h3 className="text-2xl font-bold text-warning">{stats.stockBajo}</h3>
                        </div>
                        <div className="p-3 bg-warning/10 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-warning" />
                        </div>
                    </div>
                </_motion.div>

                <_motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-bg-secondary p-6 rounded-lg shadow-md border border-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm">Entradas Hoy</p>
                            <h3 className="text-2xl font-bold text-success">{stats.entradasHoy}</h3>
                        </div>
                        <div className="p-3 bg-success/10 rounded-lg">
                            <ArrowDownToLine className="h-6 w-6 text-success" />
                        </div>
                    </div>
                </_motion.div>

                <_motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-bg-secondary p-6 rounded-lg shadow-md border border-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm">Salidas Hoy</p>
                            <h3 className="text-2xl font-bold text-error">{stats.salidasHoy}</h3>
                        </div>
                        <div className="p-3 bg-error/10 rounded-lg">
                            <ArrowUpFromLine className="h-6 w-6 text-error" />
                        </div>
                    </div>
                </_motion.div>

                <_motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-bg-secondary p-6 rounded-lg shadow-md border border-border"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm">Transferencias Hoy</p>
                            <h3 className="text-2xl font-bold text-info">{stats.transferenciasHoy}</h3>
                        </div>
                        <div className="p-3 bg-info/10 rounded-lg">
                            <Truck className="h-6 w-6 text-info" />
                        </div>
                    </div>
                </_motion.div>
            </div>

            {/* Productos con stock bajo */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-accessibility-text mb-4">Productos con Stock Bajo</h2>
                <div className="bg-bg-secondary rounded-lg shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Stock Actual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {productosStockBajo.map((product) => (
                                    <tr key={product.id} className="hover:bg-bg/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-accessibility-text">{product.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">{product.sku || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-warning">
                                                {product.sedes?.find(s => s.id === userSedeId)?.stock || 0} unidades
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Movimientos recientes */}
            <div>
                <h2 className="text-xl font-semibold text-accessibility-text mb-4">Movimientos Recientes</h2>
                <div className="bg-bg-secondary rounded-lg shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {movimientosRecientes.map((movimiento) => (
                                    <tr key={movimiento.id} className="hover:bg-bg/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-text-tertiary">
                                                {new Date(movimiento.fecha).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                movimiento.tipo === 'entrada' 
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-error/10 text-error'
                                            }`}>
                                                {movimiento.tipo === 'entrada' ? (
                                                    <ArrowDownToLine className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <ArrowUpFromLine className="h-4 w-4 mr-1" />
                                                )}
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Transferencias recientes */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-accessibility-text mb-4">Transferencias Recientes</h2>
                <div className="bg-bg-secondary rounded-lg shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Cantidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Origen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Destino</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transferenciasRecientes.length > 0 ? (
                                    transferenciasRecientes.map((transferencia) => (
                                        <tr key={transferencia.id} className="hover:bg-bg/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-tertiary">
                                                    {new Date(transferencia.fecha).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    transferencia.sede_destino_id === userSedeId
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    <Truck className="h-4 w-4 mr-1" />
                                                    {transferencia.sede_destino_id === userSedeId ? 'Entrante' : 'Saliente'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-accessibility-text">
                                                    {transferencia.producto?.nombre || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-tertiary">
                                                    {transferencia.cantidad} unidades
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-tertiary">
                                                    {sedes.find(s => s.id === transferencia.sede_origen_id)?.nombre || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-tertiary">
                                                    {sedes.find(s => s.id === transferencia.sede_destino_id)?.nombre || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    transferencia.estado === 'recibido' 
                                                        ? 'bg-success/10 text-success'
                                                        : transferencia.estado === 'enviado'
                                                        ? 'bg-warning/10 text-warning'
                                                        : 'bg-info/10 text-info'
                                                }`}>
                                                    {transferencia.estado}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-text-tertiary">
                                            No hay transferencias recientes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAlmacenista; 