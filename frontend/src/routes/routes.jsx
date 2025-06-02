import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import VendedorDashboard from '../pages/Dashboard/VendedorDashboard';
import DashboardAlmacenista from '../pages/Dashboard/DashboardAlmacenista';
import Inventario from '../pages/Dashboard/Inventario';
import Ventas from '../pages/Dashboard/Ventas';
import Compras from '../pages/Dashboard/Compras';
import Reportes from '../pages/Dashboard/Reportes';
import Facturas from '../pages/Dashboard/Facturas';
import Usuarios from '../pages/Dashboard/Usuarios';
import Configuracion from '../pages/Dashboard/Configuracion';
import Gestiones from '../pages/Dashboard/Gestiones';
import Sedes from '../pages/Dashboard/Sedes';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Auditoria from '../pages/Dashboard/Auditoria';
import CatalogoProductos from '../pages/Dashboard/CatalogoProductos';
import HistorialVentas from '../pages/Dashboard/HistorialVentas';
import { useAuthStore } from '../store/authStore';
import HistorialMovimientos from '../pages/Dashboard/HistorialMovimientos';
import NotificationsPage from '../pages/Dashboard/NotificationsPage';
import VerificacionPendiente from '../pages/Dashboard/VerificacionPendiente';

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
                  <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Almacenista']}>
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
