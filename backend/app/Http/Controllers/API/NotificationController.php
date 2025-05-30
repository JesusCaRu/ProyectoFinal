<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            Log::info('Fetching notifications for user: ' . ($user ? $user->id : 'null'));

            $perPage = $request->input('per_page', 15);
            $onlyUnread = $request->boolean('unread', false);

            // Get notifications with pagination
            $query = $user->notifications();
            Log::info('Notification query created');

            // Filter by unread if requested
            if ($onlyUnread) {
                $query->whereNull('read_at');
            }

            // Order by creation date (newest first)
            $notifications = $query->orderBy('created_at', 'desc')
                                  ->paginate($perPage);

            Log::info('Notifications fetched: ' . $notifications->count());

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener notificaciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = $request->user()->notifications()->where('id', $id)->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notificación no encontrada'
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar notificación como leída: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $request->user()->unreadNotifications->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Todas las notificaciones marcadas como leídas'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar notificaciones como leídas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $notification = $request->user()->notifications()->where('id', $id)->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notificación no encontrada'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notificación eliminada'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar notificación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete all notifications.
     */
    public function destroyAll(Request $request)
    {
        try {
            $request->user()->notifications()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Todas las notificaciones eliminadas'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar notificaciones: ' . $e->getMessage()
            ], 500);
        }
    }
}
