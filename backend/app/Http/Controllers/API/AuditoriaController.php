<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AuditoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            DB::beginTransaction();

            $query = Activity::with('causer')
                ->orderBy('created_at', 'desc');

            // Filtros
            if ($request->filled('usuario_id')) {
                $query->where('causer_id', $request->usuario_id);
            }

            if ($request->filled('accion')) {
                $query->where('description', 'LIKE', '%' . $request->accion . '%');
            }

            if ($request->filled('tabla')) {
                $query->where('subject_type', 'LIKE', '%' . $request->tabla . '%');
            }

            if ($request->filled('fecha_inicio')) {
                $query->whereDate('created_at', '>=', $request->fecha_inicio);
            }

            if ($request->filled('fecha_fin')) {
                $query->whereDate('created_at', '<=', $request->fecha_fin);
            }

            $registros = $query->paginate(15);

            DB::commit();

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
            DB::rollBack();
            Log::error('Error al obtener registros de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener registros de auditoría: ' . $e->getMessage()
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

        $auditoria = Activity::create($request->all());
        return response()->json(['data' => $auditoria], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $registro = Activity::with('causer')->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $registro
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener registro de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener registro de auditoría: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Activity $auditoria)
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
    public function destroy(Activity $auditoria)
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
            $acciones = Activity::select('description')
                ->distinct()
                ->whereNotNull('description')
                ->pluck('description')
                ->filter()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $acciones
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener acciones de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener acciones de auditoría: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all distinct tables.
     */
    public function getTablas()
    {
        try {
            $tablas = Activity::select('subject_type')
                ->distinct()
                ->whereNotNull('subject_type')
                ->pluck('subject_type')
                ->map(function ($type) {
                    return class_basename($type);
                })
                ->filter()
                ->values();

            return response()->json([
                'success' => true,
                'data' => $tablas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener tablas de auditoría: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tablas de auditoría: ' . $e->getMessage()
            ], 500);
        }
    }
}
