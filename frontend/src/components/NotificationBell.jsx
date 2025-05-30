import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Loader2, 
  X, 
  Check, 
  ArrowRightLeft, 
  Package, 
  MessageSquare, 
  Eye, 
  AlertCircle, 
  RefreshCcw, 
  Trash2
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isLoading, 
    error,
    clearError
  } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      setLoadError(true);
      console.error('Error en notificaciones:', error);
    } else {
      setLoadError(false);
    }
  }, [error]);

  // Load notifications periodically and when panel opens
  useEffect(() => {
    // Load notifications initially
    fetchNotifications({ perPage: 10 })
      .catch((error) => {
        console.error('Error al cargar notificaciones:', error);
        setLoadError(true);
      });
    
    // Set up interval to update every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications({ perPage: 10 })
        .catch((error) => {
          console.error('Error en actualización periódica:', error);
          setLoadError(true);
        });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Load additional notifications when panel opens
  useEffect(() => {
    if (open) {
      fetchNotifications({ perPage: 10 });
    }
  }, [open, fetchNotifications]);

  // Close panel when clicking outside
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      toast.success('Notificación marcada como leída');
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      toast.error('Error al marcar como leída');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      toast.error('Error al marcar notificaciones');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      toast.success('Todas las notificaciones eliminadas');
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error);
      toast.error('Error al eliminar notificaciones');
    }
  };

  // Format date
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
    console.log('Reintentando carga de notificaciones...');
    fetchNotifications({ perPage: 10 }).catch(() => {
      setLoadError(true);
    });
  };

  const handleForceRefresh = () => {
    console.log('Forzando recarga de notificaciones...');
    toast.success('Actualizando notificaciones...');
    fetchNotifications({ perPage: 10 })
      .then(() => {
        toast.success('Notificaciones actualizadas');
      })
      .catch(error => {
        console.error('Error en recarga forzada:', error);
        toast.error('Error al actualizar notificaciones');
        setLoadError(true);
      });
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    const type = notification.data?.type || '';
    
    if (type.includes('stock')) {
      return <Package className="h-5 w-5 text-warning shrink-0 mt-0.5" />;
    } else if (type.includes('transfer')) {
      return <ArrowRightLeft className="h-5 w-5 text-info shrink-0 mt-0.5" />;
    } else if (type.includes('message')) {
      return <MessageSquare className="h-5 w-5 text-solid-color shrink-0 mt-0.5" />;
    } else {
      return <Bell className="h-5 w-5 text-solid-color shrink-0 mt-0.5" />;
    }
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
              <button 
                onClick={handleDeleteAll}
                className="p-1 rounded-full hover:bg-error/20 text-error"
                title="Eliminar todas las notificaciones"
                disabled={isLoading || notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
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
            ) : (notifications.length === 0) && !isLoading ? (
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
                {notifications.map((notification) => {
                  if (!notification) return null;
                  
                  const isUnread = !notification.read_at;
                  const notificationData = notification.data || {};
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-interactive-component/20 transition-colors ${isUnread ? 'bg-interactive-component/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className={`text-sm flex-1 ${isUnread ? 'font-medium text-accessibility-text' : 'text-text-tertiary'}`}>
                          <div className="flex items-start gap-2">
                            {getNotificationIcon(notification)}
                            <div>
                              <p className="font-medium mb-0.5">{notificationData.title || 'Notificación'}</p>
                              <p>{notificationData.message || notification.data}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 rounded-full hover:bg-info/20 text-info"
                              title="Marcar como leída"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 rounded-full hover:bg-error/20 text-error"
                            title="Eliminar notificación"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-text-tertiary mt-2 flex justify-between">
                        <span>
                          {notificationData.sender_name && `De: ${notificationData.sender_name}`}
                        </span>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                      
                      {notificationData.url && (
                        <div className="mt-2">
                          <a 
                            href={notificationData.url} 
                            className="text-xs text-solid-color hover:underline"
                            onClick={() => {
                              if (isUnread) {
                                handleMarkAsRead(notification.id);
                              }
                              setOpen(false);
                            }}
                          >
                            Ver detalles →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && !loadError && (
            <div className="p-3 border-t border-border bg-interactive-component/10 text-center flex justify-between items-center">
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-solid-color hover:underline"
                disabled={isLoading || unreadCount === 0}
              >
                {isLoading ? 'Procesando...' : 'Marcar todas como leídas'}
              </button>
              
              <Link 
                to="/dashboard/notificaciones" 
                className="text-xs text-solid-color hover:underline"
                onClick={() => setOpen(false)}
              >
                Ver todas las notificaciones →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 