import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { Settings, Package, DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        stats,
        isLoading,
        error: dashboardError,
        fetchDashboardData
    } = useDashboardStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchDashboardData();
            } catch {
                toast.error('Error al cargar los datos del dashboard');
            }
        };
        loadData();
    }, [fetchDashboardData]);

    if (dashboardError) {
        return (
            <div className="p-4">
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
                    Error al cargar los datos: {dashboardError}
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: IconComponent, trend, isLoading }) => (
        <div className="bg-bg-secondary rounded-lg shadow-md p-6 border border-border">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-text-tertiary">{title}</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-interactive-component animate-pulse rounded mt-2"></div>
                    ) : (
                        <p className="text-2xl font-semibold text-accessibility-text mt-2">
                            {typeof value === 'number' && title.includes('Ventas') ? formatCurrency(value) : value}
                        </p>
                    )}
                </div>
                <div className="p-3 bg-interactive-component rounded-full">
                    {IconComponent && <IconComponent className="h-6 w-6 text-solid-color" />}
                </div>
            </div>
            {trend && !isLoading && (
                <div className="mt-4 flex items-center">
                    {trend.tendencia === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-error" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                        trend.tendencia === 'up' ? 'text-success' : 'text-error'
                    }`}>
                        {Math.abs(trend.valor).toFixed(1)}%
                    </span>
                    <span className="text-sm text-text-tertiary ml-1">vs mes anterior</span>
                </div>
            )}
        </div>
    );

    const TableCard = ({ title, headers, data, isLoading }) => (
        <div className="bg-bg-secondary rounded-lg shadow-md border border-border">
            <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-accessibility-text">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-interactive-component">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-bg-secondary divide-y divide-border">
                        {isLoading ? (
                            Array(5).fill(0).map((_, index) => (
                                <tr key={index}>
                                    {headers.map((_, i) => (
                                        <td key={i} className="px-6 py-4">
                                            <div className="h-4 bg-interactive-component animate-pulse rounded"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-4 text-center text-text-tertiary">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index} className="hover:bg-interactive-component/50">
                                    {Object.values(item).map((value, i) => (
                                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-accessibility-text">
                                            {typeof value === 'number' && !Number.isInteger(value)
                                                ? formatCurrency(value)
                                                : value}
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-accessibility-text">Dashboard</h1>
                <button
                    onClick={() => navigate('/dashboard/configuracion')}
                    className="inline-flex items-center px-4 py-2 border border-border rounded-lg shadow-sm text-sm font-medium text-accessibility-text bg-bg-secondary hover:bg-interactive-component transition-colors duration-200"
                >
                    <Settings className="h-5 w-5 mr-2 text-text-tertiary" />
                    Configuración
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Productos en Stock"
                    value={stats?.totalProductos || 0}
                    icon={Package}
                    trend={stats?.cambios?.productos}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Ventas Totales"
                    value={stats?.totalVentas || 0}
                    icon={DollarSign}
                    trend={stats?.cambios?.ventas}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Compras Totales"
                    value={stats?.totalCompras || 0}
                    icon={ShoppingCart}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Usuarios Activos"
                    value={stats?.totalUsuarios || 0}
                    icon={Users}
                    trend={stats?.cambios?.usuarios}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <TableCard
                        title="Productos Más Vendidos"
                        headers={['Producto', 'Unidades', 'Total']}
                        data={stats?.productosMasVendidos?.map(p => ({
                            nombre: p.nombre,
                            total_vendido: p.total_vendido,
                            total_ingresos: p.total_ingresos
                        })) || []}
                        isLoading={isLoading}
                    />
                    <TableCard
                        title="Productos con Stock Bajo"
                        headers={['Producto', 'Stock Actual', 'Stock Mínimo']}
                        data={stats?.productosStockBajo?.data?.map(p => ({
                            nombre: p.nombre,
                            stock: p.stock,
                            stock_minimo: p.stock_minimo
                        })) || []}
                        isLoading={isLoading}
                    />
                </div>
                <div className="space-y-6">
                    <TableCard
                        title="Últimas Ventas"
                        headers={['ID', 'Total', 'Usuario', 'Fecha']}
                        data={stats?.ultimasVentas?.map(v => ({
                            id: v.id,
                            total: v.total,
                            usuario: v.usuario,
                            fecha: new Date(v.fecha).toLocaleDateString()
                        })) || []}
                        isLoading={isLoading}
                    />
                    <TableCard
                        title="Últimos Movimientos"
                        headers={['Tipo', 'Cantidad', 'Producto', 'Usuario']}
                        data={stats?.ultimosMovimientos?.data?.map(m => ({
                            tipo: m.tipo,
                            cantidad: m.cantidad,
                            producto: m.producto,
                            usuario: m.usuario
                        })) || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 