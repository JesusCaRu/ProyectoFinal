<?php

namespace App\Notifications;

use App\Models\Transferencia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class TransferNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $transferencia;
    protected $action;

    /**
     * Create a new notification instance.
     */
    public function __construct(Transferencia $transferencia, string $action = 'created')
    {
        $this->transferencia = $transferencia;
        $this->action = $action; // 'created', 'approved', 'rejected'
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

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
        $subject = 'Transferencia de Productos';
        $message = 'Se ha creado una nueva transferencia de productos.';

        if ($this->action === 'approved') {
            $subject = 'Transferencia Aprobada';
            $message = 'La transferencia de productos ha sido aprobada.';
        } elseif ($this->action === 'rejected') {
            $subject = 'Transferencia Rechazada';
            $message = 'La transferencia de productos ha sido rechazada.';
        }

        return (new MailMessage)
                    ->subject($subject)
                    ->greeting('Hola ' . $notifiable->nombre)
                    ->line($message)
                    ->line('Producto: ' . $this->transferencia->producto->nombre)
                    ->line('Cantidad: ' . $this->transferencia->cantidad . ' unidades')
                    ->line('Desde: ' . $this->transferencia->sedeOrigen->nombre)
                    ->line('Hacia: ' . $this->transferencia->sedeDestino->nombre)
                    ->action('Ver Transferencia', url('/dashboard/transferencias/' . $this->transferencia->id))
                    ->line('¡Gracias por utilizar StockFlow!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $title = 'Nueva Transferencia';
        $message = 'Se ha creado una nueva transferencia de ' . $this->transferencia->cantidad . ' unidades de ' .
                   $this->transferencia->producto->nombre . ' desde ' . $this->transferencia->sedeOrigen->nombre .
                   ' hacia ' . $this->transferencia->sedeDestino->nombre;
        $color = 'info';

        if ($this->action === 'approved') {
            $title = 'Transferencia Aprobada';
            $message = 'La transferencia de ' . $this->transferencia->cantidad . ' unidades de ' .
                       $this->transferencia->producto->nombre . ' ha sido aprobada';
            $color = 'success';
        } elseif ($this->action === 'rejected') {
            $title = 'Transferencia Rechazada';
            $message = 'La transferencia de ' . $this->transferencia->cantidad . ' unidades de ' .
                       $this->transferencia->producto->nombre . ' ha sido rechazada';
            $color = 'error';
        }

        return [
            'title' => $title,
            'message' => $message,
            'icon' => 'arrow-right-left',
            'color' => $color,
            'transferencia_id' => $this->transferencia->id,
            'producto_id' => $this->transferencia->producto_id,
            'sede_origen_id' => $this->transferencia->sede_origen_id,
            'sede_destino_id' => $this->transferencia->sede_destino_id,
            'type' => 'transfer_' . $this->action,
            'url' => '/dashboard/transferencias/' . $this->transferencia->id
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $data = $this->toArray($notifiable);
        $data['id'] = $this->id;
        $data['created_at'] = now()->toIso8601String();

        return new BroadcastMessage($data);
    }
}
