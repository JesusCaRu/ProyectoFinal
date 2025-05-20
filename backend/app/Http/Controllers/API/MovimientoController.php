<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Movimiento;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MovimientoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $movimientos = Movimiento::with(['producto', 'usuario', 'producto.sede'])
            ->orderBy('fecha', 'desc')
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
                'data' => $movimiento->load(['producto', 'usuario', 'producto.sede']),
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
            'data' => $movimiento->load(['producto', 'usuario', 'producto.sede'])
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
                'data' => $movimiento->load(['producto', 'usuario', 'producto.sede']),
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
        $movimientos = Movimiento::with(['producto', 'usuario', 'producto.sede'])
            ->where('producto_id', $productoId)
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json(['data' => $movimientos]);
    }

    /**
     * Obtener movimientos por sede
     */
    public function getBySede($sedeId)
    {
        $movimientos = Movimiento::with(['producto', 'usuario', 'producto.sede'])
            ->whereHas('producto', function ($query) use ($sedeId) {
                $query->where('sede_id', $sedeId);
            })
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json(['data' => $movimientos]);
    }

    /**
     * Obtener movimientos por rango de fechas
     */
    public function getByDateRange(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $movimientos = Movimiento::with(['producto', 'usuario', 'producto.sede'])
            ->whereBetween('fecha', [
                Carbon::parse($request->query('fecha_inicio'))->startOfDay(),
                Carbon::parse($request->query('fecha_fin'))->endOfDay()
            ])
            ->orderBy('fecha', 'desc')
            ->get();

        return response()->json(['data' => $movimientos]);
    }

    /**
     * Obtener resumen de movimientos
     */
    public function getResumen(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $resumen = Movimiento::select('tipo', DB::raw('COUNT(*) as total_movimientos'), DB::raw('SUM(cantidad) as total_cantidad'))
            ->whereBetween('fecha', [
                Carbon::parse($request->query('fecha_inicio'))->startOfDay(),
                Carbon::parse($request->query('fecha_fin'))->endOfDay()
            ])
            ->groupBy('tipo')
            ->get();

        return response()->json(['data' => $resumen]);
    }
}
