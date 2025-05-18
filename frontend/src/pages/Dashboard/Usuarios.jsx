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
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const Usuarios = () => {
  const { 
    users, 
    loadUsers,
    deleteUser
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
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/users/${userId}/status`, 
        { activo: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const getStatusIcon = (status) => {
    return status === 1 ? 
      <UserCheck className="h-4 w-4 text-success" /> : 
      <UserX className="h-4 w-4 text-error" />;
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
      icon: <Users className="h-6 w-6 text-solid-color" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Usuarios Activos',
      value: users.filter(u => u.activo === 1).length.toString(),
      icon: <UserCheck className="h-6 w-6 text-success" />,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Usuarios Inactivos',
      value: users.filter(u => u.activo === 0).length.toString(),
      icon: <UserX className="h-6 w-6 text-error" />,
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-solid-color" />
          <h1 className="text-2xl font-bold text-accessibility-text">Usuarios</h1>
        </div>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-interactive-component rounded-lg">
                {stat.icon}
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="mt-4 text-sm text-text-tertiary">{stat.title}</h3>
            <p className="mt-1 text-2xl font-semibold text-accessibility-text">
              {stat.value}
            </p>
          </_motion.div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
        >
          <option value="">Todos los roles</option>
          <option value="1">Administrador</option>
          <option value="2">Vendedor</option>
          <option value="3">Almacén</option>
        </select>
        <button className="px-4 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="bg-bg rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-interactive-component">
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-8 py-4 text-left text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-8 py-4 text-right text-sm font-medium text-text-tertiary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-interactive-component/50 transition-colors duration-200">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-solid-color/20 flex items-center justify-center text-xl font-bold text-solid-color">
                        {getInitials(user.nombre)}
                      </div>
                      <div>
                        <div className="text-base font-medium text-accessibility-text">
                          {user.nombre}
                        </div>
                        <div className="text-sm text-text-tertiary">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-text-tertiary" />
                      <span className="text-base text-text-tertiary">{getRoleName(user.rol_id)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-text-tertiary" />
                      <span className="text-base text-text-tertiary">{getSedeName(user.sede_id)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-text-tertiary" />
                      <span className="text-base text-text-tertiary">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(user.activo)}
                      <span className={`text-base font-medium ${getStatusColor(user.activo)} px-3 py-1.5 rounded-full`}>
                        {getStatusText(user.activo)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-base text-text-tertiary">
                      {formatUltimoAcceso(user.ultimo_acceso)}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleStatusChange(user.id, user.activo === 1 ? 0 : 1)}
                        className={`p-2 ${user.activo === 1 ? 'text-error hover:text-error-hover' : 'text-success hover:text-success-hover'} rounded-lg transition-colors duration-200`}
                      >
                        {user.activo === 1 ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        className="p-2 text-error hover:text-error-hover rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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