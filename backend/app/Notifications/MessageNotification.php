<?php

namespace App\Notifications;

use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $message;
    protected $sender;
    protected $sede_id;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $message, Usuario $sender = null, int $sede_id = null)
    {
        $this->message = $message;
        $this->sender = $sender;
        $this->sede_id = $sede_id;
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
        $senderName = $this->sender ? $this->sender->nombre : 'Sistema';

        return (new MailMessage)
                    ->subject('Nuevo Mensaje')
                    ->greeting('Hola ' . $notifiable->nombre)
                    ->line('Has recibido un nuevo mensaje de ' . $senderName . ':')
                    ->line($this->message)
                    ->action('Ver Mensajes', url('/dashboard/mensajes'))
                    ->line('¡Gracias por utilizar StockFlow!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $senderName = $this->sender ? $this->sender->nombre : 'Sistema';
        $senderId = $this->sender ? $this->sender->id : null;

        return [
            'title' => 'Nuevo Mensaje',
            'message' => $this->message,
            'icon' => 'message-square',
            'color' => 'info',
            'sender_id' => $senderId,
            'sender_name' => $senderName,
            'sede_id' => $this->sede_id,
            'type' => 'message',
            'url' => '/dashboard/mensajes'
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
