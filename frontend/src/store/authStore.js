import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      console.log('Intentando cargar usuario con token:', token);
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Respuesta de carga de usuario:', response.data);
      
      const userData = response.data.data;
      console.log('Datos de usuario procesados:', userData);
      
      set({ 
        user: { 
          data: {
            ...userData,
            activo: userData.activo ?? 1
          }
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('Error detallado al cargar usuario:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('token');
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Iniciando proceso de login con credenciales:', credentials);
      const response = await axios.post(`${API_URL}/login`, credentials);
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de respuesta:', response.data);
      
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      const { token, data: userData } = response.data;
      console.log('Token recibido:', token);
      console.log('Datos de usuario recibidos:', userData);

      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      if (!userData) {
        throw new Error('No se recibieron datos de usuario');
      }

      if (userData.activo === 0) {
        console.log('Usuario inactivo detectado');
        set({ 
          error: 'Tu cuenta está inactiva. Por favor, contacta al administrador.',
          isLoading: false 
        });
        return false;
      }

      localStorage.setItem('token', token);
      set({ 
        user: { data: userData },
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      console.error('Error detallado en login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      set({ 
        error: error.response?.data?.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Iniciando proceso de registro con datos:', userData);
      const response = await axios.post(`${API_URL}/register`, {
        ...userData,
        sede_id: 1,
        activo: 1
      });
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de respuesta:', response.data);

      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      const { token, data: user } = response.data;
      console.log('Token recibido:', token);
      console.log('Datos de usuario recibidos:', user);

      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      if (!user) {
        throw new Error('No se recibieron datos de usuario');
      }

      localStorage.setItem('token', token);
      set({ 
        user: { 
          data: {
            ...user,
            activo: user.activo ?? 1
          }
        },
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      console.error('Error detallado en registro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      // Manejo específico de errores de validación
      if (error.response?.status === 422) {
        console.log('Error de validación completo:', error.response.data);
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          console.log('Errores de validación específicos:', validationErrors);
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          set({ 
            error: `Error de validación:\n${errorMessages}`,
            isLoading: false 
          });
        } else {
          console.log('Mensaje de error del servidor:', error.response.data.message);
          set({ 
            error: error.response.data.message || 'Error en los datos de registro',
            isLoading: false 
          });
        }
      } else {
        set({ 
          error: error.response?.data?.message || 'Error al registrar usuario. Por favor, intenta nuevamente.', 
          isLoading: false 
        });
      }
      return false;
    }
  },

  logout: () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
})); 