import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useMensajeStore } from '../store/mensajeStore';
// import { useAuthStore } from '../store/authStore';

const NotificationBell = () => {
  const { mensajes, fetchMensajes, isLoading } = useMensajeStore();
  // const { user } = useAuthStore(); // No se usa
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchMensajes();
    }
  }, [open, fetchMensajes]);

  // Cerrar el panel si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Badge si hay mensajes no leídos (opcional, aquí todos se consideran no leídos)
  const unreadCount = mensajes.length;

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="p-2 rounded-full bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary transition-colors border border-border relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-accessibility-text">Notificaciones</span>
            {isLoading && <Loader2 className="animate-spin h-5 w-5 text-solid-color" />}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {mensajes.length === 0 && !isLoading && (
              <div className="p-4 text-text-tertiary text-center">No hay notificaciones</div>
            )}
            {mensajes.map((msg) => (
              <div key={msg.id} className="p-4 border-b border-border last:border-b-0 hover:bg-interactive-component/50 transition-colors">
                <div className="text-sm text-accessibility-text mb-1">{msg.mensaje}</div>
                <div className="text-xs text-text-tertiary flex justify-between">
                  <span>De: {msg.usuario?.nombre || 'Sistema'}</span>
                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 