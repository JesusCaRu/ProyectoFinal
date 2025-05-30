<?php

namespace App\Helpers;

use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\Transferencia;
use App\Notifications\StockNotification;
use App\Notifications\TransferNotification;
use App\Notifications\MessageNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class NotificationHelper
{
    /**
     * Enviar notificación de stock bajo a usuarios relevantes
     *
     * @param Producto $producto
     * @param Sede $sede
     * @param int $cantidad
     * @return void
     */
    public static function sendLowStockNotification(Producto $producto, $sede, int $cantidad): void
    {
        try {
            // Notificar a todos los administradores y almacenistas de la sede
            $users = Usuario::where(function ($query) use ($sede) {
                $query->where('rol_id', 1) // Administradores
                    ->orWhere(function ($q) use ($sede) {
                        $q->where('rol_id', 3) // Almacenistas
                            ->where('sede_id', $sede->id);
                    });
            })->get();

            foreach ($users as $user) {
                $user->notify(new StockNotification($producto, $sede, $cantidad));
            }

            Log::info("Notificación de stock bajo enviada para el producto {$producto->nombre} en la sede {$sede->nombre}");
        } catch (\Exception $e) {
            Log::error("Error al enviar notificación de stock bajo: {$e->getMessage()}");
        }
    }

    /**
     * Enviar notificación de transferencia a usuarios relevantes
     *
     * @param Transferencia $transferencia
     * @param string $action created|approved|rejected
     * @return void
     */
    public static function sendTransferNotification(Transferencia $transferencia, string $action = 'created'): void
    {
        try {
            // Usuarios a notificar según el tipo de acción
            $users = new Collection();

            // Siempre notificar al creador de la transferencia
            $users->push($transferencia->usuario);

            // Si es una nueva transferencia, notificar a los administradores y almacenistas de la sede destino
            if ($action === 'created') {
                $adminUsers = Usuario::where(function ($query) use ($transferencia) {
                    $query->where('rol_id', 1) // Administradores
                        ->orWhere(function ($q) use ($transferencia) {
                            $q->where('rol_id', 3) // Almacenistas
                                ->where('sede_id', $transferencia->sede_destino_id);
                        });
                })->get();

                $users = $users->merge($adminUsers);
            }

            // Si es aprobada o rechazada, notificar a los administradores y al creador
            else {
                $adminUsers = Usuario::where('rol_id', 1)->get(); // Administradores
                $users = $users->merge($adminUsers);
            }

            // Eliminar duplicados
            $users = $users->unique('id');

            foreach ($users as $user) {
                $user->notify(new TransferNotification($transferencia, $action));
            }

            Log::info("Notificación de transferencia ({$action}) enviada para la transferencia #{$transferencia->id}");
        } catch (\Exception $e) {
            Log::error("Error al enviar notificación de transferencia: {$e->getMessage()}");
        }
    }

    /**
     * Enviar mensaje a un usuario específico o a todos los usuarios de una sede
     *
     * @param string $message
     * @param Usuario|null $sender
     * @param Usuario|null $recipient
     * @param int|null $sedeId
     * @return void
     */
    public static function sendMessage(string $message, ?Usuario $sender = null, ?Usuario $recipient = null, ?int $sedeId = null): void
    {
        try {
            // Si hay un destinatario específico
            if ($recipient) {
                $recipient->notify(new MessageNotification($message, $sender, $sedeId));
                Log::info("Mensaje enviado a usuario #{$recipient->id}");
                return;
            }

            // Si es para toda una sede
            if ($sedeId) {
                $users = Usuario::where('sede_id', $sedeId)->get();

                foreach ($users as $user) {
                    $user->notify(new MessageNotification($message, $sender, $sedeId));
                }

                Log::info("Mensaje enviado a todos los usuarios de la sede #{$sedeId}");
                return;
            }

            // Si no hay destinatario ni sede, enviar a todos los usuarios
            $users = Usuario::all();

            foreach ($users as $user) {
                $user->notify(new MessageNotification($message, $sender));
            }

            Log::info("Mensaje enviado a todos los usuarios");
        } catch (\Exception $e) {
            Log::error("Error al enviar mensaje: {$e->getMessage()}");
        }
    }
}
