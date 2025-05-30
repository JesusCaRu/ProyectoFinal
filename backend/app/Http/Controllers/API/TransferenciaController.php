<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transferencia;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\Auth;

class TransferenciaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transferencias = Transferencia::with(['producto', 'sedeOrigen', 'sedeDestino'])->get();
        return response()->json(['data' => $transferencias]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Iniciando transferencia con datos:', $request->all());

            $validator = Validator::make($request->all(), [
                'producto_id' => 'required|exists:productos,id',
                'cantidad' => 'required|integer|min:1',
                'sede_origen_id' => 'required|exists:sedes,id',
                'sede_destino_id' => 'required|exists:sedes,id|different:sede_origen_id',
                'estado' => 'required|in:pendiente,enviado,recibido',
                'fecha' => 'required|date'
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación:', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $producto = Producto::findOrFail($request->producto_id);
            Log::info('Producto encontrado:', $producto->toArray());

            // Verificar stock en la sede origen
            $pivot = $producto->sedes()->where('sedes.id', $request->sede_origen_id)->first();
            Log::info('Pivot encontrado:', [
                'producto_id' => $producto->id,
                'sede_id' => $request->sede_origen_id,
                'pivot' => $pivot ? $pivot->toArray() : null
            ]);

            if (!$pivot || !$pivot->pivot) {
                Log::error('Producto no disponible en sede origen');
                return response()->json(['message' => 'El producto no está disponible en la sede origen'], 422);
            }

            $stockDisponible = $pivot->pivot->stock ?? 0;
            Log::info('Stock disponible:', [
                'stock' => $stockDisponible,
                'cantidad_solicitada' => $request->cantidad
            ]);

            if ($stockDisponible < $request->cantidad) {
                Log::error('Stock insuficiente', [
                    'stock_disponible' => $stockDisponible,
                    'cantidad_solicitada' => $request->cantidad
                ]);
                return response()->json(['message' => 'Stock insuficiente en la sede origen'], 422);
            }

            // Crear la transferencia con el estado como string y el usuario autenticado
            $transferencia = Transferencia::create([
                'producto_id' => $request->producto_id,
                'cantidad' => $request->cantidad,
                'sede_origen_id' => $request->sede_origen_id,
                'sede_destino_id' => $request->sede_destino_id,
                'estado' => 'pendiente',
                'fecha' => $request->fecha,
                'usuario_id' => Auth::check() ? Auth::user()->id : null // Guardar el ID del usuario autenticado si existe
            ]);

            Log::info('Transferencia creada:', $transferencia->toArray());

            // Enviar notificación de transferencia creada
            NotificationHelper::sendTransferNotification($transferencia, 'created');
            Log::info('Notificación de transferencia enviada');

            if ($request->estado === 'recibido') {
                // Descontar stock de la sede origen
                $nuevoStockOrigen = $stockDisponible - $request->cantidad;
                $producto->sedes()->updateExistingPivot($request->sede_origen_id, [
                    'stock' => $nuevoStockOrigen
                ]);
                Log::info('Stock actualizado en sede origen:', [
                    'sede_id' => $request->sede_origen_id,
                    'nuevo_stock' => $nuevoStockOrigen
                ]);

                // Aumentar stock en la sede destino
                $pivotDestino = $producto->sedes()->where('sedes.id', $request->sede_destino_id)->first();
                Log::info('Pivot destino encontrado:', [
                    'sede_id' => $request->sede_destino_id,
                    'pivot' => $pivotDestino ? $pivotDestino->toArray() : null
                ]);

                if ($pivotDestino && $pivotDestino->pivot) {
                    $stockDestino = $pivotDestino->pivot->stock ?? 0;
                    $producto->sedes()->updateExistingPivot($request->sede_destino_id, [
                        'stock' => $stockDestino + $request->cantidad
                    ]);
                    Log::info('Stock actualizado en sede destino:', [
                        'sede_id' => $request->sede_destino_id,
                        'nuevo_stock' => $stockDestino + $request->cantidad
                    ]);
                } else {
                    // Si el producto no existe en la sede destino, crearlo
                    $producto->sedes()->attach($request->sede_destino_id, [
                        'stock' => $request->cantidad,
                        'precio_compra' => $pivot->pivot->precio_compra,
                        'precio_venta' => $pivot->pivot->precio_venta
                    ]);
                    Log::info('Producto creado en sede destino:', [
                        'sede_id' => $request->sede_destino_id,
                        'stock' => $request->cantidad
                    ]);
                }
            }

            DB::commit();
            Log::info('Transferencia completada exitosamente');
            return response()->json(['data' => $transferencia], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en transferencia:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            return response()->json(['message' => 'Error al procesar la transferencia: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Transferencia $transferencia)
    {
        return response()->json(['data' => $transferencia->load(['producto', 'sedeOrigen', 'sedeDestino'])]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transferencia $transferencia)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,enviado,recibido'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Si el estado es 'recibido', actualizar el stock
            if ($request->estado === 'recibido') {
                $producto = $transferencia->producto;

                // Verificar stock en la sede origen
                $pivotOrigen = $producto->sedes()->where('sedes.id', $transferencia->sede_origen_id)->first();
                if (!$pivotOrigen || !$pivotOrigen->pivot) {
                    return response()->json(['message' => 'El producto no está disponible en la sede origen'], 422);
                }

                $stockDisponible = $pivotOrigen->pivot->stock ?? 0;
                if ($stockDisponible < $transferencia->cantidad) {
                    return response()->json(['message' => 'Stock insuficiente en la sede origen'], 422);
                }

                // Descontar stock de la sede origen
                $nuevoStockOrigen = $stockDisponible - $transferencia->cantidad;
                $producto->sedes()->updateExistingPivot($transferencia->sede_origen_id, [
                    'stock' => $nuevoStockOrigen
                ]);

                // Aumentar stock en la sede destino
                $pivotDestino = $producto->sedes()->where('sedes.id', $transferencia->sede_destino_id)->first();
                if ($pivotDestino && $pivotDestino->pivot) {
                    $stockDestino = $pivotDestino->pivot->stock ?? 0;
                    $producto->sedes()->updateExistingPivot($transferencia->sede_destino_id, [
                        'stock' => $stockDestino + $transferencia->cantidad
                    ]);
                } else {
                    // Si el producto no existe en la sede destino, crearlo
                    $producto->sedes()->attach($transferencia->sede_destino_id, [
                        'stock' => $transferencia->cantidad,
                        'precio_compra' => $pivotOrigen->pivot->precio_compra,
                        'precio_venta' => $pivotOrigen->pivot->precio_venta
                    ]);
                }
            }

            // Actualizar el estado de la transferencia
            $transferencia->estado = $request->estado;
            $transferencia->save();

            // Enviar notificación según el estado actualizado
            $action = 'created';
            if ($request->estado === 'recibido') {
                $action = 'approved';
            } elseif ($request->estado === 'cancelado') {
                $action = 'rejected';
            }
            NotificationHelper::sendTransferNotification($transferencia, $action);
            Log::info('Notificación de transferencia enviada con acción: ' . $action);

            DB::commit();
            return response()->json(['data' => $transferencia]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar la transferencia: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transferencia $transferencia)
    {
        if ($transferencia->estado === 'completed') {
            return response()->json(['message' => 'No se puede eliminar una transferencia completada'], 422);
        }

        $transferencia->delete();
        return response()->json(null, 204);
    }
}
