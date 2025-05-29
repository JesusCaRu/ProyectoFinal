<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\CompraDetalle;
use App\Models\Producto;
use App\Models\Movimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompraController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sedeId = $request->user()->sede_id;
        $compras = Compra::with(['proveedor', 'detalles.producto'])
            ->where('sede_id', $sedeId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['data' => $compras]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Iniciando creación de compra con datos:', $request->all());

            $validator = Validator::make($request->all(), [
                'proveedor_id' => 'required|exists:proveedores,id',
                'productos' => 'required|array|min:1',
                'productos.*.producto_id' => 'required|exists:productos,id',
                'productos.*.cantidad' => 'required|integer|min:1',
                'productos.*.precio_unitario' => 'required|numeric|min:0',
                'fecha' => 'required|date',
                'sede_id' => 'required|exists:sedes,id'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                // Calcular total
                $total = 0;
                $productos = [];
                foreach ($request->productos as $item) {
                    Log::info('Procesando producto:', $item);

                    $producto = Producto::findOrFail($item['producto_id']);
                    Log::info('Producto encontrado:', $producto->toArray());

                    $productos[] = [
                        'producto' => $producto,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario']
                    ];

                    $total += $item['precio_unitario'] * $item['cantidad'];
                }

                Log::info('Total calculado:', ['total' => $total]);

                // Convertir la fecha al formato correcto de MySQL
                $fecha = Carbon::parse($request->fecha)->format('Y-m-d H:i:s');
                Log::info('Fecha convertida:', ['fecha_original' => $request->fecha, 'fecha_convertida' => $fecha]);

                // Crear la compra
                $compra = Compra::create([
                    'proveedor_id' => $request->proveedor_id,
                    'usuario_id' => $request->user()->id,
                    'sede_id' => $request->sede_id,
                    'total' => $total,
                    'created_at' => $fecha,
                    'estado' => 'pendiente'
                ]);

                Log::info('Compra creada:', $compra->toArray());

                // Crear los detalles y actualizar stock
                foreach ($productos as $item) {
                    Log::info('Creando detalle de compra:', [
                        'compra_id' => $compra->id,
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad']
                    ]);

                    // Crear detalle de compra
                    CompraDetalle::create([
                        'compra_id' => $compra->id,
                        'producto_id' => $item['producto']->id,
                        'cantidad' => $item['cantidad'],
                        'precio_unitario' => $item['precio_unitario']
                    ]);

                    // Registrar movimiento
                    Movimiento::create([
                        'producto_id' => $item['producto']->id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'entrada',
                        'cantidad' => $item['cantidad'],
                        'descripcion' => 'Compra #' . $compra->id,
                        'fecha' => $fecha,
                        'sede_id' => $request->sede_id
                    ]);

                    Log::info('Movimiento registrado para producto:', [
                        'producto' => $item['producto']->nombre,
                        'cantidad' => $item['cantidad'],
                        'sede_id' => $request->sede_id
                    ]);
                }

                DB::commit();
                Log::info('Compra completada exitosamente');

                return response()->json([
                    'data' => $compra->load(['proveedor', 'detalles.producto']),
                    'message' => 'Compra registrada correctamente'
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
            Log::error('Error al registrar la compra:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al registrar la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Compra $compra)
    {
        $sedeId = $request->user()->sede_id;
        if ($compra->sede_id !== $sedeId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json([
            'data' => $compra->load(['proveedor', 'detalles.producto'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Compra $compra)
    {
        try {
            $validator = Validator::make($request->all(), [
                'estado' => 'required|in:pendiente,completada,cancelada'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Estado inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Validar si se puede cambiar el estado
            if (!$compra->puedeCambiarEstado($request->estado)) {
                DB::rollBack();
                return response()->json([
                    'message' => 'No se puede cambiar el estado de la compra. La compra ya está completada o cancelada.'
                ], 422);
            }

            // Si la compra está pendiente y se va a completar
            if ($compra->estado === 'pendiente' && $request->estado === 'completada') {
                foreach ($compra->detalles as $detalle) {
                    $producto = $detalle->producto;
                    $sedeId = $compra->sede_id;

                    // Buscar el registro en producto_sede
                    $pivot = $producto->sedes()->where('sedes.id', $sedeId)->first();

                    if ($pivot && $pivot->pivot) {
                        $nuevoStock = $pivot->pivot->stock + $detalle->cantidad;
                        $producto->sedes()->updateExistingPivot($sedeId, ['stock' => $nuevoStock]);
                    }

                    // Registrar movimiento de entrada
                    Movimiento::create([
                        'producto_id' => $producto->id,
                        'usuario_id' => $request->user()->id,
                        'tipo' => 'entrada',
                        'cantidad' => $detalle->cantidad,
                        'descripcion' => 'Compra #' . $compra->id . ' completada',
                        'fecha' => now(),
                        'sede_id' => $sedeId
                    ]);
                }
            }

            $compra->estado = $request->estado;
            try {
                $compra->save();
            } catch (\Exception $e) {
                // Si falla por los timestamps, intentamos actualizar directamente
                DB::table('compras')
                    ->where('id', $compra->id)
                    ->update(['estado' => $request->estado]);
            }

            DB::commit();
            return response()->json([
                'data' => $compra->load(['proveedor', 'detalles.producto']),
                'message' => 'Estado de la compra actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar el estado de la compra:', [
                'compra_id' => $compra->id,
                'nuevo_estado' => $request->estado,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al actualizar el estado de la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Compra $compra)
    {
        if ($compra->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Solo se pueden eliminar compras en estado pendiente'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Eliminar detalles y la compra
            $compra->detalles()->delete();
            $compra->delete();

            DB::commit();
            return response()->json([
                'message' => 'Compra eliminada correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar la compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener compras por rango de fechas
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
        $compras = Compra::with(['proveedor', 'detalles.producto'])
            ->where('sede_id', $sedeId)
            ->whereBetween('created_at', [
                Carbon::parse($request->fecha_inicio)->startOfDay(),
                Carbon::parse($request->fecha_fin)->endOfDay()
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $compras]);
    }

    /**
     * Obtener resumen de compras
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

            // Obtener resumen de compras solo de la sede
            $resumen = DB::table('compras')
                ->where('sede_id', $sedeId)
                ->whereBetween('created_at', [$fechaInicio, $fechaFin])
                ->selectRaw('
                    COUNT(*) as total_compras,
                    COALESCE(SUM(total), 0) as total_monto,
                    COALESCE(AVG(total), 0) as promedio_compra
                ')
                ->first();

            // Obtener productos más comprados solo de la sede
            $productosMasComprados = DB::table('compra_detalles')
                ->join('compras', 'compras.id', '=', 'compra_detalles.compra_id')
                ->join('productos', 'productos.id', '=', 'compra_detalles.producto_id')
                ->where('compras.sede_id', $sedeId)
                ->whereBetween('compras.created_at', [$fechaInicio, $fechaFin])
                ->select(
                    'productos.id as producto_id',
                    'productos.nombre as producto_nombre',
                    DB::raw('SUM(compra_detalles.cantidad) as total_comprado'),
                    DB::raw('SUM(compra_detalles.cantidad * compra_detalles.precio_unitario) as total_monto')
                )
                ->groupBy('productos.id', 'productos.nombre')
                ->orderBy('total_comprado', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'producto' => [
                            'id' => $item->producto_id,
                            'nombre' => $item->producto_nombre
                        ],
                        'total_comprado' => (int)$item->total_comprado,
                        'total_monto' => (float)$item->total_monto
                    ];
                });

            return response()->json([
                'data' => [
                    'resumen' => [
                        'total_compras' => (int)$resumen->total_compras,
                        'total_monto' => (float)$resumen->total_monto,
                        'promedio_compra' => (float)$resumen->promedio_compra
                    ],
                    'productos_mas_comprados' => $productosMasComprados
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el resumen de compras',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
