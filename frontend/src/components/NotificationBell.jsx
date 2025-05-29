import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, X, Check, ArrowRightLeft } from 'lucide-react';
import { useMensajeStore } from '../store/mensajeStore';
import { useTransferenciaStore } from '../store/transferenciaStore';

const NotificationBell = () => {
  const { mensajes = [], fetchMensajes, isLoading, marcarLeido, eliminarMensaje } = useMensajeStore();
  const { updateTransferencia } = useTransferenciaStore();
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const [localMensajes, setLocalMensajes] = useState([]);

  // Actualizar mensajes locales cuando cambian los mensajes del store
  useEffect(() => {
    if (mensajes && mensajes.length > 0) {
      setLocalMensajes(mensajes);
    }
  }, [mensajes]);

  // Cargar mensajes cuando se abre el panel
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

  const handleMarcarLeido = async (mensajeId) => {
    try {
      await marcarLeido(mensajeId);
      setLocalMensajes(prev => prev.map(msg => 
        msg.id === mensajeId ? { ...msg, leido: true } : msg
      ));
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
    }
  };

  const handleEliminar = async (mensajeId) => {
    try {
      await eliminarMensaje(mensajeId);
      setLocalMensajes(prev => prev.filter(msg => msg.id !== mensajeId));
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
    }
  };

  const handleAceptarTransferencia = async (mensajeId, transferenciaId) => {
    try {
      await updateTransferencia(transferenciaId, { estado: 'recibido' });
      await marcarLeido(mensajeId);
      setLocalMensajes(prev => prev.map(msg => 
        msg.id === mensajeId ? { ...msg, leido: true } : msg
      ));
    } catch (error) {
      console.error('Error al aceptar transferencia:', error);
    }
  };

  // Badge si hay mensajes no leídos
  const unreadCount = localMensajes.filter(msg => !msg.leido).length;

  // Función para extraer el ID de transferencia del mensaje
  const getTransferenciaId = (mensaje) => {
    const match = mensaje.mensaje.match(/transferencia #(\d+)/i);
    return match ? match[1] : null;
  };

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
            {localMensajes.length === 0 && !isLoading && (
              <div className="p-4 text-text-tertiary text-center">No hay notificaciones</div>
            )}
            {localMensajes.map((msg) => {
              const isTransferencia = msg.mensaje.toLowerCase().includes('transferencia');
              const transferenciaId = isTransferencia ? getTransferenciaId(msg) : null;
              
              return (
                <div key={msg.id} className="p-4 border-b border-border last:border-b-0 hover:bg-interactive-component/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm text-accessibility-text flex-1">
                      {isTransferencia && (
                        <ArrowRightLeft className="h-4 w-4 inline-block mr-2 text-info" />
                      )}
                      {msg.mensaje}
                    </div>
                    <div className="flex gap-2 ml-2">
                      {isTransferencia && !msg.leido && transferenciaId && (
                        <button
                          onClick={() => handleAceptarTransferencia(msg.id, transferenciaId)}
                          className="p-1 rounded-full hover:bg-success/20 text-success"
                          title="Aceptar transferencia"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {!msg.leido && !isTransferencia && (
                        <button
                          onClick={() => handleMarcarLeido(msg.id)}
                          className="p-1 rounded-full hover:bg-success/20 text-success"
                          title="Marcar como leído"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(msg.id)}
                        className="p-1 rounded-full hover:bg-error/20 text-error"
                        title="Eliminar mensaje"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary flex justify-between">
                    <span>De: {msg.usuario?.nombre || 'Sistema'}</span>
                    <span>{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 