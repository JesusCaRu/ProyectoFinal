<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Sede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Helpers\NotificationHelper;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productos = Producto::with(['categoria', 'marca', 'sedes' => function($query) {
            $query->select('sedes.*')
                  ->addSelect(['producto_sede.stock', 'producto_sede.precio_compra', 'producto_sede.precio_venta']);
        }])->get();
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
            'sku' => 'required|string|max:20|unique:productos,sku',
            'tipo_producto' => 'nullable|string|max:10',
            'categoria_id' => 'required|exists:categorias,id',
            'marca_id' => 'required|exists:marcas,id',
            'stock_minimo' => 'required|integer|min:0',
            'sede_id' => 'required|exists:sedes,id',
            'stock' => 'required|integer|min:0',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Create the product
            $producto = Producto::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'sku' => $request->sku,
                'tipo_producto' => $request->tipo_producto,
                'categoria_id' => $request->categoria_id,
                'marca_id' => $request->marca_id,
                'stock_minimo' => $request->stock_minimo
            ]);

            // Create the product-sede relationship
            $producto->sedes()->attach($request->sede_id, [
                'stock' => $request->stock,
                'precio_compra' => $request->precio_compra,
                'precio_venta' => $request->precio_venta
            ]);

            DB::commit();
            return response()->json([
                'data' => $producto->load(['categoria', 'marca', 'sedes']),
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
            'data' => $producto->load(['categoria', 'marca', 'sedes'])
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
            'sku' => 'required|string|max:20|unique:productos,sku,'.$producto->id,
            'tipo_producto' => 'nullable|string|max:10',
            'categoria_id' => 'required|exists:categorias,id',
            'marca_id' => 'required|exists:marcas,id',
            'stock_minimo' => 'required|integer|min:0',
            'sede_id' => 'required|exists:sedes,id',
            'stock' => 'required|integer|min:0',
            'precio_compra' => 'required|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Update the product
            $producto->update([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'sku' => $request->sku,
                'tipo_producto' => $request->tipo_producto,
                'categoria_id' => $request->categoria_id,
                'marca_id' => $request->marca_id,
                'stock_minimo' => $request->stock_minimo
            ]);

            // Update the product-sede relationship
            $producto->sedes()->syncWithoutDetaching([
                $request->sede_id => [
                    'stock' => $request->stock,
                    'precio_compra' => $request->precio_compra,
                    'precio_venta' => $request->precio_venta
                ]
            ]);

            // Check if stock is below minimum and send notification if needed
            if ($request->stock <= $producto->stock_minimo) {
                $sede = Sede::find($request->sede_id);
                NotificationHelper::sendLowStockNotification($producto, $sede, $request->stock);
            }

            DB::commit();
            return response()->json([
                'data' => $producto->load(['categoria', 'marca', 'sedes']),
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

            // Delete the product (this will cascade delete the producto_sede records)
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
     * Get products by sede
     */
    public function getProductsBySede($sedeId)
    {
        $productos = Producto::whereHas('sedes', function ($query) use ($sedeId) {
            $query->where('sedes.id', $sedeId);
        })->with(['categoria', 'marca', 'sedes' => function ($query) use ($sedeId) {
            $query->where('sedes.id', $sedeId)
                  ->select('sedes.*')
                  ->addSelect(['producto_sede.stock', 'producto_sede.precio_compra', 'producto_sede.precio_venta']);
        }])->get();

        return response()->json(['data' => $productos]);
    }

    /**
     * Get low stock products
     */
    public function getLowStockProducts(Request $request)
    {
        $sedeId = $request->query('sede_id');

        $query = Producto::whereHas('sedes', function ($query) use ($sedeId) {
            if ($sedeId) {
                $query->where('sedes.id', $sedeId);
            }
            $query->whereRaw('producto_sede.stock <= productos.stock_minimo');
        });

        if ($sedeId) {
            $query->with(['sedes' => function ($query) use ($sedeId) {
                $query->where('sedes.id', $sedeId);
            }]);
        }

        $productos = $query->with(['categoria', 'marca'])->get();

        return response()->json(['data' => $productos]);
    }
}
