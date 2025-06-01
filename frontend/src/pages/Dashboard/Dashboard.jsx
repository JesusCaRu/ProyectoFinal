import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAuthStore } from '../../store/authStore';
import { useSedeStore } from '../../store/sedeStore';
import { Settings, Package, Euro, ShoppingCart, Users, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import LoadingIndicator from '../../components/LoadingIndicator';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        stats,
        isLoading,
        error: dashboardError,
        fetchDashboardData
    } = useDashboardStore();
    const { user } = useAuthStore();
    const { fetchSedes } = useSedeStore();
    
    // Obtener la sede del usuario actual
    const sedeId = user?.data?.sede?.id;
    const sedeName = user?.data?.sede?.nombre || 'No asignada';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (sedeId) {
                    await fetchSedes();
                    await fetchDashboardData(sedeId);
                } else {
                    toast.error('No se pudo determinar la sede actual');
                }
            } catch {
                toast.error('Error al cargar los datos del dashboard');
            }
        };
        loadData();
    }, [fetchDashboardData, sedeId, fetchSedes]);

    if (dashboardError) {
        return (
            <div className="p-2 sm:p-4">
                <div className="bg-error/10 border border-error text-error px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                    Error al cargar los datos: {dashboardError}
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: IconComponent, trend, isLoading }) => (
        <div className="bg-bg-secondary rounded-lg shadow-md p-3 sm:p-6 border border-border">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-medium text-text-tertiary">{title}</p>
                    {isLoading ? (
                        <div className="mt-2">
                            <LoadingIndicator text="" />
                        </div>
                    ) : (
                        <p className="text-xl sm:text-2xl font-semibold text-accessibility-text mt-2">
                            {(() => {
                                if (typeof value === 'number') {
                                    // Si es un valor monetario (ventas o compras)
                                    if (title.includes('Ventas') || title.includes('Compras')) {
                                        return formatCurrency(value);
                                    }
                                    // Otros valores numéricos
                                    return value.toLocaleString('es-ES');
                                }
                                return value || '0';
                            })()}
                        </p>
                    )}
                </div>
                <div className="p-2 sm:p-3 bg-interactive-component rounded-full">
                    {IconComponent && <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-solid-color" />}
                </div>
            </div>
            {trend && !isLoading && (
                <div className="mt-3 flex items-center">
                    {trend.tendencia === 'up' ? (
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                    ) : (
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-error" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ml-1 ${
                        trend.tendencia === 'up' ? 'text-success' : 'text-error'
                    }`}>
                        {Math.abs(trend.valor).toLocaleString('es-ES', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%
                    </span>
                    <span className="text-xs sm:text-sm text-text-tertiary ml-1">vs mes anterior</span>
                </div>
            )}
        </div>
    );

    const TableCard = ({ title, headers, data, isLoading }) => (
        <div className="bg-bg-secondary rounded-lg shadow-md border border-border">
            <div className="px-3 py-3 sm:px-6 sm:py-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-medium text-accessibility-text">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-interactive-component">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-bg-secondary divide-y divide-border">
                        {isLoading ? (
                            <LoadingIndicator 
                                variant="table" 
                                colSpan={headers.length} 
                                text={`Cargando ${title.toLowerCase()}...`}
                            />
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-2 py-3 sm:px-6 sm:py-4 text-center text-text-tertiary">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index} className="hover:bg-interactive-component/50">
                                    {Object.values(item).map((value, i) => (
                                        <td key={i} className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-accessibility-text">
                                            {(() => {
                                                if (typeof value === 'number') {
                                                    // Para valores monetarios (con decimales)
                                                    if (!Number.isInteger(value)) {
                                                        return formatCurrency(value);
                                                    }
                                                    // Para valores enteros
                                                    return value.toLocaleString('es-ES');
                                                }
                                                // Para cualquier otro tipo de valor
                                                return value;
                                            })()}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-accessibility-text">Dashboard</h1>
                    <div className="flex items-center mt-1 text-xs sm:text-sm text-text-tertiary">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>Mostrando datos para la sede: <span className="font-medium">{sedeName}</span></span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/dashboard/configuracion')}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-border rounded-lg shadow-sm text-xs sm:text-sm font-medium text-accessibility-text bg-bg-secondary hover:bg-interactive-component transition-colors duration-200"
                >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-text-tertiary" />
                    Configuración
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-4 sm:mb-6">
                <StatCard
                    title="Productos en Stock"
                    value={stats?.totalProductos ? Number(stats.totalProductos) : 0}
                    icon={Package}
                    trend={stats?.cambios?.productos}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Ventas Totales"
                    value={stats?.totalVentas ? Number(stats.totalVentas) : 0}
                    icon={Euro}
                    trend={stats?.cambios?.ventas}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Compras Totales"
                    value={stats?.totalCompras ? Number(stats.totalCompras) : 0}
                    icon={ShoppingCart}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Usuarios Activos"
                    value={stats?.totalUsuarios ? Number(stats.totalUsuarios) : 0}
                    icon={Users}
                    trend={stats?.cambios?.usuarios}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                    <TableCard
                        title="Productos Más Vendidos"
                        headers={['Producto', 'Unidades', 'Total']}
                        data={(stats?.productosMasVendidos || []).map(p => {
                            // Validación y conversión segura de valores
                            const totalVendido = typeof p.total_vendido === 'number' 
                                ? p.total_vendido 
                                : typeof p.total_vendido === 'string' && !isNaN(p.total_vendido)
                                ? Number(p.total_vendido)
                                : 0;
                            
                            const totalIngresos = typeof p.total_ingresos === 'number' 
                                ? p.total_ingresos 
                                : typeof p.total_ingresos === 'string' && !isNaN(p.total_ingresos)
                                ? Number(p.total_ingresos)
                                : 0;
                            
                            return {
                                nombre: p.nombre || 'Sin nombre',
                                total_vendido: totalVendido,
                                total_ingresos: totalIngresos
                            };
                        })}
                        isLoading={isLoading}
                    />
                    <TableCard
                        title="Productos con Stock Bajo"
                        headers={['Producto', 'Stock Actual', 'Stock Mínimo']}
                        data={(stats?.productosStockBajo?.data || []).map(p => {
                            // Validación y conversión segura de valores
                            const stock = typeof p.stock === 'number' 
                                ? p.stock 
                                : typeof p.stock === 'string' && !isNaN(p.stock)
                                ? Number(p.stock)
                                : 0;
                            
                            const stockMinimo = typeof p.stock_minimo === 'number' 
                                ? p.stock_minimo 
                                : typeof p.stock_minimo === 'string' && !isNaN(p.stock_minimo)
                                ? Number(p.stock_minimo)
                                : 0;
                            
                            return {
                                nombre: p.nombre || 'Sin nombre',
                                stock: stock,
                                stock_minimo: stockMinimo
                            };
                        })}
                        isLoading={isLoading}
                    />
                </div>
                <div className="space-y-4 sm:space-y-6">
                    <TableCard
                        title="Últimas Ventas"
                        headers={['ID', 'Total', 'Usuario', 'Fecha']}
                        data={(stats?.ultimasVentas || []).map(v => {
                            // Validación y conversión segura de valores
                            const total = typeof v.total === 'number' 
                                ? v.total 
                                : typeof v.total === 'string' && !isNaN(v.total)
                                ? Number(v.total)
                                : 0;
                            
                            return {
                                id: v.id,
                                total: total,
                                usuario: v.usuario || 'Sin usuario',
                                fecha: (() => {
                                    try {
                                        if (!v.fecha) return 'N/A';
                                        const date = new Date(v.fecha);
                                        if (isNaN(date.getTime())) return 'N/A';
                                        return date.toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        });
                                    } catch {
                                        return 'Fecha inválida';
                                    }
                                })()
                            };
                        })}
                        isLoading={isLoading}
                    />
                    <TableCard
                        title="Últimos Movimientos"
                        headers={['Tipo', 'Cantidad', 'Producto', 'Usuario']}
                        data={(stats?.ultimosMovimientos?.data || []).map(m => {
                            // Validación y conversión segura de valores
                            const cantidad = typeof m.cantidad === 'number' 
                                ? m.cantidad 
                                : typeof m.cantidad === 'string' && !isNaN(m.cantidad)
                                ? Number(m.cantidad)
                                : 0;
                            
                            return {
                                tipo: m.tipo || 'Sin tipo',
                                cantidad: cantidad,
                                producto: m.producto || 'Sin producto',
                                usuario: m.usuario || 'Sin usuario'
                            };
                        })}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 