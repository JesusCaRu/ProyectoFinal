import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to check if token exists
const checkAuthToken = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const notificationService = {
  fetchNotifications: async (params = {}) => {
    try {
      if (!checkAuthToken()) {
        console.error('No hay token de autenticación');
        return { data: [], meta: {} };
      }

      const queryParams = new URLSearchParams();
      if (params.unread) queryParams.append('unread', true);
      if (params.perPage) queryParams.append('per_page', params.perPage);
      if (params.page) queryParams.append('page', params.page);

      const url = `${API_URL}/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Fetching notifications from:', url);
      
      const response = await axiosInstance.get(url);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return { data: [], meta: {} };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener notificaciones');
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.put(`${API_URL}/notifications/${notificationId}/mark-as-read`);
      
      if (response.data && response.data.success) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Error al marcar notificación como leída');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar notificación como leída');
    }
  },
  
  markAllAsRead: async () => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.put(`${API_URL}/notifications/mark-all-as-read`);
      
      if (response.data && response.data.success) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Error al marcar todas las notificaciones como leídas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Error al marcar todas las notificaciones como leídas');
    }
  },
  
  deleteNotification: async (notificationId) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.delete(`${API_URL}/notifications/${notificationId}`);
      
      if (response.data && response.data.success) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Error al eliminar notificación');
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar notificación');
    }
  },
  
  deleteAllNotifications: async () => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.delete(`${API_URL}/notifications`);
      
      if (response.data && response.data.success) {
        return true;
      }
      
      throw new Error(response.data?.message || 'Error al eliminar todas las notificaciones');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar todas las notificaciones');
    }
  }
}; 