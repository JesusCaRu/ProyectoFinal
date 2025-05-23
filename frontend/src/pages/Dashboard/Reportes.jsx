import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useVentaStore } from '../../store/ventaStore';
import { useCompraStore } from '../../store/compraStore';
import { useProductStore } from '../../store/productStore';
import { toast } from 'react-hot-toast';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reportes = () => {
  const { fetchResumen: fetchVentasResumen } = useVentaStore();
  const { fetchResumen: fetchComprasResumen } = useCompraStore();
  const { getMovementsSummary } = useProductStore();

  // Estados
  const [activeTab, setActiveTab] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumenVentas, setResumenVentas] = useState(null);
  const [resumenCompras, setResumenCompras] = useState(null);
  const [resumenMovimientos, setResumenMovimientos] = useState(null);

  // Cargar resúmenes cuando cambian las fechas
  useEffect(() => {
    loadResumenes();
  }, [fechaInicio, fechaFin]);

  // Función para cargar todos los resúmenes
  const loadResumenes = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ventasData, comprasData, movimientosData] = await Promise.all([
        fetchVentasResumen(fechaInicio, fechaFin),
        fetchComprasResumen(fechaInicio, fechaFin),
        getMovementsSummary(fechaInicio, fechaFin)
      ]);

      setResumenVentas(ventasData);
      setResumenCompras(comprasData);
      setResumenMovimientos(movimientosData);

    } catch (error) {
      console.error('Error al cargar resúmenes:', error);
      setError(error.message);
      toast.error('Error al cargar los resúmenes');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar reporte
  const exportarReporte = () => {
    // TODO: Implementar exportación de reportes
    toast.error('Función de exportación no implementada aún');
  };

  // Renderizar resumen de ventas
  const renderVentasReport = () => {
    if (!resumenVentas) return null;

    const { resumen, productos_mas_vendidos } = resumenVentas;

    // Datos para el gráfico de ventas por día
    const ventasPorDia = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [
        {
          label: 'Ventas por día',
          data: [65, 59, 80, 81, 56, 55, 40], // TODO: Implementar datos reales
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

    // Datos para el gráfico de productos más vendidos
    const productosMasVendidosData = {
      labels: productos_mas_vendidos.map(p => p.producto.nombre),
      datasets: [
        {
          label: 'Unidades vendidas',
          data: productos_mas_vendidos.map(p => p.total_vendido),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Total Ventas</h3>
            <p className="text-2xl font-bold text-success">${resumen.total_monto.toFixed(2)}</p>
            <p className="text-sm text-text-tertiary">{resumen.total_ventas} ventas</p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Promedio por Venta</h3>
            <p className="text-2xl font-bold text-solid-color">${resumen.promedio_venta.toFixed(2)}</p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Productos Vendidos</h3>
            <p className="text-2xl font-bold text-solid-color">
              {productos_mas_vendidos.reduce((sum, p) => sum + p.total_vendido, 0)}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Ventas por Día</h3>
            <Bar data={ventasPorDia} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280' // text-text-tertiary
                  }
                }
              },
              scales: {
                y: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' } // border-border
                },
                x: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' }
                }
              }
            }} />
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Productos Más Vendidos</h3>
            <Pie data={productosMasVendidosData} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Tabla de productos más vendidos */}
        <div className="bg-bg p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Detalle de Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-interactive-component">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Unidades Vendidas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Total Vendido</th>
                </tr>
              </thead>
              <tbody className="bg-bg divide-y divide-border">
                {productos_mas_vendidos.map((producto, index) => (
                  <tr key={index} className="hover:bg-interactive-component/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accessibility-text">
                      {producto.producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {producto.total_vendido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      ${producto.total_monto.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar resumen de compras
  const renderComprasReport = () => {
    if (!resumenCompras) return null;

    const { resumen, productos_mas_comprados } = resumenCompras;

    // Datos para el gráfico de compras por día
    const comprasPorDia = {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [
        {
          label: 'Compras por día',
          data: [45, 39, 60, 71, 46, 45, 30], // TODO: Implementar datos reales
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };

    // Datos para el gráfico de productos más comprados
    const productosMasCompradosData = {
      labels: productos_mas_comprados.map(p => p.producto.nombre),
      datasets: [
        {
          label: 'Unidades compradas',
          data: productos_mas_comprados.map(p => p.total_comprado),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Total Compras</h3>
            <p className="text-2xl font-bold text-error">${resumen.total_monto.toFixed(2)}</p>
            <p className="text-sm text-text-tertiary">{resumen.total_compras} compras</p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Promedio por Compra</h3>
            <p className="text-2xl font-bold text-solid-color">${resumen.promedio_compra.toFixed(2)}</p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Productos Comprados</h3>
            <p className="text-2xl font-bold text-solid-color">
              {productos_mas_comprados.reduce((sum, p) => sum + p.total_comprado, 0)}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Compras por Día</h3>
            <Bar data={comprasPorDia} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280'
                  }
                }
              },
              scales: {
                y: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' }
                },
                x: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' }
                }
              }
            }} />
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Productos Más Comprados</h3>
            <Pie data={productosMasCompradosData} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Tabla de productos más comprados */}
        <div className="bg-bg p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Detalle de Productos Más Comprados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-interactive-component">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Unidades Compradas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Total Comprado</th>
                </tr>
              </thead>
              <tbody className="bg-bg divide-y divide-border">
                {productos_mas_comprados.map((producto, index) => (
                  <tr key={index} className="hover:bg-interactive-component/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accessibility-text">
                      {producto.producto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {producto.total_comprado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      ${producto.total_monto.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar resumen de inventario
  const renderInventarioReport = () => {
    if (!resumenMovimientos) return null;

    // Datos para el gráfico de movimientos por tipo
    const movimientosPorTipo = {
      labels: ['Entradas', 'Salidas', 'Ajustes'],
      datasets: [
        {
          label: 'Movimientos por tipo',
          data: [
            resumenMovimientos.find(m => m.tipo === 'entrada')?.total_movimientos || 0,
            resumenMovimientos.find(m => m.tipo === 'salida')?.total_movimientos || 0,
            resumenMovimientos.find(m => m.tipo === 'ajuste')?.total_movimientos || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    // Datos para el gráfico de cantidad por tipo de movimiento
    const cantidadPorTipo = {
      labels: ['Entradas', 'Salidas', 'Ajustes'],
      datasets: [
        {
          label: 'Cantidad por tipo',
          data: [
            resumenMovimientos.find(m => m.tipo === 'entrada')?.total_cantidad || 0,
            resumenMovimientos.find(m => m.tipo === 'salida')?.total_cantidad || 0,
            resumenMovimientos.find(m => m.tipo === 'ajuste')?.total_cantidad || 0
          ],
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Total Movimientos</h3>
            <p className="text-2xl font-bold text-solid-color">
              {resumenMovimientos.reduce((sum, m) => sum + m.total_movimientos, 0)}
            </p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Total Entradas</h3>
            <p className="text-2xl font-bold text-success">
              {resumenMovimientos.find(m => m.tipo === 'entrada')?.total_cantidad || 0}
            </p>
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary">Total Salidas</h3>
            <p className="text-2xl font-bold text-error">
              {resumenMovimientos.find(m => m.tipo === 'salida')?.total_cantidad || 0}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Movimientos por Tipo</h3>
            <Pie data={movimientosPorTipo} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280'
                  }
                }
              }
            }} />
          </div>
          <div className="bg-bg p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-text-secondary mb-4">Cantidad por Tipo de Movimiento</h3>
            <Bar data={cantidadPorTipo} options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#6B7280'
                  }
                }
              },
              scales: {
                y: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' }
                },
                x: {
                  ticks: { color: '#6B7280' },
                  grid: { color: '#374151' }
                }
              }
            }} />
          </div>
        </div>

        {/* Tabla de resumen de movimientos */}
        <div className="bg-bg p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Detalle de Movimientos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-interactive-component">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Total Movimientos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Total Cantidad</th>
                </tr>
              </thead>
              <tbody className="bg-bg divide-y divide-border">
                {resumenMovimientos.map((movimiento, index) => (
                  <tr key={index} className="hover:bg-interactive-component/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accessibility-text">
                      {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {movimiento.total_movimientos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-tertiary">
                      {movimiento.total_cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accessibility-text mb-4">Reportes</h1>
        
        {/* Selector de fechas */}
        <div className="bg-bg p-4 rounded-lg border border-border mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Fecha Inicio</label>
              <input
                type="date"
                value={format(fechaInicio, 'yyyy-MM-dd')}
                onChange={(e) => setFechaInicio(new Date(e.target.value))}
                className="mt-1 block w-full rounded-lg bg-bg border border-border shadow-sm focus:border-solid-color focus:ring-2 focus:ring-solid-color focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Fecha Fin</label>
              <input
                type="date"
                value={format(fechaFin, 'yyyy-MM-dd')}
                onChange={(e) => setFechaFin(new Date(e.target.value))}
                className="mt-1 block w-full rounded-lg bg-bg border border-border shadow-sm focus:border-solid-color focus:ring-2 focus:ring-solid-color focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div className="flex-grow"></div>
            <button
              onClick={() => exportarReporte()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-solid-color hover:bg-solid-color-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solid-color transition-colors duration-200"
            >
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('ventas')}
              className={`${
                activeTab === 'ventas'
                  ? 'border-solid-color text-solid-color'
                  : 'border-transparent text-text-tertiary hover:text-accessibility-text hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Ventas
            </button>
            <button
              onClick={() => setActiveTab('compras')}
              className={`${
                activeTab === 'compras'
                  ? 'border-solid-color text-solid-color'
                  : 'border-transparent text-text-tertiary hover:text-accessibility-text hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Compras
            </button>
            <button
              onClick={() => setActiveTab('inventario')}
              className={`${
                activeTab === 'inventario'
                  ? 'border-solid-color text-solid-color'
                  : 'border-transparent text-text-tertiary hover:text-accessibility-text hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Inventario
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solid-color"></div>
          </div>
        ) : error ? (
          <div className="bg-error/10 border-l-4 border-error p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'ventas' && renderVentasReport()}
            {activeTab === 'compras' && renderComprasReport()}
            {activeTab === 'inventario' && renderInventarioReport()}
          </>
        )}
      </div>
    </div>
  );
};

export default Reportes; 