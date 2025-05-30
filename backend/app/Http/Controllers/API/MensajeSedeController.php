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
        try {
            Log::info('Recibida petición de mensajes', [
                'sede_id' => $request->sede_id,
                'user_id' => $request->user()->id,
                'user_sede_id' => $request->user()->sede_id
            ]);

            $query = MensajeSede::query()
                ->with(['usuario', 'sede'])
                ->orderBy('created_at', 'desc');

            if ($request->sede_id) {
                Log::info('Filtrando por sede_id', ['sede_id' => $request->sede_id]);
                $query->where(function($q) use ($request) {
                    $q->where('sede_id', $request->sede_id)
                      ->orWhereNull('sede_id');
                });
            }

            $mensajes = $query->get();
            Log::info('Mensajes encontrados', ['count' => $mensajes->count()]);

            return response()->json([
                'success' => true,
                'data' => $mensajes
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener mensajes', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mensajes: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Creando nuevo mensaje', [
                'mensaje' => $request->mensaje,
                'sede_id' => $request->sede_id,
                'user_id' => $request->user()->id
            ]);

            $request->validate([
                'mensaje' => 'required|string',
                'sede_id' => 'required|exists:sedes,id'
            ]);

            // Crear el mensaje para la sede específica
            $mensaje = MensajeSede::create([
                'mensaje' => $request->mensaje,
                'usuario_id' => $request->user()->id,
                'sede_id' => $request->sede_id,
                'leido' => false
            ]);

            $mensaje->load(['usuario', 'sede']);
            Log::info('Mensaje creado correctamente', ['id' => $mensaje->id]);

            return response()->json([
                'success' => true,
                'data' => $mensaje
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear mensaje', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    public function marcarLeido($id)
    {
        try {
            $mensaje = MensajeSede::findOrFail($id);
            $mensaje->update(['leido' => true]);
            $mensaje->load(['usuario', 'sede']);

            Log::info('Mensaje marcado como leído', ['id' => $id]);

            return response()->json([
                'success' => true,
                'data' => $mensaje
            ]);
        } catch (\Exception $e) {
            Log::error('Error al marcar mensaje como leído', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al marcar mensaje como leído: ' . $e->getMessage()
            ], 500);
        }
    }

    public function marcarTodosLeidos(Request $request)
    {
        try {
            $query = MensajeSede::query()->where('leido', false);

            // Si se proporciona una sede_id, filtrar por esa sede o mensajes globales
            if ($request->sede_id) {
                Log::info('Marcando todos como leídos para sede', ['sede_id' => $request->sede_id]);
                $query->where(function($q) use ($request) {
                    $q->where('sede_id', $request->sede_id)
                      ->orWhereNull('sede_id');
                });
            }

            $count = $query->update(['leido' => true]);
            Log::info('Mensajes marcados como leídos', ['count' => $count]);

            return response()->json([
                'success' => true,
                'message' => "{$count} mensajes marcados como leídos",
                'count' => $count
            ]);
        } catch (\Exception $e) {
            Log::error('Error al marcar todos como leídos', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al marcar todos como leídos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $mensaje = MensajeSede::findOrFail($id);
            $mensaje->delete();
            Log::info('Mensaje eliminado', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar mensaje', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }
}
