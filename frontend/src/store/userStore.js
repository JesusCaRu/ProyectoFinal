import { create } from 'zustand';
import { userService } from '../services/userService';

export const useUserStore = create((set, get) => ({
  users: [],
  roles: [],
  isLoading: false,
  error: null,

  // Cargar usuarios
  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.fetchUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false,
        users: []
      });
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userService.createUser(userData);
      set(state => ({ 
        users: [...state.users, newUser],
        isLoading: false 
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(id, userData);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
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
      const roles = await userService.loadRoles();
      set({ roles, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false,
        roles: []
      });
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getUserById(id);
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return null;
    }
  },

  // Restaurar usuario
  restoreUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userService.restoreUser(id);
      set(state => ({
        isLoading: false,
        users: state.users.map(user => 
          user.id === id ? { ...user, deleted_at: null } : user
        )
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  updateUserStatus: async (userId, newStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateUserStatus(userId, newStatus);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  }
})); 