<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productos = Producto::with(['categoria', 'marca', 'sede'])->get();
        return response()->json(['data' => $productos]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias,id',
            'marca_id' => 'required|exists:marcas,id',
            'stock' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'sede_id' => 'required|exists:sedes,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $producto = Producto::create($request->all());

            DB::commit();
            return response()->json([
                'data' => $producto->load(['categoria', 'marca', 'sede']),
                'message' => 'Producto creado correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Producto $producto)
    {
        return response()->json([
            'data' => $producto->load(['categoria', 'marca', 'sede'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Producto $producto)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias,id',
            'marca_id' => 'required|exists:marcas,id',
            'stock' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'sede_id' => 'required|exists:sedes,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $producto->update($request->all());

            DB::commit();
            return response()->json([
                'data' => $producto->load(['categoria', 'marca', 'sede']),
                'message' => 'Producto actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Producto $producto)
    {
        try {
            DB::beginTransaction();

            // Verificar si el producto tiene stock
            if ($producto->stock > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar un producto con stock existente'
                ], 422);
            }

            // Verificar si el producto tiene movimientos asociados
            if ($producto->movimientos()->exists() ||
                $producto->transferencias()->exists() ||
                $producto->compraDetalles()->exists() ||
                $producto->ventaDetalles()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar un producto con movimientos asociados'
                ], 422);
            }

            $producto->delete();

            DB::commit();
            return response()->json([
                'message' => 'Producto eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el producto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener productos por sede
     */
    public function getBySede($sedeId)
    {
        $productos = Producto::with(['categoria', 'marca', 'sede'])
            ->where('sede_id', $sedeId)
            ->get();

        return response()->json(['data' => $productos]);
    }

    /**
     * Obtener productos con stock bajo
     */
    public function getLowStock()
    {
        $productos = Producto::with(['categoria', 'marca', 'sede'])
            ->whereRaw('stock <= stock_minimo')
            ->get();

        return response()->json(['data' => $productos]);
    }

    /**
     * Actualizar stock de un producto
     */
    public function updateStock(Request $request, Producto $producto)
    {
        $validator = Validator::make($request->all(), [
            'stock' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $producto->update(['stock' => $request->stock]);

            DB::commit();
            return response()->json([
                'data' => $producto->load(['categoria', 'marca', 'sede']),
                'message' => 'Stock actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
