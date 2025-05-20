import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/login`, credentials);
      const { token, data: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Respuesta inválida del servidor');
      }

      if (userData.activo === 0) {
        throw new Error('Tu cuenta está inactiva. Por favor, contacta al administrador.');
      }

      localStorage.setItem('token', token);
      return { token, user: { data: userData } };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/register`, {
        ...userData,
        sede_id: 1,
        activo: 1
      });
      const { token, data: user } = response.data;

      if (!token || !user) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('token', token);
      return { token, user: { data: { ...user, activo: user.activo ?? 1 } } };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await axiosInstance.get(`${API_URL}/me`);
      const userData = response.data.data;
      return { data: { ...userData, activo: userData.activo ?? 1 } };
    } catch (e) {
      console.log(e); 
      localStorage.removeItem('token');
      throw new Error('Error al cargar usuario');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
}; 