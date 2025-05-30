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
              {/* Rutas accesibles para todos los roles */}
              <Route index element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista', 'Vendedor']}>
                  <DashboardRouter />
                </RoleProtectedRoute>
              } />
              <Route path="historial" element={
                <RoleProtectedRoute allowedRoles={['Almacenista']}>
                  <HistorialMovimientos />
                </RoleProtectedRoute>
              } />
              
              {/* Rutas para administradores */}
              <Route path="inventario" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista']}>
                  <Inventario />
                </RoleProtectedRoute>
              } />
              <Route path="usuarios" element={
                <RoleProtectedRoute allowedRoles={['Administrador']}>
                  <Usuarios />
                </RoleProtectedRoute>
              } />
              <Route path="configuracion" element={
                <RoleProtectedRoute allowedRoles={['Administrador']}>
                  <Configuracion />
                </RoleProtectedRoute>
              } />
              <Route path="facturas" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <Facturas />
                </RoleProtectedRoute>
              } />
              <Route path="gestiones" element={
                <RoleProtectedRoute allowedRoles={['Administrador']}>
                  <Gestiones />
                </RoleProtectedRoute>
              } />
              <Route path="auditoria" element={
                <RoleProtectedRoute allowedRoles={['Administrador']}>
                  <Auditoria />
                </RoleProtectedRoute>
              } />
              <Route path="sedes" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Almacenista']}>
                  <Sedes />
                </RoleProtectedRoute>
              } />

              {/* Rutas para vendedores y administradores */}
              <Route path="ventas" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <Ventas />
                </RoleProtectedRoute>
              } />
              <Route path="compras" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <Compras />
                </RoleProtectedRoute>
              } />
              <Route path="reportes" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <Reportes />
                </RoleProtectedRoute>
              } />
              <Route path="catalogo" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <CatalogoProductos />
                </RoleProtectedRoute>
              } />
              <Route path="historial-ventas" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor']}>
                  <HistorialVentas />
                </RoleProtectedRoute>
              } />

              {/* Ruta de notificaciones (accesible para todos los roles) */}
              <Route path="notificaciones" element={
                <RoleProtectedRoute allowedRoles={['Administrador', 'Vendedor', 'Almacenista']}>
                  <NotificationsPage />
                </RoleProtectedRoute>
              } />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
