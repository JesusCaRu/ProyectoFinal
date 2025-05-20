<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CompraDetalle;
use App\Models\Compra;
use App\Models\Producto;
use App\Models\Movimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CompraDetalleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $detalles = CompraDetalle::with(['compra.proveedor', 'producto'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['data' => $detalles]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'compra_id' => 'required|exists:compras,id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Verificar que la compra esté en estado pendiente
            $compra = Compra::findOrFail($request->compra_id);
            if ($compra->estado !== 'pendiente') {
                return response()->json([
                    'message' => 'No se pueden agregar detalles a una compra que no está pendiente'
                ], 422);
            }

            // Crear el detalle
            $detalle = CompraDetalle::create($request->all());

            // Actualizar el total de la compra
            $compra->total = $compra->detalles()->sum(DB::raw('cantidad * precio_unitario'));
            $compra->save();

            DB::commit();
            return response()->json([
                'data' => $detalle->load(['compra.proveedor', 'producto']),
                'message' => 'Detalle de compra agregado correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al agregar el detalle de compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CompraDetalle $detalle)
    {
        return response()->json([
            'data' => $detalle->load(['compra.proveedor', 'producto'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CompraDetalle $detalle)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Verificar que la compra esté en estado pendiente
            if ($detalle->compra->estado !== 'pendiente') {
                return response()->json([
                    'message' => 'No se pueden modificar detalles de una compra que no está pendiente'
                ], 422);
            }

            // Actualizar el detalle
            $detalle->update($request->all());

            // Actualizar el total de la compra
            $compra = $detalle->compra;
            $compra->total = $compra->detalles()->sum(DB::raw('cantidad * precio_unitario'));
            $compra->save();

            DB::commit();
            return response()->json([
                'data' => $detalle->load(['compra.proveedor', 'producto']),
                'message' => 'Detalle de compra actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el detalle de compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompraDetalle $detalle)
    {
        try {
            DB::beginTransaction();

            // Verificar que la compra esté en estado pendiente
            if ($detalle->compra->estado !== 'pendiente') {
                return response()->json([
                    'message' => 'No se pueden eliminar detalles de una compra que no está pendiente'
                ], 422);
            }

            // Actualizar el total de la compra antes de eliminar el detalle
            $compra = $detalle->compra;
            $detalle->delete();
            $compra->total = $compra->detalles()->sum(DB::raw('cantidad * precio_unitario'));
            $compra->save();

            DB::commit();
            return response()->json([
                'message' => 'Detalle de compra eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el detalle de compra',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles por compra
     */
    public function getByCompra($compraId)
    {
        $detalles = CompraDetalle::with(['compra.proveedor', 'producto'])
            ->where('compra_id', $compraId)
            ->get();

        return response()->json(['data' => $detalles]);
    }

    /**
     * Obtener detalles por producto
     */
    public function getByProducto($productoId)
    {
        $detalles = CompraDetalle::with(['compra.proveedor', 'producto'])
            ->where('producto_id', $productoId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $detalles]);
    }
}
