<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

class ActivityHelper
{
    /**
     * Registrar una actividad del sistema
     *
     * @param string $description Descripción de la actividad
     * @param string $logName Nombre del log (default: 'sistema')
     * @param array $properties Propiedades adicionales a registrar
     * @return Activity
     */
    public static function log(string $description, string $logName = 'sistema', array $properties = []): Activity
    {
        $activity = activity($logName)
            ->withProperties($properties);

        // Si hay un usuario autenticado, asociarlo a la actividad
        if (Auth::check()) {
            $activity->causedBy(Auth::user());
        }

        return $activity->log($description);
    }

    /**
     * Registrar una actividad de login
     *
     * @param int $userId ID del usuario
     * @param string $email Email del usuario
     * @param string $ip Dirección IP
     * @return Activity
     */
    public static function logLogin(int $userId, string $email, string $ip): Activity
    {
        return self::log(
            "Usuario $email ha iniciado sesión",
            'autenticacion',
            [
                'user_id' => $userId,
                'email' => $email,
                'ip' => $ip,
                'type' => 'login'
            ]
        );
    }

    /**
     * Registrar una actividad de logout
     *
     * @param int $userId ID del usuario
     * @param string $email Email del usuario
     * @return Activity
     */
    public static function logLogout(int $userId, string $email): Activity
    {
        return self::log(
            "Usuario $email ha cerrado sesión",
            'autenticacion',
            [
                'user_id' => $userId,
                'email' => $email,
                'type' => 'logout'
            ]
        );
    }

    /**
     * Registrar una actividad de transferencia
     *
     * @param int $transferenciaId ID de la transferencia
     * @param string $action Acción realizada (created, approved, rejected)
     * @param array $details Detalles adicionales
     * @return Activity
     */
    public static function logTransferencia(int $transferenciaId, string $action, array $details = []): Activity
    {
        $actionText = match($action) {
            'created' => 'ha creado',
            'approved' => 'ha aprobado',
            'rejected' => 'ha rechazado',
            default => 'ha actualizado'
        };

        return self::log(
            "Usuario " . (Auth::check() ? Auth::user()->email : 'Sistema') . " $actionText la transferencia #$transferenciaId",
            'transferencias',
            array_merge([
                'transferencia_id' => $transferenciaId,
                'action' => $action
            ], $details)
        );
    }

    /**
     * Registrar una actividad de stock
     *
     * @param int $productoId ID del producto
     * @param int $sedeId ID de la sede
     * @param int $cantidad Cantidad
     * @param string $tipo Tipo de movimiento (entrada, salida, ajuste)
     * @return Activity
     */
    public static function logStock(int $productoId, int $sedeId, int $cantidad, string $tipo): Activity
    {
        return self::log(
            "Stock " . ($cantidad >= 0 ? "aumentado" : "reducido") . " en $cantidad unidades",
            'inventario',
            [
                'producto_id' => $productoId,
                'sede_id' => $sedeId,
                'cantidad' => $cantidad,
                'tipo' => $tipo
            ]
        );
    }
}