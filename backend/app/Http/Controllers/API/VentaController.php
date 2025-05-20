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

class VentaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ventas = Venta::with(['usuario', 'detalles.producto'])
            ->orderBy('fecha', 'desc')
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
                'fecha' => 'required|date'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                // Verificar stock y calcular total
                $total = 0;
                $productos = [];
                foreach ($request->productos as $item) {
                    Log::info('Procesando producto:', $item);

                    $producto = Producto::findOrFail($item['producto_id']);
                    Log::info('Producto encontrado:', $producto->toArray());

                    if ($producto->stock < $item['cantidad']) {
                        Log::warning('Stock insuficiente:', [
                            'producto' => $producto->nombre,
                            'stock_disponible' => $producto->stock,
                            'cantidad_solicitada' => $item['cantidad']
                        ]);
                        return response()->json([
                            'message' => "Stock insuficiente para el producto {$producto->nombre}"
                        ], 422);
                    }

                    $productos[] = [
                        'producto' => $producto,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $producto->precio_venta
                    ];

                    $total += $producto->precio_venta * $item['cantidad'];
                }

                Log::info('Total calculado:', ['total' => $total]);

                // Convertir la fecha al formato correcto de MySQL
                $fecha = Carbon::parse($request->fecha)->format('Y-m-d H:i:s');
                Log::info('Fecha convertida:', ['fecha_original' => $request->fecha, 'fecha_convertida' => $fecha]);

                // Crear la venta
                $venta = Venta::create([
                    'usuario_id' => $request->user()->id,
                    'total' => $total,
                    'fecha' => $fecha
                ]);

                Log::info('Venta creada:', $venta->toArray());

                // Crear los detalles y actualizar stock
                foreach ($productos as $item) {
                    Log::info('Creando detalle de venta:', [
                        'venta_id' => $venta->id,
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad']
                    ]);

                    // Crear detalle de venta
                    VentaDetalle::create([
                        'venta_id' => $venta->id,
                        'producto_id' => $item['producto']->id,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario']
                    ]);

                    // Actualizar stock
                    $item['producto']->stock -= $item['cantidad'];
                    $item['producto']->save();

                    Log::info('Stock actualizado:', [
                        'producto' => $item['producto']->nombre,
                        'nuevo_stock' => $item['producto']->stock
                    ]);

                    // Registrar movimiento
                    Movimiento::create([
                        'producto_id' => $item['producto']->id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'salida',
                        'cantidad' => $item['cantidad'],
                        'descripcion' => 'Venta #' . $venta->id,
                        'fecha' => $fecha
                    ]);

                    Log::info('Movimiento registrado para producto:', [
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad']
                    ]);
                }

                DB::commit();
                Log::info('Venta completada exitosamente');

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
    public function show(Venta $venta)
    {
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

        $ventas = Venta::with(['usuario', 'detalles.producto'])
            ->whereBetween('fecha', [
                Carbon::parse($request->fecha_inicio)->startOfDay(),
                Carbon::parse($request->fecha_fin)->endOfDay()
            ])
            ->orderBy('fecha', 'desc')
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

            // Obtener resumen de ventas
            $resumen = DB::table('ventas')
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->selectRaw('
                    COUNT(*) as total_ventas,
                    COALESCE(SUM(total), 0) as total_monto,
                    COALESCE(AVG(total), 0) as promedio_venta
                ')
                ->first();

            // Obtener productos más vendidos
            $productosMasVendidos = DB::table('venta_detalles')
                ->join('ventas', 'ventas.id', '=', 'venta_detalles.venta_id')
                ->join('productos', 'productos.id', '=', 'venta_detalles.producto_id')
                ->whereBetween('ventas.fecha', [$fechaInicio, $fechaFin])
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
