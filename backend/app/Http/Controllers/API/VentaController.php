<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\VentaDetalle;
use App\Models\Producto;
use App\Models\Movimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Helpers\NotificationHelper;
use App\Models\Sede;
use App\Helpers\ActivityHelper;

class VentaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sedeId = $request->user()->sede_id;
        $ventas = Venta::with(['usuario', 'detalles.producto'])
            ->where('sede_id', $sedeId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['data' => $ventas]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Iniciando creación de venta con datos:', $request->all());

            $validator = Validator::make($request->all(), [
                'productos' => 'required|array|min:1',
                'productos.*.producto_id' => 'required|exists:productos,id',
                'productos.*.cantidad' => 'required|integer|min:1',
                'sede_id' => 'required|exists:sedes,id',
                'fecha' => 'required|date'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                $total = 0;
                $productos = [];
                $sedeId = $request->sede_id;
                foreach ($request->productos as $item) {
                    Log::info('Procesando producto:', $item);

                    $producto = Producto::findOrFail($item['producto_id']);
                    Log::info('Producto encontrado:', $producto->toArray());

                    // Buscar el registro en producto_sede
                    $pivot = $producto->sedes()->where('sedes.id', $sedeId)->first();
                    Log::info('Pivot encontrado:', [
                        'producto_id' => $producto->id,
                        'sede_id' => $sedeId,
                        'pivot' => $pivot,
                        'pivot_stock' => $pivot?->pivot?->stock
                    ]);

                    if (!$pivot || !$pivot->pivot) {
                        return response()->json([
                            'message' => "El producto {$producto->nombre} no está disponible en la sede seleccionada"
                        ], 422);
                    }

                    $stockActual = $pivot->pivot->stock ?? 0;

                    if ($stockActual < $item['cantidad']) {
                        return response()->json([
                            'message' => "Stock insuficiente para el producto {$producto->nombre} en la sede seleccionada (stock actual: $stockActual)"
                        ], 422);
                    }

                    $productos[] = [
                        'producto' => $producto,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $pivot->pivot->precio_venta
                    ];

                    $total += $pivot->pivot->precio_venta * $item['cantidad'];
                }

                Log::info('Total calculado:', ['total' => $total]);

                $fecha = Carbon::parse($request->fecha)->format('Y-m-d H:i:s');
                Log::info('Fecha convertida:', ['fecha_original' => $request->fecha, 'fecha_convertida' => $fecha]);

                $venta = Venta::create([
                    'usuario_id' => $request->user()->id,
                    'total' => $total,
                    'sede_id' => $sedeId
                ]);

                Log::info('Venta creada:', $venta->toArray());

                foreach ($productos as $item) {
                    Log::info('Creando detalle de venta:', [
                        'venta_id' => $venta->id,
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad']
                    ]);

                    VentaDetalle::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $item['producto']->id,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario']
                    ]);

                    // Descontar stock en producto_sede
                    $pivot = $item['producto']->sedes()->where('sedes.id', $sedeId)->first();
                    $nuevoStock = $pivot->pivot->stock - $item['cantidad'];
                    $item['producto']->sedes()->updateExistingPivot($sedeId, [
                        'stock' => $nuevoStock
                    ]);

                    Log::info('Stock actualizado en producto_sede:', [
                        'producto' => $item['producto']->nombre,
                        'sede_id' => $sedeId,
                        'nuevo_stock' => $nuevoStock
                    ]);

                    // Verificar si el stock está por debajo del mínimo y enviar notificación
                    if ($nuevoStock <= $item['producto']->stock_minimo) {
                        $sede = Sede::find($sedeId);
                        NotificationHelper::sendLowStockNotification($item['producto'], $sede, $nuevoStock);
                        Log::info('Notificación de stock bajo enviada:', [
                            'producto' => $item['producto']->nombre,
                            'sede_id' => $sedeId,
                            'stock_actual' => $nuevoStock,
                            'stock_minimo' => $item['producto']->stock_minimo
                        ]);
                    }

                    // Registrar movimiento
                    Movimiento::create([
                        'producto_id' => $item['producto']->id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'salida',
                        'cantidad' => $item['cantidad'],
                        'descripcion' => 'Venta #' . $venta->id,
                        'fecha' => $fecha,
                        'sede_id' => $sedeId
                    ]);

                    Log::info('Movimiento registrado para producto:', [
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad'],
                        'sede_id' => $sedeId
                    ]);
                }

                DB::commit();
                Log::info('Venta completada exitosamente');

                // Registrar actividad de venta
                ActivityHelper::log(
                    "Venta #{$venta->id} registrada por " . $request->user()->nombre,
                    'ventas',
                    [
                        'venta_id' => $venta->id,
                        'total' => $total,
                        'sede_id' => $sedeId,
                        'usuario_id' => $request->user()->id,
                        'productos' => $productos,
                        'tipo' => 'venta_creada'
                    ]
                );

                // Generar factura automáticamente
                try {
                    Log::info('Intentando generar factura automáticamente para la venta #' . $venta->id);
                    $facturaController = new \App\Http\Controllers\API\FacturaController();
                    $facturaController->generarFacturaVenta($request, $venta->id);
                    Log::info('Factura de venta generada automáticamente');
                } catch (\Exception $e) {
                    Log::error('Error al generar factura automáticamente: ' . $e->getMessage(), [
                        'venta_id' => $venta->id,
                        'error_trace' => $e->getTraceAsString()
                    ]);
                }

                return response()->json([
                    'data' => $venta->load(['usuario', 'detalles.producto']),
                    'message' => 'Venta registrada correctamente'
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error en la transacción:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error al registrar la venta:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al registrar la venta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Venta $venta)
    {
        $sedeId = $request->user()->sede_id;
        if ($venta->sede_id !== $sedeId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json([
            'data' => $venta->load(['usuario', 'detalles.producto'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Venta $venta)
    {
        return response()->json([
            'message' => 'No se pueden modificar las ventas registradas'
        ], 422);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Venta $venta)
    {
        return response()->json([
            'message' => 'No se pueden eliminar las ventas registradas'
        ], 422);
    }

    /**
     * Obtener ventas por rango de fechas
     */
    public function getByDateRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sedeId = $request->user()->sede_id;
        $ventas = Venta::with(['usuario', 'detalles.producto'])
            ->where('sede_id', $sedeId)
            ->whereBetween('created_at', [
                Carbon::parse($request->fecha_inicio)->startOfDay(),
                Carbon::parse($request->fecha_fin)->endOfDay()
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $ventas]);
    }

    /**
     * Obtener resumen de ventas
     */
    public function getResumen(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $fechaInicio = Carbon::parse($request->fecha_inicio)->startOfDay();
            $fechaFin = Carbon::parse($request->fecha_fin)->endOfDay();
            $sedeId = $request->user()->sede_id;

            // Obtener resumen de ventas solo de la sede
            $resumen = DB::table('ventas')
                ->where('sede_id', $sedeId)
                ->whereBetween('created_at', [$fechaInicio, $fechaFin])
                ->selectRaw('
                    COUNT(*) as total_ventas,
                    COALESCE(SUM(total), 0) as total_monto,
                    COALESCE(AVG(total), 0) as promedio_venta
                ')
                ->first();

            // Obtener productos más vendidos solo de la sede
            $productosMasVendidos = DB::table('venta_detalles')
                ->join('ventas', 'ventas.id', '=', 'venta_detalles.venta_id')
                ->join('productos', 'productos.id', '=', 'venta_detalles.producto_id')
                ->where('ventas.sede_id', $sedeId)
                ->whereBetween('ventas.created_at', [$fechaInicio, $fechaFin])
                ->select(
                    'productos.id as producto_id',
                    'productos.nombre as producto_nombre',
                    DB::raw('SUM(venta_detalles.cantidad) as total_vendido'),
                    DB::raw('SUM(venta_detalles.cantidad * venta_detalles.precio_unitario) as total_monto')
                )
                ->groupBy('productos.id', 'productos.nombre')
                ->orderBy('total_vendido', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'producto' => [
                            'id' => $item->producto_id,
                            'nombre' => $item->producto_nombre
                        ],
                        'total_vendido' => (int)$item->total_vendido,
                        'total_monto' => (float)$item->total_monto
                    ];
                });

            return response()->json([
                'data' => [
                    'resumen' => [
                        'total_ventas' => (int)$resumen->total_ventas,
                        'total_monto' => (float)$resumen->total_monto,
                        'promedio_venta' => (float)$resumen->promedio_venta
                    ],
                    'productos_mas_vendidos' => $productosMasVendidos
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el resumen de ventas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
