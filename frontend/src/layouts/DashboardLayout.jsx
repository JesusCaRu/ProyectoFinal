import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
  ChevronLeft
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveringCollapse, setHoveringCollapse] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const navigation = [
    {
      category: 'Principal',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Gestión',
      items: [
        { name: 'Inventario', path: '/dashboard/inventario', icon: Package },
        { name: 'Ventas', path: '/dashboard/ventas', icon: ShoppingCart },
        { name: 'Compras', path: '/dashboard/compras', icon: ShoppingBag },
      ],
    },
    {
      category: 'Reportes',
      items: [
        { name: 'Reportes', path: '/dashboard/reportes', icon: BarChart2 },
        { name: 'Facturas', path: '/dashboard/facturas', icon: FileText },
      ],
    },
    {
      category: 'Administración',
      items: [
        { name: 'Usuarios', path: '/dashboard/usuarios', icon: Users },
        { name: 'Configuración', path: '/dashboard/configuracion', icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-bg font-satoshi">
      {/* Sidebar */}
      <aside
        className={`relative ${isCollapsed ? 'w-20' : 'w-64'} bg-bg-secondary border-r border-border transition-all duration-300 ease-in-out flex flex-col`}
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
          <div className="flex items-center space-x-3 mb-4">
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Optional top header bar */}
        <header className="h-16 border-b border-border flex items-center px-6 bg-bg-secondary">
          <h2 className="text-lg font-medium text-accessibility-text">
            {navigation
              .flatMap(section => section.items)
              .find(item => location.pathname === item.path)?.name || 'Dashboard'}
          </h2>
        </header>
        
        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;