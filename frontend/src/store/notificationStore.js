import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
      },
      
      // Fetch notifications with optional parameters
      fetchNotifications: async (params = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await notificationService.fetchNotifications({
            page: params.page || get().pagination.currentPage,
            perPage: params.perPage || get().pagination.perPage,
            unread: params.unread || false
          });
          
          set({
            notifications: response.data || [],
            pagination: {
              currentPage: response.current_page || 1,
              lastPage: response.last_page || 1,
              perPage: response.per_page || 10,
              total: response.total || 0
            },
            unreadCount: (response.data || []).filter(n => !n.read_at).length,
            isLoading: false
          });
          
          return response;
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ error: error.message, isLoading: false });
          return { data: [], meta: {} };
        }
      },
      
      // Mark a notification as read
      markAsRead: async (notificationId) => {
        try {
          set({ isLoading: true, error: null });
          
          await notificationService.markAsRead(notificationId);
          
          set(state => {
            const updatedNotifications = state.notifications.map(notification => 
              notification.id === notificationId 
                ? { ...notification, read_at: new Date().toISOString() } 
                : notification
            );
            
            return {
              notifications: updatedNotifications,
              unreadCount: updatedNotifications.filter(n => !n.read_at).length,
              isLoading: false
            };
          });
          
          return true;
        } catch (error) {
          console.error('Error marking notification as read:', error);
          set({ error: error.message, isLoading: false });
          toast.error('Error al marcar notificación como leída');
          return false;
        }
      },
      
      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          set({ isLoading: true, error: null });
          
          await notificationService.markAllAsRead();
          
          set(state => {
            const updatedNotifications = state.notifications.map(notification => 
              !notification.read_at 
                ? { ...notification, read_at: new Date().toISOString() } 
                : notification
            );
            
            return {
              notifications: updatedNotifications,
              unreadCount: 0,
              isLoading: false
            };
          });
          
          return true;
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          set({ error: error.message, isLoading: false });
          toast.error('Error al marcar todas las notificaciones como leídas');
          return false;
        }
      },
      
      // Delete a notification
      deleteNotification: async (notificationId) => {
        try {
          set({ isLoading: true, error: null });
          
          await notificationService.deleteNotification(notificationId);
          
          set(state => {
            const updatedNotifications = state.notifications.filter(
              notification => notification.id !== notificationId
            );
            
            return {
              notifications: updatedNotifications,
              unreadCount: updatedNotifications.filter(n => !n.read_at).length,
              isLoading: false
            };
          });
          
          return true;
        } catch (error) {
          console.error('Error deleting notification:', error);
          set({ error: error.message, isLoading: false });
          toast.error('Error al eliminar notificación');
          return false;
        }
      },
      
      // Delete all notifications
      deleteAllNotifications: async () => {
        try {
          set({ isLoading: true, error: null });
          
          await notificationService.deleteAllNotifications();
          
          set({
            notifications: [],
            unreadCount: 0,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          console.error('Error deleting all notifications:', error);
          set({ error: error.message, isLoading: false });
          toast.error('Error al eliminar todas las notificaciones');
          return false;
        }
      },
      
      // Add a new notification (used when receiving real-time notifications)
      addNotification: (notification) => {
        set(state => {
          const exists = state.notifications.some(n => n.id === notification.id);
          
          if (exists) return state;
          
          const updatedNotifications = [notification, ...state.notifications];
          
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read_at).length
          };
        });
      },
      
      // Clear any errors
      clearError: () => set({ error: null })
    }),
    {
      name: 'stockflow-notifications',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
); 