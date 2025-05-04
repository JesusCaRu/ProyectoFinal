import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Inventario from '../pages/dashboard/Inventario';
import Ventas from '../pages/dashboard/Ventas';
import Compras from '../pages/dashboard/Compras';
import Reportes from '../pages/dashboard/Reportes';
import Facturas from '../pages/dashboard/Facturas';
import Usuarios from '../pages/dashboard/Usuarios';
import Configuracion from '../pages/dashboard/Configuracion';
import ProtectedRoute from '../components/ProtectedRoute';
import Notificaciones from '../pages/dashboard/Notificaciones';

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

      {/* Rutas protegidas del dashboard */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="compras" element={<Compras />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="facturas" element={<Facturas />} />
              <Route path="notificaciones" element={<Notificaciones />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
