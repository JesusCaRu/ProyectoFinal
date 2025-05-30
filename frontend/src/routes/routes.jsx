import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import VendedorDashboard from '../pages/dashboard/VendedorDashboard';
import DashboardAlmacenista from '../pages/dashboard/DashboardAlmacenista';
import Inventario from '../pages/dashboard/Inventario';
import Ventas from '../pages/dashboard/Ventas';
import Compras from '../pages/dashboard/Compras';
import Reportes from '../pages/dashboard/Reportes';
import Facturas from '../pages/dashboard/Facturas';
import Usuarios from '../pages/dashboard/Usuarios';
import Configuracion from '../pages/dashboard/Configuracion';
import Gestiones from '../pages/dashboard/Gestiones';
import Sedes from '../pages/dashboard/Sedes';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Auditoria from '../pages/dashboard/Auditoria';
import CatalogoProductos from '../pages/dashboard/CatalogoProductos';
import HistorialVentas from '../pages/dashboard/HistorialVentas';
import { useAuthStore } from '../store/authStore';
import HistorialMovimientos from '../pages/dashboard/HistorialMovimientos';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import VerificacionPendiente from '../pages/dashboard/VerificacionPendiente';

const DashboardRouter = () => {
  const { user } = useAuthStore();
  const userRole = user?.data?.rol?.nombre;
  
  if (userRole === 'Vendedor') {
    return <VendedorDashboard />;
  }
  
  if (userRole === 'Almacenista') {
    return <DashboardAlmacenista />;
  }
  
  return <Dashboard />;
};

// Componente para verificar si el usuario tiene rol
const RequireRol = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user?.data?.rol?.nombre) {
    return <Navigate to="/dashboard/verificacion-pendiente" replace />;
  }
  
  return children;
};

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
              {/* Ruta para usuarios pendientes de verificación */}
              <Route path="verificacion-pendiente" element={<VerificacionPendiente />} />
              
              {/* Rutas que requieren rol */}
              <Route index element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista', 'Vendedor']}>
                    <DashboardRouter />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="historial" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Almacenista']}>
                    <HistorialMovimientos />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              
              {/* Rutas para administradores */}
              <Route path="inventario" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista']}>
                    <Inventario />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="usuarios" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador']}>
                    <Usuarios />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="configuracion" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador']}>
                    <Configuracion />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="facturas" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <Facturas />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="gestiones" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador']}>
                    <Gestiones />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="auditoria" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador']}>
                    <Auditoria />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="sedes" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista']}>
                    <Sedes />
                  </RoleProtectedRoute>
                </RequireRol>
              } />

              {/* Rutas para vendedores y administradores */}
              <Route path="ventas" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <Ventas />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="compras" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <Compras />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="reportes" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <Reportes />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="catalogo" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <CatalogoProductos />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
              <Route path="historial-ventas" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                    <HistorialVentas />
                  </RoleProtectedRoute>
                </RequireRol>
              } />

              {/* Ruta de notificaciones (accesible para todos los roles) */}
              <Route path="notificaciones" element={
                <RequireRol>
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Almacenista']}>
                    <NotificationsPage />
                  </RoleProtectedRoute>
                </RequireRol>
              } />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
