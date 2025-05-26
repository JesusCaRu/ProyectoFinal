import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const useConfigStore = create((set) => ({
  // Estado
  config: {
    perfil: {
      nombre: '',
      email: '',
      telefono: ''
    },
    seguridad: {
      notificaciones_email: true,
      notificaciones_push: true,
      recordatorios_stock: true
    },
    pago: {
      metodo_pago: 'Tarjeta de Crédito',
      moneda: 'MXN'
    },
    idioma: {
      idioma: 'Español',
      zona_horaria: 'UTC-6'
    },
    apariencia: {
      tema: 'Claro',
      densidad: 'Normal'
    }
  },
  isLoading: false,
  error: null,

  // Acciones
  fetchConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set({ config: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar la configuración',
        isLoading: false 
      });
    }
  },

  updateConfig: async (section, data) => {
    try {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/config/${section}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Actualizar el estado local con la nueva configuración
      set(state => ({
        config: {
          ...state.config,
          [section]: response.data
        },
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la configuración',
        isLoading: false 
      });
      return false;
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/config/password`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la contraseña',
        isLoading: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));

export default useConfigStore; 