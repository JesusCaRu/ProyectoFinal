import { motion as _motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Mail,
  User,
  Shield,
  Edit,
  Trash2,
  Building,
  Phone,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useSedeStore } from '../../store/sedeStore';
import Modal from '../../components/Modal';
import UserForm from '../../components/UserForm';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const Usuarios = () => {
  const { 
    users, 
    loadUsers,
    deleteUser,
    updateUserStatus
  } = useUserStore();
  const { sedes, fetchSedes } = useSedeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadUsers(), fetchSedes()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [loadUsers, fetchSedes]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      toast.loading('Cambiando estado...', { id: 'statusChange' });
      
      const success = await updateUserStatus(userId, newStatus);
      
      if (success) {
        toast.success(`Usuario ${newStatus === 1 ? 'activado' : 'desactivado'} correctamente`, 
          { id: 'statusChange' }
        );
      } else {
        toast.error('Error al cambiar el estado del usuario', 
          { id: 'statusChange' }
        );
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.message || 'Error al cambiar el estado del usuario', 
        { id: 'statusChange' }
      );
    }
  };

  const getStatusIcon = (status) => {
    return status === 1 ? 
      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-success" /> : 
      <UserX className="h-3 w-3 sm:h-4 sm:w-4 text-error" />;
  };

  const getStatusColor = (status) => {
    return status === 1 ? 
      'bg-success/10 text-success' : 
      'bg-error/10 text-error';
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Activo' : 'Inactivo';
  };

  const getSedeName = (sedeId) => {
    const sede = sedes.find(s => s.id === sedeId);
    return sede ? sede.nombre : 'No asignada';
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Vendedor';
      case 3:
        return 'Almacén';
      default:
        return 'Desconocido';
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatUltimoAcceso = (fecha) => {
    if (!fecha) return 'Nunca';
    try {
      const dateObj = new Date(fecha);
      return `${format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })} (${formatDistanceToNow(dateObj, { addSuffix: true, locale: es })})`;
    } catch {
      return fecha;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.rol_id === parseInt(selectedRole);
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      title: 'Usuarios Totales',
      value: users.length.toString(),
      icon: <Users className="h-4 w-4 sm:h-6 sm:w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Usuarios Activos',
      value: users.filter(u => u.activo === 1).length.toString(),
      icon: <UserCheck className="h-4 w-4 sm:h-6 sm:w-6 text-success" />,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Usuarios Inactivos',
      value: users.filter(u => u.activo === 0).length.toString(),
      icon: <UserX className="h-4 w-4 sm:h-6 sm:w-6 text-error" />,
      change: '-2%',
      trend: 'down'
    }
  ];

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-solid-color" />
          <h1 className="text-xl sm:text-2xl font-bold text-accessibility-text">Usuarios</h1>
        </div>
        <button 
          onClick={handleCreate}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center justify-center sm:justify-start space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-3 sm:p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 bg-interactive-component rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="mt-2 sm:mt-4 text-xs sm:text-sm text-text-tertiary">{stat.title}</h3>
            <p className="mt-1 text-lg sm:text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="w-full sm:flex-1 relative">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-1.5 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="1">Administrador</option>
            <option value="2">Vendedor</option>
            <option value="3">Almacén</option>
          </select>
          <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm">Filtrar</span>
          </button>
        </div>
      </div>

      {/* Tabla para pantallas grandes */}
      <div className="hidden sm:block bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-left text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-4 py-3 sm:px-8 sm:py-4 text-right text-xs sm:text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-solid-color/20 flex items-center justify-center text-sm sm:text-xl font-bold text-solid-color">
                        {getInitials(user.nombre)}
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-medium text-accessibility-text">
                          {user.nombre}
                        </div>
                        <div className="text-xs sm:text-sm text-text-tertiary">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                      <span className="text-sm sm:text-base text-text-tertiary">{getRoleName(user.rol_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                      <span className="text-sm sm:text-base text-text-tertiary">{getSedeName(user.sede_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" />
                      <span className="text-sm sm:text-base text-text-tertiary">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {getStatusIcon(user.activo)}
                      <span className={`text-xs sm:text-base font-medium ${getStatusColor(user.activo)} px-2 py-1 sm:px-3 sm:py-1.5 rounded-full`}>
                        {getStatusText(user.activo)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap">
                    <div className="text-xs sm:text-base text-text-tertiary">
                      {formatUltimoAcceso(user.ultimo_acceso)}
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-8 sm:py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-3">
                      <button 
                        onClick={() => handleStatusChange(user.id, user.activo === 1 ? 0 : 1)}
                        className={`p-1 sm:p-2 ${user.activo === 1 ? 'text-error hover:text-error-hover' : 'text-success hover:text-success-hover'} rounded-lg transition-colors duration-200`}
                        title={user.activo === 1 ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {user.activo === 1 ? 
                          <UserX className="h-4 w-4 sm:h-5 sm:w-5" /> : 
                          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-1 sm:p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        className="p-1 sm:p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-bg rounded-lg shadow-sm border border-border p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-solid-color/20 flex items-center justify-center text-lg font-bold text-solid-color">
                  {getInitials(user.nombre)}
                </div>
                <div>
                  <div className="text-sm font-medium text-accessibility-text">
                    {user.nombre}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {user.email}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(user.activo)} px-2 py-1 rounded-full flex items-center gap-1`}>
                {getStatusIcon(user.activo)}
                {getStatusText(user.activo)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-text-tertiary">{getRoleName(user.rol_id)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-text-tertiary">{getSedeName(user.sede_id)}</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Mail className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="text-text-tertiary truncate">{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-xs text-text-tertiary">
                Último acceso: {formatUltimoAcceso(user.ultimo_acceso)}
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleStatusChange(user.id, user.activo === 1 ? 0 : 1)}
                  className={`p-1 ${user.activo === 1 ? 'text-error hover:text-error-hover' : 'text-success hover:text-success-hover'} rounded-md transition-colors duration-200`}
                  title={user.activo === 1 ? 'Desactivar usuario' : 'Activar usuario'}
                >
                  {user.activo === 1 ? 
                    <UserX className="h-4 w-4" /> : 
                    <UserCheck className="h-4 w-4" />
                  }
                </button>
                <button 
                  onClick={() => handleEdit(user)}
                  className="p-1 text-info hover:text-info-hover rounded-md transition-colors duration-200"
                  title="Editar usuario"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(user)}
                  className="p-1 text-error hover:text-error-hover rounded-md transition-colors duration-200"
                  title="Eliminar usuario"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <UserForm
          user={selectedUser}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            ¿Estás seguro de que deseas eliminar al usuario {userToDelete?.nombre}?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Usuarios; 