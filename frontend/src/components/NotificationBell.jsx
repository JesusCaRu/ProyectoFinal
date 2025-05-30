import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, X, Check, ArrowRightLeft, Clock, Eye, AlertCircle, RefreshCcw } from 'lucide-react';
import { useMensajeStore } from '../store/mensajeStore';
import { useTransferenciaStore } from '../store/transferenciaStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationBell = () => {
  const { 
    mensajes, 
    fetchMensajes, 
    isLoading, 
    marcarLeido, 
    eliminarMensaje,
    marcarTodosLeidos,
    error: mensajeError,
    clearError
  } = useMensajeStore();
  const { updateTransferencia, fetchTransferencias } = useTransferenciaStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const [localMensajes, setLocalMensajes] = useState([]);
  const [loadError, setLoadError] = useState(false);
  
  // Usuario actual
  const currentUserSedeId = user?.data?.sede_id;

  // Manejar errores
  useEffect(() => {
    if (mensajeError) {
      setLoadError(true);
      console.error('Error en notificaciones:', mensajeError);
    } else {
      setLoadError(false);
    }
  }, [mensajeError]);

  // Actualizar mensajes locales cuando cambian los mensajes del store
  useEffect(() => {
    console.log('Mensajes recibidos:', mensajes);
    console.log('ID de sede actual:', currentUserSedeId);
    
    if (mensajes && Array.isArray(mensajes)) {
      // Filtrar mensajes para esta sede o mensajes globales
      const filteredMensajes = mensajes.filter(msg => 
        msg && (Number(msg.sede_id) === Number(currentUserSedeId))
      );
      console.log('Mensajes filtrados:', filteredMensajes);
      setLocalMensajes(filteredMensajes);
    } else {
      // Si no hay mensajes o no es un array, inicializar como array vacío
      console.log('No hay mensajes o no es un array');
      setLocalMensajes([]);
    }
  }, [mensajes, currentUserSedeId]);

  // Cargar mensajes periódicamente y cuando se abre el panel
  useEffect(() => {
    // Cargar mensajes al inicio
    console.log('Cargando mensajes iniciales para sede:', currentUserSedeId);
    fetchMensajes(currentUserSedeId)
      .then(result => {
        console.log('Resultado de fetchMensajes:', result);
      })
      .catch((error) => {
        console.error('Error al cargar mensajes:', error);
        setLoadError(true);
      });
    
    // Configurar intervalo para actualizar cada 10 segundos (más frecuente)
    const interval = setInterval(() => {
      console.log('Actualizando mensajes para sede:', currentUserSedeId);
      fetchMensajes(currentUserSedeId)
        .then(result => {
          console.log('Resultado de actualización:', result);
        })
        .catch((error) => {
          console.error('Error en actualización periódica:', error);
          setLoadError(true);
        });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchMensajes, currentUserSedeId]);

  // Actualizar cuando cambia el usuario o la sede
  useEffect(() => {
    if (currentUserSedeId) {
      fetchMensajes(currentUserSedeId);
    }
  }, [currentUserSedeId, fetchMensajes]);

  // Cargar mensajes adicionales cuando se abre el panel
  useEffect(() => {
    if (open) {
      fetchMensajes(currentUserSedeId);
      fetchTransferencias();
    }
  }, [open, fetchMensajes, fetchTransferencias, currentUserSedeId]);

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
      toast.success('Mensaje marcado como leído');
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      toast.error('Error al marcar como leído');
    }
  };

  const handleEliminar = async (mensajeId) => {
    try {
      await eliminarMensaje(mensajeId);
      setLocalMensajes(prev => prev.filter(msg => msg.id !== mensajeId));
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const handleAceptarTransferencia = async (mensajeId, transferenciaId) => {
    try {
      // Verificar que el usuario pertenece a la sede destino
      const transferencia = await getTransferenciaFromMessage(mensajeId);
      
      if (!transferencia) {
        toast.error('Transferencia no encontrada');
        return;
      }
      
      if (currentUserSedeId !== transferencia.sede_destino_id) {
        toast.error('Solo la sede destino puede aceptar transferencias');
        return;
      }
      
      await updateTransferencia(transferenciaId, { estado: 'recibido' });
      await marcarLeido(mensajeId);
      
      setLocalMensajes(prev => prev.map(msg => 
        msg.id === mensajeId ? { ...msg, leido: true } : msg
      ));
      
      toast.success('Transferencia aceptada correctamente');
      fetchTransferencias();
    } catch (error) {
      console.error('Error al aceptar transferencia:', error);
      toast.error('Error al aceptar la transferencia');
    }
  };

  // Función para extraer el ID de transferencia del mensaje
  const getTransferenciaId = (mensaje) => {
    const match = mensaje.mensaje.match(/transferencia #(\d+)/i);
    return match ? match[1] : null;
  };
  
  // Función para obtener información de la transferencia desde un mensaje
  const getTransferenciaFromMessage = async (mensajeId) => {
    const mensaje = localMensajes.find(m => m && m.id === mensajeId);
    if (!mensaje) return null;
    
    const transferenciaId = getTransferenciaId(mensaje);
    if (!transferenciaId) return null;
    
    try {
      const { fetchTransferencias } = useTransferenciaStore.getState();
      await fetchTransferencias();
      const { transferencias } = useTransferenciaStore.getState();
      
      if (!transferencias || !Array.isArray(transferencias)) {
        return null;
      }
      
      return transferencias.find(t => t && t.id === Number(transferenciaId));
    } catch (error) {
      console.error('Error al obtener transferencia:', error);
      return null;
    }
  };

  // Badge si hay mensajes no leídos
  const unreadCount = localMensajes.filter(msg => !msg.leido).length;

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yy HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const handleRetryLoad = () => {
    setLoadError(false);
    clearError();
    console.log('Reintentando carga de mensajes...');
    fetchMensajes(currentUserSedeId).catch(() => {
      setLoadError(true);
    });
  };

  const handleForceRefresh = () => {
    console.log('Forzando recarga de mensajes...');
    toast.success('Actualizando notificaciones...');
    fetchMensajes(currentUserSedeId)
      .then(result => {
        console.log('Resultado de recarga forzada:', result);
        toast.success('Notificaciones actualizadas');
      })
      .catch(error => {
        console.error('Error en recarga forzada:', error);
        toast.error('Error al actualizar notificaciones');
        setLoadError(true);
      });
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
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-bg-secondary border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-interactive-component/30">
            <span className="font-semibold text-accessibility-text">Notificaciones</span>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="animate-spin h-5 w-5 text-solid-color" />}
              <button 
                onClick={handleForceRefresh}
                className="p-1 rounded-full hover:bg-interactive-component text-text-tertiary"
                title="Actualizar notificaciones"
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {loadError ? (
              <div className="p-6 text-error text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p className="mb-2">Error al cargar notificaciones</p>
                <button 
                  onClick={handleRetryLoad}
                  className="px-3 py-1 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center mx-auto gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Reintentar</span>
                </button>
              </div>
            ) : (!localMensajes || localMensajes.length === 0) && !isLoading ? (
              <div className="p-6 text-text-tertiary text-center">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No hay notificaciones</p>
                <button 
                  onClick={handleForceRefresh}
                  className="px-3 py-1 mt-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center mx-auto gap-2 text-sm"
                >
                  <RefreshCcw className="h-3 w-3" />
                  <span>Actualizar</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {localMensajes.map((msg) => {
                  if (!msg) return null;
                  
                  const isTransferencia = msg.mensaje && msg.mensaje.toLowerCase().includes('transferencia');
                  const transferenciaId = isTransferencia ? getTransferenciaId(msg) : null;
                  const isUnread = !msg.leido;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`p-4 hover:bg-interactive-component/20 transition-colors ${isUnread ? 'bg-interactive-component/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className={`text-sm flex-1 ${isUnread ? 'font-medium text-accessibility-text' : 'text-text-tertiary'}`}>
                          <div className="flex items-start gap-2">
                            {isTransferencia ? (
                              <ArrowRightLeft className="h-5 w-5 text-info shrink-0 mt-0.5" />
                            ) : (
                              <Bell className="h-5 w-5 text-solid-color shrink-0 mt-0.5" />
                            )}
                            <span>{msg.mensaje}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0">
                          {isTransferencia && !msg.leido && transferenciaId && (
                            <button
                              onClick={() => handleAceptarTransferencia(msg.id, transferenciaId)}
                              className="p-1.5 rounded-full hover:bg-success/20 text-success"
                              title="Aceptar transferencia"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          {!msg.leido && (
                            <button
                              onClick={() => handleMarcarLeido(msg.id)}
                              className="p-1.5 rounded-full hover:bg-info/20 text-info"
                              title="Marcar como leído"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEliminar(msg.id)}
                            className="p-1.5 rounded-full hover:bg-error/20 text-error"
                            title="Eliminar notificación"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-text-tertiary mt-2 flex justify-between">
                        <span>De: {msg.usuario?.nombre || 'Sistema'}</span>
                        <span>{formatDate(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {localMensajes && localMensajes.length > 0 && !loadError && (
            <div className="p-3 border-t border-border bg-interactive-component/10 text-center">
              <button 
                onClick={() => {
                  marcarTodosLeidos(currentUserSedeId)
                    .then(() => {
                      setLocalMensajes(prev => prev.map(msg => ({ ...msg, leido: true })));
                      toast.success('Todas las notificaciones marcadas como leídas');
                    })
                    .catch(() => toast.error('Error al marcar notificaciones'));
                }}
                className="text-xs text-solid-color hover:underline"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Marcar todas como leídas'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 