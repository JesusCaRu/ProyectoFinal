<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuditoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Auditoria::with('usuario')
                ->orderBy('created_at', 'desc');

            // Filtros
            if ($request->has('usuario_id')) {
                $query->where('usuario_id', $request->usuario_id);
            }

            if ($request->has('accion')) {
                $query->where('accion', $request->accion);
            }

            if ($request->has('tabla')) {
                $query->where('tabla', $request->tabla);
            }

            if ($request->has('fecha_inicio')) {
                $query->whereDate('created_at', '>=', $request->fecha_inicio);
            }

            if ($request->has('fecha_fin')) {
                $query->whereDate('created_at', '<=', $request->fecha_fin);
            }

            $registros = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $registros->items(),
                    'total' => $registros->total(),
                    'per_page' => $registros->perPage(),
                    'current_page' => $registros->currentPage(),
                    'last_page' => $registros->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener registros de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener registros de auditoría'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id',
            'accion' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditoria = Auditoria::create($request->all());
        return response()->json(['data' => $auditoria], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $registro = Auditoria::with('usuario')->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $registro
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener registro de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener registro de auditoría'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Auditoria $auditoria)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id',
            'accion' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditoria->update($request->all());
        return response()->json(['data' => $auditoria]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Auditoria $auditoria)
    {
        $auditoria->delete();
        return response()->json(null, 204);
    }

    /**
     * Get all distinct actions.
     */
    public function getAcciones()
    {
        try {
            $acciones = Auditoria::distinct()->pluck('accion');
            return response()->json([
                'success' => true,
                'data' => $acciones
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener acciones de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener acciones de auditoría'
            ], 500);
        }
    }

    /**
     * Get all distinct tables.
     */
    public function getTablas()
    {
        try {
            $tablas = Auditoria::distinct()->pluck('tabla');
            return response()->json([
                'success' => true,
                'data' => $tablas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener tablas de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tablas de auditoría'
            ], 500);
        }
    }
}
