<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\Compra;
use App\Models\Usuario;
use App\Models\Movimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas generales
     */
    public function getStats()
    {
        try {
            Log::info('Iniciando obtención de estadísticas del dashboard');

            // Verificar conexión a la base de datos
            DB::connection()->getPdo();
            Log::info('Conexión a la base de datos establecida');

            // Obtener totales con manejo de errores individual
            try {
                $totalProductos = Producto::count();
                Log::info('Total productos obtenido: ' . $totalProductos);
            } catch (\Exception $e) {
                Log::error('Error al obtener total de productos: ' . $e->getMessage());
                $totalProductos = 0;
            }

            try {
                $totalVentas = Venta::where('estado', 'completada')->sum('total');
                Log::info('Total ventas obtenido: ' . $totalVentas);
            } catch (\Exception $e) {
                Log::error('Error al obtener total de ventas: ' . $e->getMessage());
                $totalVentas = 0;
            }

            try {
                $totalCompras = Compra::where('estado', 'completada')->sum('total');
                Log::info('Total compras obtenido: ' . $totalCompras);
            } catch (\Exception $e) {
                Log::error('Error al obtener total de compras: ' . $e->getMessage());
                $totalCompras = 0;
            }

            try {
                $totalUsuarios = Usuario::where('activo', 1)->count();
                Log::info('Total usuarios obtenido: ' . $totalUsuarios);
            } catch (\Exception $e) {
                Log::error('Error al obtener total de usuarios: ' . $e->getMessage());
                $totalUsuarios = 0;
            }

            // Calcular porcentajes de cambio con manejo de errores individual
            try {
                $ventasMesActual = Venta::where('estado', 'completada')
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->sum('total');
                $ventasMesAnterior = Venta::where('estado', 'completada')
                    ->whereMonth('created_at', Carbon::now()->subMonth()->month)
                    ->sum('total');
                $cambioVentas = $ventasMesAnterior > 0
                    ? (($ventasMesActual - $ventasMesAnterior) / $ventasMesAnterior) * 100
                    : 0;
                Log::info('Cambio en ventas calculado: ' . $cambioVentas . '%');
            } catch (\Exception $e) {
                Log::error('Error al calcular cambio en ventas: ' . $e->getMessage());
                $cambioVentas = 0;
            }

            try {
                $productosMesActual = Producto::whereMonth('created_at', Carbon::now()->month)->count();
                $productosMesAnterior = Producto::whereMonth('created_at', Carbon::now()->subMonth()->month)->count();
                $cambioProductos = $productosMesAnterior > 0
                    ? (($productosMesActual - $productosMesAnterior) / $productosMesAnterior) * 100
                    : 0;
                Log::info('Cambio en productos calculado: ' . $cambioProductos . '%');
            } catch (\Exception $e) {
                Log::error('Error al calcular cambio en productos: ' . $e->getMessage());
                $cambioProductos = 0;
            }

            try {
                $usuariosMesActual = Usuario::where('activo', 1)
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->count();
                $usuariosMesAnterior = Usuario::where('activo', 1)
                    ->whereMonth('created_at', Carbon::now()->subMonth()->month)
                    ->count();
                $cambioUsuarios = $usuariosMesAnterior > 0
                    ? (($usuariosMesActual - $usuariosMesAnterior) / $usuariosMesAnterior) * 100
                    : 0;
                Log::info('Cambio en usuarios calculado: ' . $cambioUsuarios . '%');
            } catch (\Exception $e) {
                Log::error('Error al calcular cambio en usuarios: ' . $e->getMessage());
                $cambioUsuarios = 0;
            }

            $response = [
                'totalProductos' => $totalProductos,
                'totalVentas' => $totalVentas,
                'totalCompras' => $totalCompras,
                'totalUsuarios' => $totalUsuarios,
                'cambios' => [
                    'ventas' => [
                        'valor' => $cambioVentas,
                        'tendencia' => $cambioVentas >= 0 ? 'up' : 'down'
                    ],
                    'productos' => [
                        'valor' => $cambioProductos,
                        'tendencia' => $cambioProductos >= 0 ? 'up' : 'down'
                    ],
                    'usuarios' => [
                        'valor' => $cambioUsuarios,
                        'tendencia' => $cambioUsuarios >= 0 ? 'up' : 'down'
                    ]
                ]
            ];

            Log::info('Estadísticas del dashboard obtenidas exitosamente', $response);
            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error general al obtener estadísticas: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    /**
     * Obtener ventas por mes
     */
    public function getVentasPorMes()
    {
        try {
            Log::info('Iniciando obtención de ventas por mes');

            // Verificar si la tabla ventas existe
            if (!Schema::hasTable('ventas')) {
                Log::error('La tabla ventas no existe en la base de datos');
                return response()->json([
                    'message' => 'Error al obtener ventas por mes',
                    'error' => 'La tabla ventas no existe'
                ], 500);
            }

            // Obtener el año actual
            $añoActual = Carbon::now()->year;
            Log::info('Obteniendo ventas para el año: ' . $añoActual);

            // Obtener ventas por mes
            $ventasPorMes = Venta::whereYear('created_at', $añoActual)
                ->select(
                    DB::raw('MONTH(created_at) as mes'),
                    DB::raw('COALESCE(SUM(total), 0) as total')
                )
                ->groupBy('mes')
                ->orderBy('mes')
                ->get();

            Log::info('Ventas por mes obtenidas: ' . $ventasPorMes->count() . ' registros');

            // Mapear los resultados y asegurar que todos los meses estén presentes
            $ventasPorMes = $ventasPorMes->map(function ($item) {
                return [
                    'mes' => Carbon::create()->month($item->mes)->format('M'),
                    'total' => (float) $item->total
                ];
            });

            // Asegurar que todos los meses del año estén presentes
            $todosLosMeses = collect(range(1, 12))->map(function ($mes) {
                return [
                    'mes' => Carbon::create()->month($mes)->format('M'),
                    'total' => 0
                ];
            });

            // Combinar los meses existentes con los faltantes
            $ventasPorMes = $todosLosMeses->map(function ($mes) use ($ventasPorMes) {
                $ventaExistente = $ventasPorMes->firstWhere('mes', $mes['mes']);
                return $ventaExistente ?? $mes;
            })->values();

            Log::info('Ventas por mes procesadas exitosamente', ['data' => $ventasPorMes->toArray()]);
            return response()->json($ventasPorMes);

        } catch (\Exception $e) {
            Log::error('Error general al obtener ventas por mes: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al obtener ventas por mes',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    /**
     * Obtener productos más vendidos
     */
    public function getProductosMasVendidos()
    {
        try {
            Log::info('Iniciando obtención de productos más vendidos');

            // Verificar si hay ventas en la base de datos
            $totalVentas = Venta::count();
            Log::info('Total de ventas: ' . $totalVentas);

            if ($totalVentas === 0) {
                Log::info('No hay ventas, retornando array vacío');
                return response()->json([]);
            }

            try {
                $productosMasVendidos = DB::table('venta_detalles')
                    ->join('ventas', 'venta_detalles.venta_id', '=', 'ventas.id')
                    ->join('productos', 'venta_detalles.producto_id', '=', 'productos.id')
                    ->select(
                        'productos.id',
                        'productos.nombre',
                        DB::raw('SUM(venta_detalles.cantidad) as total_vendido'),
                        DB::raw('SUM(venta_detalles.precio_unitario * venta_detalles.cantidad) as total_ingresos')
                    )
                    ->groupBy('productos.id', 'productos.nombre')
                    ->orderBy('total_vendido', 'desc')
                    ->limit(5)
                    ->get();

                Log::info('Productos más vendidos obtenidos: ' . $productosMasVendidos->count() . ' registros');
                return response()->json($productosMasVendidos);

            } catch (\Exception $e) {
                Log::error('Error al consultar productos más vendidos: ' . $e->getMessage(), [
                    'sql' => $e instanceof \Illuminate\Database\QueryException ? $e->getSql() : null,
                    'bindings' => $e instanceof \Illuminate\Database\QueryException ? $e->getBindings() : null
                ]);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error general al obtener productos más vendidos: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al obtener productos más vendidos',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    /**
     * Obtener productos con stock bajo
     */
    public function getProductosStockBajo(Request $request)
    {
        try {
            $sedeId = $request->user()->sede_id;

            $productos = Producto::select('productos.id', 'productos.nombre', 'productos.stock_minimo')
                ->join('producto_sede', 'productos.id', '=', 'producto_sede.producto_id')
                ->where('producto_sede.sede_id', $sedeId)
                ->whereRaw('producto_sede.stock < productos.stock_minimo')
                ->orderByRaw('productos.stock_minimo - producto_sede.stock DESC')
                ->limit(5)
                ->get()
                ->map(function ($producto) {
                    return [
                        'id' => $producto->id,
                        'nombre' => $producto->nombre,
                        'stock' => $producto->sedes->first()->pivot->stock,
                        'stock_minimo' => $producto->stock_minimo
                    ];
                });

            return response()->json(['data' => $productos]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener productos con stock bajo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener últimas ventas
     */
    public function getUltimasVentas()
    {
        try {
            $ultimasVentas = Venta::with(['usuario'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($venta) {
                    return [
                        'id' => $venta->id,
                        'total' => $venta->total,
                        'fecha' => $venta->created_at,
                        'usuario' => $venta->usuario->nombre
                    ];
                });

            return response()->json($ultimasVentas);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener últimas ventas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener últimas compras
     */
    public function getUltimasCompras()
    {
        try {
            $ultimasCompras = Compra::with(['usuario', 'proveedor'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($compra) {
                    return [
                        'id' => $compra->id,
                        'total' => $compra->total,
                        'estado' => $compra->estado,
                        'fecha' => $compra->created_at,
                        'usuario' => $compra->usuario->nombre,
                        'proveedor' => $compra->proveedor->nombre
                    ];
                });

            return response()->json($ultimasCompras);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener últimas compras',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener últimos movimientos
     */
    public function getUltimosMovimientos(Request $request)
    {
        try {
            $sedeId = $request->user()->sede_id;

            $ultimosMovimientos = Movimiento::with(['usuario', 'producto'])
                ->whereHas('producto.sedes', function($query) use ($sedeId) {
                    $query->where('sedes.id', $sedeId);
                })
                ->orderBy('fecha', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($movimiento) {
                    return [
                        'id' => $movimiento->id,
                        'tipo' => $movimiento->tipo,
                        'cantidad' => $movimiento->cantidad,
                        'fecha' => $movimiento->fecha,
                        'usuario' => $movimiento->usuario->nombre,
                        'producto' => $movimiento->producto->nombre
                    ];
                });

            return response()->json(['data' => $ultimosMovimientos]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener últimos movimientos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
