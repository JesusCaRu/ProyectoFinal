<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Sede;
use App\Helpers\NotificationHelper;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Enviar un mensaje a un usuario específico
     */
    public function sendToUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:usuarios,id',
            'message' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $sender = $request->user();
            $recipient = Usuario::findOrFail($request->recipient_id);

            NotificationHelper::sendMessage($request->message, $sender, $recipient);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al enviar mensaje a usuario: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al enviar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar un mensaje a todos los usuarios de una sede
     */
    public function sendToSede(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sede_id' => 'required|exists:sedes,id',
            'message' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $sender = $request->user();
            $sedeId = $request->sede_id;

            // Verificar que el usuario tiene permisos para enviar mensajes a esta sede
            if ($sender->rol_id !== 1 && $sender->sede_id !== $sedeId) { // 1 = Administrador
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para enviar mensajes a esta sede'
                ], 403);
            }

            NotificationHelper::sendMessage($request->message, $sender, null, $sedeId);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado a todos los usuarios de la sede'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al enviar mensaje a sede: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al enviar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar un mensaje a todos los usuarios (solo administradores)
     */
    public function sendToAll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $sender = $request->user();

            // Verificar que el usuario es administrador
            if ($sender->rol_id !== 1) { // 1 = Administrador
                return response()->json([
                    'success' => false,
                    'message' => 'Solo los administradores pueden enviar mensajes a todos los usuarios'
                ], 403);
            }

            NotificationHelper::sendMessage($request->message, $sender);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado a todos los usuarios'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al enviar mensaje a todos: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al enviar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }
}
