import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to check if token exists
const checkAuthToken = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const messageService = {
  /**
   * Enviar un mensaje a un usuario específico
   * @param {number} recipientId - ID del usuario destinatario
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} - Respuesta de la API
   */
  sendToUser: async (recipientId, message) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.post(`${API_URL}/messages/user`, {
        recipient_id: recipientId,
        message
      });

      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje a usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al enviar mensaje');
    }
  },

  /**
   * Enviar un mensaje a todos los usuarios de una sede
   * @param {number} sedeId - ID de la sede
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} - Respuesta de la API
   */
  sendToSede: async (sedeId, message) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.post(`${API_URL}/messages/sede`, {
        sede_id: sedeId,
        message
      });

      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje a sede:', error);
      throw new Error(error.response?.data?.message || 'Error al enviar mensaje');
    }
  },

  /**
   * Enviar un mensaje a todos los usuarios (solo administradores)
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} - Respuesta de la API
   */
  sendToAll: async (message) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axiosInstance.post(`${API_URL}/messages/all`, {
        message
      });

      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje a todos:', error);
      throw new Error(error.response?.data?.message || 'Error al enviar mensaje');
    }
  }
}; 