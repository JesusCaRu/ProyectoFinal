import { BrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion as _motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import AppRoutes from './routes/routes';
import DarkModeToggle from './components/DarkModeToggle';
import LoadingScreen from './components/LoadingScreen';
import './styles/globals.css';
import { useAuthStore } from './store/authStore';
import { setupEchoOnLogin, disconnectEcho, reconnectEcho } from './services/echoService';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const loadUser = useAuthStore(state => state.loadUser);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Handle loading state and network status
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user data
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Initialize Echo for real-time notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Setting up Echo for real-time notifications...');
      setupEchoOnLogin();
    } else {
      console.log('Disconnecting Echo...');
      disconnectEcho();
    }

    return () => {
      disconnectEcho();
    };
  }, [isAuthenticated]);

  // Reconnect Echo when network comes back online
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      console.log('Network is back online, reconnecting Echo...');
      reconnectEcho();
    }
  }, [isOnline, isAuthenticated]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg font-satoshi text-accessibility-text relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgwLDAsMCwwLjAyKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"></div>
          </div>
        </div>

        {/* Network status indicator */}
        {!isOnline && (
          <_motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50"
          >
            You are currently offline. Some features may not be available.
          </_motion.div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <_motion.div
              key="app-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AppRoutes />
            </_motion.div>
          )}
        </AnimatePresence>

        {/* Dark mode toggle with improved positioning */}
        <_motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <DarkModeToggle />
        </_motion.div>

        {/* Enhanced notifications */}
        <Toaster
          position="top-right"
          richColors
          theme="system"
          toastOptions={{
            style: {
              fontFamily: 'Satoshi, sans-serif',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-accessibility-text)'
            },
            className: 'shadow-lg'
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;