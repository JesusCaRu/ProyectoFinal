import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Bell, Package, ArrowRightLeft, MessageSquare } from 'lucide-react';

let echoInstance = null;

export const initializeEcho = () => {
  try {
    // Check if Echo is already initialized
    if (echoInstance) {
      console.log('Echo already initialized');
      return echoInstance;
    }

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found, skipping Echo initialization');
      return null;
    }

    // Get user data
    const userData = localStorage.getItem('stockflow-auth');
    if (!userData) {
      console.log('No user data found, skipping Echo initialization');
      return null;
    }

    const user = JSON.parse(userData).state?.user;
    if (!user || !user.id) {
      console.log('Invalid user data, skipping Echo initialization');
      return null;
    }

    // Initialize Pusher
    window.Pusher = Pusher;

    // Initialize Echo
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY || 'local',
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
      wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
      wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
      wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
      forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      authEndpoint: `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    console.log('Echo initialized successfully');
    return echoInstance;
  } catch (error) {
    console.error('Error initializing Echo:', error);
    return null;
  }
};

export const subscribeToNotifications = () => {
  try {
    const echo = initializeEcho();
    if (!echo) return null;

    // Get user data
    const userData = localStorage.getItem('stockflow-auth');
    if (!userData) return null;

    const user = JSON.parse(userData).state?.user;
    if (!user || !user.id) return null;

    // Get notification store
    const addNotification = useNotificationStore.getState().addNotification;

    // Subscribe to user's private channel
    const userChannel = echo.private(`App.Models.Usuario.${user.id}`);
    
    userChannel.notification((notification) => {
      console.log('New notification received:', notification);
      
      // Add notification to store
      addNotification(notification);
      
      // Show toast notification
      toast.success(notification.data.title || 'Nueva notificación', {
        description: notification.data.message,
        duration: 5000,
        position: 'top-right',
      });
    });

    // Subscribe to sede channel if user has a sede
    if (user.sede_id) {
      echo.private(`sede.${user.sede_id}`).notification((notification) => {
        console.log('New sede notification received:', notification);
        addNotification(notification);
        
        toast.success(notification.data.title || 'Nueva notificación', {
          description: notification.data.message,
          duration: 5000,
          position: 'top-right',
        });
      });
    }

    // Subscribe to role channel
    if (user.rol_id) {
      echo.private(`role.${user.rol_id}`).notification((notification) => {
        console.log('New role notification received:', notification);
        addNotification(notification);
        
        toast.success(notification.data.title || 'Nueva notificación', {
          description: notification.data.message,
          duration: 5000,
          position: 'top-right',
        });
      });
    }

    return echo;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return null;
  }
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('Echo disconnected');
  }
};

// Helper to reconnect Echo when token changes
export const reconnectEcho = () => {
  disconnectEcho();
  return initializeEcho();
};

// Automatically initialize Echo when this module is imported
// This should be imported in a top-level component like App.jsx
export const setupEchoOnLogin = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  
  if (isAuthenticated) {
    console.log('User is authenticated, initializing Echo');
    subscribeToNotifications();
  } else {
    console.log('User is not authenticated, skipping Echo initialization');
  }
}; 