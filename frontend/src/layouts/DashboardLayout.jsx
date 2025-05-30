import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UserProfileModal from '../components/UserProfileModal';
import NotificationBell from '../components/NotificationBell';
import SendMessageModal from '../components/SendMessageModal';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldUser,
  Store,
  DollarSign,
  Building2,
  MessageSquare
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveringCollapse, setHoveringCollapse] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Cerrar el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Definir las opciones de navegación según el rol
  const getNavigationByRole = () => {
    const baseNavigation = [
      {
        category: 'Principal',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ],
      }
    ];

    // Opciones específicas por rol
    const roleSpecificOptions = {
      'Administrador': [
        {
          category: 'Administración',
          items: [
            { name: 'Usuarios', path: '/dashboard/usuarios', icon: Users },
            { name: 'Gestiones', path: '/dashboard/gestiones', icon: ShieldUser },
            { name: 'Auditoría', path: '/dashboard/auditoria', icon: Activity },
            { name: 'Configuración', path: '/dashboard/configuracion', icon: Settings },
          ],
        },
        {
          category: 'Gestión',
          items: [
            { name: 'Inventario', path: '/dashboard/inventario', icon: Package },
            { name: 'Ventas', path: '/dashboard/ventas', icon: DollarSign },
            { name: 'Compras', path: '/dashboard/compras', icon: Store },
            { name: 'Sedes', path: '/dashboard/sedes', icon: Building2 },
          ],
        },
        {
          category: 'Reportes',
          items: [
            { name: 'Reportes', path: '/dashboard/reportes', icon: BarChart2 },
            { name: 'Facturas', path: '/dashboard/facturas', icon: FileText },
          ],
        },
      ],
      'Vendedor': [
        {
          category: 'Ventas',
          items: [
            { name: 'Nueva Venta', path: '/dashboard/ventas', icon: ShoppingCart },
            { name: 'Catálogo', path: '/dashboard/catalogo', icon: Package },
            { name: 'Historial', path: '/dashboard/historial-ventas', icon: FileText },
          ],
        },
        {
          category: 'Compras',
          items: [
            { name: 'Nueva Compra', path: '/dashboard/compras', icon: Store },
          ],
        },
        {
          category: 'Reportes',
          items: [
            { name: 'Reportes', path: '/dashboard/reportes', icon: BarChart2 },
            { name: 'Facturas', path: '/dashboard/facturas', icon: FileText },
          ],
        },
      ],
      'Almacenista': [
        {
          category: 'Gestión',
          items: [
            { name: 'Inventario', path: '/dashboard/inventario', icon: Package },
            { name: 'Sedes', path: '/dashboard/sedes', icon: Building2 },
            { name: 'Historial', path: '/dashboard/historial', icon: FileText },
          ],
        },
      ],
    };

    // Obtener las opciones según el rol del usuario
    const userRole = user?.data?.rol?.nombre || 'Vendedor';
    console.log('Rol del usuario:', userRole);
    const roleOptions = roleSpecificOptions[userRole] || roleSpecificOptions['Vendedor'];

    // Asegurarse de que siempre devolvemos un array válido
    if (!Array.isArray(roleOptions)) {
      console.error(`Rol no válido: ${userRole}, usando opciones por defecto`);
      return [...baseNavigation, ...roleSpecificOptions['Vendedor']];
    }

    return [...baseNavigation, ...roleOptions];
  };

  const navigation = getNavigationByRole();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-bg font-satoshi">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-secondary border border-border text-accessibility-text hover:bg-interactive-component transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-bg-secondary border-r border-border flex flex-col`}
        onMouseEnter={() => setHoveringCollapse(true)}
        onMouseLeave={() => setHoveringCollapse(false)}
      >
        {/* Collapse button that appears on hover */}
        {hoveringCollapse && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-solid-color shadow-md flex items-center justify-center text-white transition-transform hover:scale-110 hover:bg-solid-color-hover active:bg-solid-color-active`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {/* Logo and header */}
        <div className="p-4 flex items-center justify-between border-b border-border h-16">
          {!isCollapsed ? (
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/assets/logo.png" 
                alt="RobotStock Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-accessibility-text">
                StockFlow
              </h1>
            </Link>
          ) : (
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
              <img 
                src="/assets/logo.png" 
                alt="RobotStock Logo" 
                className="h-8 w-auto mx-auto"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navigation.map((section) => (
            <div key={section.category} className="mb-6 last:mb-0">
              {!isCollapsed && (
                <h2 className="px-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
                  {section.category}
                </h2>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-lg mx-2 transition-all ${
                        isActive
                          ? 'bg-solid-color text-white shadow-md hover:bg-solid-color-hover active:bg-solid-color-active'
                          : 'text-accessibility-text hover:bg-interactive-component hover:text-accessibility-text'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-accessibility-text'}`} />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">{item.name}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile and logout */}
        <div className="border-t border-border p-4">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-3 mb-4 cursor-pointer hover:bg-interactive-component p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solid-color to-solid-color-secondary flex items-center justify-center shrink-0">
              <span className="text-white font-semibold">
                {user?.data.nombre?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>  
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-accessibility-text truncate">
                  {user?.data.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {user?.data.email || 'usuario@ejemplo.com'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-accessibility-text hover:bg-interactive-component hover:text-solid-color transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional top header bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-bg-secondary">
          <h2 className="text-lg font-medium text-accessibility-text">
            {navigation
              .flatMap(section => section.items)
              .find(item => location.pathname === item.path)?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="p-2 rounded-full bg-interactive-component text-accessibility-text hover:bg-interactive-component-secondary transition-colors border border-border"
              title="Enviar mensaje"
            >
              <MessageSquare className="h-6 w-6" />
            </button>
            <div className='mr-12'>
              <NotificationBell />
            </div>
          </div>
        </header>
        
        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg">
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user?.data}
      />

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;