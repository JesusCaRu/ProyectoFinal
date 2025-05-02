import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirige la ruta raíz a la página de inicio de sesión */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      
      {/* Rutas de autenticación */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div>Dashboard</div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
