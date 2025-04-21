<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transferencia;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
        $validator = Validator::make($request->all(), [
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'sede_origen_id' => 'required|exists:sedes,id',
            'sede_destino_id' => 'required|exists:sedes,id|different:sede_origen_id',
            'estado' => 'required|in:pending,completed,cancelled',
            'fecha' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $producto = Producto::findOrFail($request->producto_id);

            if ($producto->stock < $request->cantidad) {
                return response()->json(['message' => 'Stock insuficiente'], 422);
            }

            $transferencia = Transferencia::create($request->all());

            if ($request->estado === 'completed') {
                $producto->stock -= $request->cantidad;
                $producto->save();

                $productoDestino = Producto::where('sede_id', $request->sede_destino_id)
                    ->where('categoria_id', $producto->categoria_id)
                    ->where('marca_id', $producto->marca_id)
                    ->first();

                if ($productoDestino) {
                    $productoDestino->stock += $request->cantidad;
                    $productoDestino->save();
                }
            }

            DB::commit();
            return response()->json(['data' => $transferencia], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al procesar la transferencia'], 500);
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
            'estado' => 'required|in:pending,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            if ($transferencia->estado === 'pending' && $request->estado === 'completed') {
                $producto = $transferencia->producto;

                if ($producto->stock < $transferencia->cantidad) {
                    return response()->json(['message' => 'Stock insuficiente'], 422);
                }

                $producto->stock -= $transferencia->cantidad;
                $producto->save();

                $productoDestino = Producto::where('sede_id', $transferencia->sede_destino_id)
                    ->where('categoria_id', $producto->categoria_id)
                    ->where('marca_id', $producto->marca_id)
                    ->first();

                if ($productoDestino) {
                    $productoDestino->stock += $transferencia->cantidad;
                    $productoDestino->save();
                }
            }

            $transferencia->update($request->all());
            DB::commit();
            return response()->json(['data' => $transferencia]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar la transferencia'], 500);
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
