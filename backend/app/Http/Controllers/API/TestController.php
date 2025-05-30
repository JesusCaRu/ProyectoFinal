<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Sede;
use App\Notifications\StockNotification;
use App\Notifications\MessageNotification;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    /**
     * Send a test notification
     */
    public function sendTestNotification(Request $request)
    {
        try {
            // Get an admin user
            $user = Usuario::where('rol_id', 1)->first();

            if (!$user) {
                return response()->json(['message' => 'No admin user found'], 404);
            }

            // Get a product
            $producto = Producto::first();

            if (!$producto) {
                return response()->json(['message' => 'No product found'], 404);
            }

            // Get a sede
            $sede = Sede::first();

            if (!$sede) {
                return response()->json(['message' => 'No sede found'], 404);
            }

            // Send notification
            Log::info('Sending test notification to user ' . $user->id);
            $user->notify(new StockNotification($producto, $sede, 5));

            return response()->json([
                'success' => true,
                'message' => 'Test notification sent successfully',
                'user' => $user->id,
                'product' => $producto->nombre,
                'sede' => $sede->nombre
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending test notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error sending test notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a test message notification
     */
    public function sendTestMessage(Request $request)
    {
        try {
            // Get an admin user
            $user = Usuario::where('rol_id', 1)->first();

            if (!$user) {
                return response()->json(['message' => 'No admin user found'], 404);
            }

            // Send message notification
            Log::info('Sending test message notification to user ' . $user->id);
            $user->notify(new MessageNotification('Este es un mensaje de prueba', $user));

            return response()->json([
                'success' => true,
                'message' => 'Test message notification sent successfully',
                'user' => $user->id
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending test message notification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error sending test message notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
