import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir al login pero guardar la ubicación a la que intentaban acceder
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 