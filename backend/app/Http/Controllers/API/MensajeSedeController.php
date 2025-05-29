<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MensajeSede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MensajeSedeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = MensajeSede::query()
            ->with(['usuario', 'sede'])
            ->orderBy('created_at', 'desc');

        if ($request->sede_id) {
            $query->where(function($q) use ($request) {
                $q->where('sede_id', $request->sede_id)
                  ->orWhereNull('sede_id');
            });
        }

        $mensajes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $mensajes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mensaje' => 'required|string',
            'sede_id' => 'nullable|exists:sedes,id'
        ]);

        $mensaje = MensajeSede::create([
            'mensaje' => $request->mensaje,
            'usuario_id' => $request->user()->id,
            'sede_id' => $request->sede_id,
            'leido' => false
        ]);

        $mensaje->load(['usuario', 'sede']);

        return response()->json([
            'success' => true,
            'data' => $mensaje
        ], 201);
    }

    public function marcarLeido($id)
    {
        $mensaje = MensajeSede::findOrFail($id);
        $mensaje->update(['leido' => true]);
        $mensaje->load(['usuario', 'sede']);

        return response()->json([
            'success' => true,
            'data' => $mensaje
        ]);
    }

    public function destroy($id)
    {
        $mensaje = MensajeSede::findOrFail($id);
        $mensaje->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mensaje eliminado correctamente'
        ]);
    }
}
