<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Movimiento;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MovimientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $movimientos = Movimiento::with(['producto', 'usuario'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['data' => $movimientos]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'producto_id' => 'required|exists:productos,id',
            'tipo' => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|integer|min:1',
            'descripcion' => 'required|string|max:255',
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $producto = Producto::findOrFail($request->producto_id);
            $usuario = $request->user();

            // Verificar stock suficiente para salidas
            if ($request->tipo === 'salida' && $producto->stock < $request->cantidad) {
                return response()->json([
                    'message' => 'Stock insuficiente para realizar la salida'
                ], 422);
            }

            // Crear el movimiento
            $movimiento = Movimiento::create([
                'producto_id' => $request->producto_id,
                'usuario_id' => $usuario->id,
                'tipo' => $request->tipo,
                'cantidad' => $request->cantidad,
                'descripcion' => $request->descripcion,
                'fecha' => $request->fecha
            ]);

            // Actualizar el stock del producto
            if ($request->tipo === 'entrada') {
                $producto->stock += $request->cantidad;
            } elseif ($request->tipo === 'salida') {
                $producto->stock -= $request->cantidad;
            } else { // ajuste
                $producto->stock = $request->cantidad;
            }
            $producto->save();

            DB::commit();
            return response()->json([
                'data' => $movimiento->load(['producto', 'usuario']),
                'message' => 'Movimiento registrado correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el movimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Movimiento $movimiento)
    {
        return response()->json([
            'data' => $movimiento->load(['producto', 'usuario'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Movimiento $movimiento)
    {
        $validator = Validator::make($request->all(), [
            'descripcion' => 'required|string|max:255',
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $movimiento->update($request->only(['descripcion', 'fecha']));

            DB::commit();
            return response()->json([
                'data' => $movimiento->load(['producto', 'usuario']),
                'message' => 'Movimiento actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el movimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Movimiento $movimiento)
    {
        try {
            DB::beginTransaction();

            $producto = $movimiento->producto;

            // Revertir el efecto del movimiento en el stock
            if ($movimiento->tipo === 'entrada') {
                $producto->stock -= $movimiento->cantidad;
            } elseif ($movimiento->tipo === 'salida') {
                $producto->stock += $movimiento->cantidad;
            }
            $producto->save();

            $movimiento->delete();

            DB::commit();
            return response()->json([
                'message' => 'Movimiento eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el movimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener movimientos por producto
     */
    public function getByProducto($productoId)
    {
        $movimientos = Movimiento::with(['producto', 'usuario'])
            ->where('producto_id', $productoId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $movimientos]);
    }

    /**
     * Obtener movimientos por sede
     */
    public function getBySede($sedeId)
    {
        $movimientos = Movimiento::with(['producto', 'usuario'])
            ->whereHas('producto', function ($query) use ($sedeId) {
                $query->where('sede_id', $sedeId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $movimientos]);
    }

    /**
     * Obtener movimientos por rango de fechas
     */
    public function getByDateRange(Request $request)
    {
        try {
            Log::info('Iniciando getByDateRange con datos:', $request->query());

            $validator = Validator::make($request->query(), [
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $fechaInicio = Carbon::parse($request->query('fecha_inicio'))->startOfDay();
            $fechaFin = Carbon::parse($request->query('fecha_fin'))->endOfDay();
            $sedeId = $request->user()->sede_id;

            Log::info('Parámetros procesados:', [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'sede_id' => $sedeId
            ]);

            // Obtener movimientos de la sede
            $movimientos = Movimiento::with(['producto', 'usuario', 'sede', 'sedeOrigen', 'sedeDestino'])
                ->where(function($query) use ($sedeId) {
                    $query->where('sede_id', $sedeId)
                          ->orWhere('sede_origen_id', $sedeId)
                          ->orWhere('sede_destino_id', $sedeId);
                })
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->orderBy('fecha', 'desc')
                ->get();

            Log::info('Movimientos encontrados:', ['count' => $movimientos->count()]);

            // Obtener resumen de movimientos
            $resumen = Movimiento::where(function($query) use ($sedeId) {
                    $query->where('sede_id', $sedeId)
                          ->orWhere('sede_origen_id', $sedeId)
                          ->orWhere('sede_destino_id', $sedeId);
                })
                ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                ->select('tipo', DB::raw('COUNT(*) as total_movimientos'), DB::raw('SUM(cantidad) as total_cantidad'))
                ->groupBy('tipo')
                ->get();

            Log::info('Resumen generado:', ['resumen' => $resumen->toArray()]);

            return response()->json([
                'data' => $movimientos,
                'resumen' => $resumen
            ]);

        } catch (\Exception $e) {
            Log::error('Error en getByDateRange:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener los movimientos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resumen de movimientos
     */
    public function getResumen(Request $request)
    {
        try {
            Log::info('Iniciando getResumen con datos:', $request->query());

            $validator = Validator::make($request->query(), [
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $fechaInicio = Carbon::parse($request->query('fecha_inicio'))->startOfDay();
            $fechaFin = Carbon::parse($request->query('fecha_fin'))->endOfDay();

            // Obtener resumen de movimientos sin filtrar por sede
            $queryMovimientos = Movimiento::whereBetween('fecha', [$fechaInicio, $fechaFin]);

            Log::info('Query movimientos:', ['sql' => $queryMovimientos->toSql()]);

            $resumenMovimientos = $queryMovimientos
                ->select(
                    'tipo',
                    DB::raw('COUNT(*) as total_movimientos'),
                    DB::raw('SUM(cantidad) as total_cantidad')
                )
                ->groupBy('tipo')
                ->get();

            Log::info('Resumen de movimientos:', ['movimientos' => $resumenMovimientos->toArray()]);

            // Obtener resumen de compras sin filtrar por sede
            $queryCompras = DB::table('compras')
                ->join('compra_detalles', 'compras.id', '=', 'compra_detalles.compra_id')
                ->whereBetween('compras.created_at', [$fechaInicio, $fechaFin]);

            Log::info('Query compras:', ['sql' => $queryCompras->toSql()]);

            $resumenCompras = $queryCompras
                ->select(
                    DB::raw('"entrada" as tipo'),
                    DB::raw('COUNT(DISTINCT compras.id) as total_movimientos'),
                    DB::raw('COALESCE(SUM(compra_detalles.cantidad), 0) as total_cantidad')
                )
                ->groupBy(DB::raw('"entrada"'))
                ->get();

            Log::info('Resumen de compras:', ['compras' => $resumenCompras->toArray()]);

            // Combinar los resultados
            $resumen = collect([...$resumenMovimientos, ...$resumenCompras])
                ->groupBy('tipo')
                ->map(function ($group) {
                    return [
                        'tipo' => $group->first()->tipo,
                        'total_movimientos' => $group->sum('total_movimientos'),
                        'total_cantidad' => $group->sum('total_cantidad')
                    ];
                })
                ->values();

            Log::info('Resumen final:', ['resumen' => $resumen->toArray()]);

            // Si no hay datos, devolver array vacío
            if ($resumen->isEmpty()) {
                Log::info('No se encontraron datos para el resumen');
                return response()->json([
                    'data' => [],
                    'message' => 'No se encontraron movimientos en el período especificado'
                ]);
            }

            return response()->json([
                'data' => $resumen,
                'message' => 'Resumen de movimientos obtenido correctamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error en getResumen:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al obtener el resumen de movimientos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
