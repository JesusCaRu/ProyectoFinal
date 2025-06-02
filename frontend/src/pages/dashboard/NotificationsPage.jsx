import { useState, useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { 
  Bell, 
  Loader2, 
  X, 
  Check, 
  ArrowRightLeft, 
  Package, 
  MessageSquare, 
  Eye, 
  Trash2, 
  RefreshCcw,
  AlertCircle,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isLoading, 
    error,
    clearError,
    pagination
  } = useNotificationStore();
  
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [currentPage, setCurrentPage] = useState(1);
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

  // Load notifications on initial render and when filter or page changes
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications({
          page: currentPage,
          perPage: 15,
          unread: filter === 'unread'
        });
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        setLoadError(true);
      }
    };
    
    loadNotifications();
  }, [fetchNotifications, filter, currentPage]);

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
    if (window.confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
      try {
        await deleteAllNotifications();
        toast.success('Todas las notificaciones eliminadas');
      } catch (error) {
        console.error('Error al eliminar todas las notificaciones:', error);
        toast.error('Error al eliminar notificaciones');
      }
    }
  };

  const handleRetryLoad = () => {
    setLoadError(false);
    clearError();
    console.log('Reintentando carga de notificaciones...');
    fetchNotifications({ 
      page: currentPage,
      perPage: 15,
      unread: filter === 'unread'
    }).catch(() => {
      setLoadError(true);
    });
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return dateString;
    }
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

  // Pagination
  const totalPages = Math.ceil(pagination.total / pagination.perPage) || 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-accessibility-text">Notificaciones</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-bg-secondary border border-border rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-solid-color text-white' : 'hover:bg-interactive-component'}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${filter === 'unread' ? 'bg-solid-color text-white' : 'hover:bg-interactive-component'}`}
              onClick={() => setFilter('unread')}
            >
              No leídas
            </button>
            <button 
              className={`px-3 py-1.5 text-sm ${filter === 'read' ? 'bg-solid-color text-white' : 'hover:bg-interactive-component'}`}
              onClick={() => setFilter('read')}
            >
              Leídas
            </button>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 px-3 py-1.5 bg-info/20 text-info hover:bg-info/30 rounded-lg text-sm"
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
            <span>Marcar todas como leídas</span>
          </button>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-error/20 text-error hover:bg-error/30 rounded-lg text-sm"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar todas</span>
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin h-8 w-8 text-solid-color" />
          </div>
        )}

        {loadError && !isLoading && (
          <div className="p-12 text-error text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg mb-4">Error al cargar notificaciones</p>
            <button 
              onClick={handleRetryLoad}
              className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center mx-auto gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {!isLoading && !loadError && notifications.length === 0 && (
          <div className="p-12 text-text-tertiary text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No hay notificaciones</p>
            <p className="text-sm mt-2">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer' 
                : filter === 'read' 
                  ? 'No tienes notificaciones leídas'
                  : 'No tienes notificaciones'}
            </p>
          </div>
        )}

        {!isLoading && !loadError && notifications.length > 0 && (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              if (!notification) return null;
              
              const isUnread = !notification.read_at;
              const notificationData = notification.data || {};
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-5 hover:bg-interactive-component/10 transition-colors ${isUnread ? 'bg-interactive-component/5' : ''}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className={`flex-1 ${isUnread ? 'font-medium text-accessibility-text' : 'text-text-tertiary'}`}>
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification)}
                        <div>
                          <p className="font-medium text-base mb-1">{notificationData.title || 'Notificación'}</p>
                          <p className="text-sm">{notificationData.message || notification.data}</p>
                          
                          <div className="mt-3 text-xs text-text-tertiary flex items-center justify-between">
                            <div>
                              {notificationData.sender_name && (
                                <span className="mr-3">De: {notificationData.sender_name}</span>
                              )}
                              <span>{formatDate(notification.created_at)}</span>
                            </div>
                            
                            {notificationData.url && (
                              <Link 
                                to={notificationData.url} 
                                className="text-solid-color hover:underline"
                                onClick={() => {
                                  if (isUnread) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                Ver detalles →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 rounded-full hover:bg-info/20 text-info"
                          title="Marcar como leída"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 rounded-full hover:bg-error/20 text-error"
                        title="Eliminar notificación"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
                  : 'bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary'
              }`}
            >
              Primera
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
                  : 'bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary'
              }`}
            >
              Anterior
            </button>
            
            <span className="px-3 py-1">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
                  : 'bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary'
              }`}
            >
              Siguiente
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-bg-secondary text-text-tertiary cursor-not-allowed'
                  : 'bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary'
              }`}
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 