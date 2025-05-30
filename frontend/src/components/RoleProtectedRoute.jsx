import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const userRole = user?.data?.rol?.nombre;

  // Si el usuario no tiene rol, redirigir a la página de verificación pendiente
  if (!userRole) {
    return <Navigate to="/dashboard/verificacion-pendiente" replace />;
  }

  // Si el rol del usuario no está en los roles permitidos, redirigir al dashboard
  if (!allowedRoles.includes(userRole)) {
    console.warn(`Acceso denegado: El rol ${userRole} no tiene permiso para acceder a esta ruta`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute; 