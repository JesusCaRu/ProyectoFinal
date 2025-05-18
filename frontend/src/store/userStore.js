import { create } from 'zustand';
import axiosInstance from '../lib/axios';

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  // Cargar usuarios
  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/usuarios');
      const users = Array.isArray(response.data) ? response.data : 
                   response.data.data ? response.data.data : 
                   response.data.users ? response.data.users : [];
      set({ users, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar usuarios', 
        isLoading: false,
        users: []
      });
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/usuarios', {
        ...userData,
        sede_id: 1 // Por defecto asignamos a la sede principal
      });
      const newUser = response.data.data || response.data;
      set(state => ({ 
        users: [...state.users, newUser],
        isLoading: false 
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al crear usuario', 
        isLoading: false 
      });
      return false;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/usuarios/${id}`, userData);
      const updatedUser = response.data.data || response.data;
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? updatedUser : user
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar usuario', 
        isLoading: false 
      });
      return false;
    }
  },

  // Cambiar estado del usuario
  cambiarEstado: async (id, activo) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.patch(`/usuarios/${id}/estado`, { activo });
      const updatedUser = response.data.data || response.data;
      set(state => ({
        users: state.users.map(user => 
          user.id === id ? updatedUser : user
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cambiar estado del usuario', 
        isLoading: false 
      });
      return false;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/usuarios/${id}`);
      
      // Actualizamos el estado local eliminando el usuario
      set(state => ({
        users: state.users.filter(user => user.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al eliminar usuario', 
        isLoading: false 
      });
      return false;
    }
  },

  // Buscar usuarios
  searchUsers: (query) => {
    const { users } = get();
    if (!query) return users;
    
    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.nombre?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.rol?.nombre?.toLowerCase().includes(searchTerm)
    );
  },

  // Filtrar usuarios por rol
  filterUsersByRole: (roleId) => {
    const { users } = get();
    if (!roleId) return users;
    return users.filter(user => user.rol_id === roleId);
  },

  // Cargar roles
  loadRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/roles');
      const roles = Array.isArray(response.data) ? response.data : 
                   response.data.data ? response.data.data : 
                   response.data.roles ? response.data.roles : [];
      set({ roles, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar roles', 
        isLoading: false,
        roles: []
      });
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/usuarios/${id}`);
      const user = response.data.data || response.data;
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al obtener usuario', 
        isLoading: false 
      });
      return null;
    }
  },

  // Restaurar usuario
  restoreUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post(`/usuarios/${id}/restore`);
      
      // Actualizamos el estado local
      set(state => ({
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al restaurar usuario', 
        isLoading: false 
      });
      return false;
    }
  }
})); 