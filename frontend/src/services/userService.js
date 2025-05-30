import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const userService = {
  fetchUsers: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/usuarios`);
      return Array.isArray(response.data) ? response.data : 
             response.data.data ? response.data.data : 
             response.data.users ? response.data.users : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar usuarios');
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/usuarios`, {
        ...userData,
        sede_id: 1 // Por defecto asignamos a la sede principal
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/usuarios/${id}`, userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  deleteUser: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/usuarios/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  },

  updateUserStatus: async (userId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/usuarios/${userId}/estado`, 
        { activo: newStatus }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  },

  loadRoles: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/roles`);
      return Array.isArray(response.data) ? response.data : 
             response.data.data ? response.data.data : 
             response.data.roles ? response.data.roles : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar roles');
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/usuarios/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  },

  restoreUser: async (id) => {
    try {
      await axiosInstance.post(`${API_URL}/usuarios/${id}/restore`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al restaurar usuario');
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/usuarios/me`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/usuarios/me`, userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  },

  // Actualizar contraseña
  updatePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/usuarios/me/password`, passwordData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la contraseña');
    }
  },

  // Subir avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post(`${API_URL}/usuarios/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al subir el avatar');
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await axiosInstance.post(`${API_URL}/logout`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
    }
  }
}; 