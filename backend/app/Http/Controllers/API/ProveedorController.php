<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProveedorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $proveedores = Proveedor::with('compras')->get();
        return response()->json(['data' => $proveedores]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'contacto' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $proveedor = Proveedor::create($request->all());

            DB::commit();
            return response()->json([
                'data' => $proveedor,
                'message' => 'Proveedor creado correctamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Proveedor $proveedor)
    {
        return response()->json([
            'data' => $proveedor->load(['compras' => function($query) {
                $query->with(['detalles.producto'])
                    ->orderBy('created_at', 'desc');
            }])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Proveedor $proveedor)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'contacto' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'direccion' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $proveedor->update($request->all());

            DB::commit();
            return response()->json([
                'data' => $proveedor,
                'message' => 'Proveedor actualizado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Proveedor $proveedor)
    {
        try {
            DB::beginTransaction();

            // Verificar si el proveedor tiene compras asociadas
            if ($proveedor->compras()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar un proveedor con compras asociadas'
                ], 422);
            }

            $proveedor->delete();

            DB::commit();
            return response()->json([
                'message' => 'Proveedor eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resumen de compras por proveedor
     */
    public function getResumenCompras(Proveedor $proveedor)
    {
        try {
            $resumen = DB::table('compras')
                ->where('proveedor_id', $proveedor->id)
                ->selectRaw('
                    COUNT(*) as total_compras,
                    COALESCE(SUM(total), 0) as total_monto,
                    COALESCE(AVG(total), 0) as promedio_compra,
                    MIN(created_at) as primera_compra,
                    MAX(created_at) as ultima_compra
                ')
                ->first();

            // Obtener productos más comprados a este proveedor
            $productosMasComprados = DB::table('compra_detalles')
                ->join('compras', 'compras.id', '=', 'compra_detalles.compra_id')
                ->join('productos', 'productos.id', '=', 'compra_detalles.producto_id')
                ->where('compras.proveedor_id', $proveedor->id)
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
                    'proveedor' => $proveedor,
                    'resumen' => [
                        'total_compras' => (int)$resumen->total_compras,
                        'total_monto' => (float)$resumen->total_monto,
                        'promedio_compra' => (float)$resumen->promedio_compra,
                        'primera_compra' => $resumen->primera_compra,
                        'ultima_compra' => $resumen->ultima_compra
                    ],
                    'productos_mas_comprados' => $productosMasComprados
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el resumen de compras del proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
