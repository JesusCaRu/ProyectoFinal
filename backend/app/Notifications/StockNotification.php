<?php

namespace App\Notifications;

use App\Models\Producto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class StockNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $producto;
    protected $sede;
    protected $cantidad;

    /**
     * Create a new notification instance.
     */
    public function __construct(Producto $producto, $sede, $cantidad)
    {
        $this->producto = $producto;
        $this->sede = $sede;
        $this->cantidad = $cantidad;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Add email channel if user has email notifications enabled
        if ($notifiable->notificaciones_email) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Alerta de Stock Bajo')
                    ->greeting('Hola ' . $notifiable->nombre)
                    ->line('El producto ' . $this->producto->nombre . ' tiene stock bajo.')
                    ->line('Cantidad actual: ' . $this->cantidad . ' unidades')
                    ->line('Sede: ' . $this->sede->nombre)
                    ->action('Ver Producto', url('/dashboard/inventario/' . $this->producto->id))
                    ->line('¡Gracias por utilizar StockFlow!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Alerta de Stock Bajo',
            'message' => 'El producto ' . $this->producto->nombre . ' tiene stock bajo (' . $this->cantidad . ' unidades) en la sede ' . $this->sede->nombre,
            'icon' => 'package',
            'color' => 'warning',
            'producto_id' => $this->producto->id,
            'sede_id' => $this->sede->id,
            'type' => 'stock_low',
            'url' => '/dashboard/inventario/' . $this->producto->id
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => 'Alerta de Stock Bajo',
            'message' => 'El producto ' . $this->producto->nombre . ' tiene stock bajo (' . $this->cantidad . ' unidades) en la sede ' . $this->sede->nombre,
            'icon' => 'package',
            'color' => 'warning',
            'producto_id' => $this->producto->id,
            'sede_id' => $this->sede->id,
            'type' => 'stock_low',
            'url' => '/dashboard/inventario/' . $this->producto->id,
            'created_at' => now()->toIso8601String()
        ]);
    }

    /**
     * Get the log representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toLog($notifiable)
    {
        return [
            'title' => 'Alerta de Stock Bajo',
            'message' => 'El producto ' . $this->producto->nombre . ' tiene stock bajo (' . $this->cantidad . ' unidades) en la sede ' . $this->sede->nombre,
            'producto_id' => $this->producto->id,
            'sede_id' => $this->sede->id,
        ];
    }
}
