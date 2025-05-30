import axiosInstance from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Función auxiliar para verificar el token
const checkAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token actual:', token ? 'Presente' : 'No hay token');
  return !!token;
};

// Función para obtener la sede del usuario actual
const getCurrentUserSedeId = () => {
  try {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      return userData?.sede_id;
    }
  } catch (e) {
    console.error('Error al obtener sede del usuario:', e);
  }
  return null;
};

export const mensajeService = {
  fetchMensajes: async (sedeId = null) => {
    try {
      if (!checkAuthToken()) {
        console.error('No hay token de autenticación');
        return [];
      }

      // Si no se proporciona sede_id, intentar obtenerla del usuario actual
      const targetSedeId = sedeId || getCurrentUserSedeId();
      
      console.log('Iniciando fetchMensajes con sedeId:', targetSedeId);
      const url = `${API_URL}/sedes/mensajes`;
      const params = {};
      
      // Solo enviar el parámetro sede_id si existe
      if (targetSedeId) {
        params.sede_id = targetSedeId;
      }
      
      console.log('Realizando petición a:', url, 'con params:', params);
      const res = await axiosInstance.get(url, { params });
      console.log('Respuesta recibida:', res);
      
      // Ser más tolerante con el formato de respuesta
      if (res.data) {
        console.log('Datos en res.data:', res.data);
        // Si tenemos data.data, usamos eso
        if (res.data.data) {
          console.log('Usando res.data.data:', res.data.data);
          return res.data.data;
        }
        // Si tenemos un array directamente en data
        else if (Array.isArray(res.data)) {
          console.log('Usando array en res.data:', res.data);
          return res.data;
        }
        // Si no hay datos, devolvemos array vacío
        console.log('No se encontraron datos en el formato esperado');
        return [];
      }
      
      console.log('No se recibieron datos');
      return [];
    } catch (error) {
      console.error('Error en fetchMensajes:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      // No lanzar error, simplemente devolver array vacío
      return [];
    }
  },

  createMensaje: async (mensaje, sedeId = null) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona sede_id, intentar obtenerla del usuario actual
      const targetSedeId = sedeId || getCurrentUserSedeId();
      
      console.log('Creando mensaje:', mensaje, 'para sede:', targetSedeId);
      
      // Validar que tenemos una sede válida
      if (!targetSedeId) {
        throw new Error('No se pudo determinar la sede destino para el mensaje');
      }
      
      const data = { 
        mensaje,
        sede_id: targetSedeId
      };
      
      console.log('Datos a enviar:', data);
      const res = await axiosInstance.post(`${API_URL}/sedes/mensajes`, data);
      console.log('Respuesta de creación:', res);
      
      // Ser más tolerante con el formato de respuesta
      if (res.data) {
        if (res.data.data) {
          return res.data.data;
        }
        return res.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error en createMensaje:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al crear notificación');
    }
  },

  marcarLeido: async (mensajeId) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      if (!mensajeId) {
        throw new Error('ID de mensaje no proporcionado');
      }
      
      console.log('Marcando como leído mensaje:', mensajeId);
      const res = await axiosInstance.put(`${API_URL}/sedes/mensajes/${mensajeId}/leido`);
      console.log('Respuesta de marcar leído:', res);
      
      // Ser más tolerante con el formato de respuesta
      if (res.data) {
        if (res.data.data) {
          return res.data.data;
        }
        return res.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error en marcarLeido:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al marcar como leído');
    }
  },

  eliminarMensaje: async (mensajeId) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      if (!mensajeId) {
        throw new Error('ID de mensaje no proporcionado');
      }
      
      console.log('Eliminando mensaje:', mensajeId);
      await axiosInstance.delete(`${API_URL}/sedes/mensajes/${mensajeId}`);
      console.log('Mensaje eliminado correctamente');
      
      // Aceptar cualquier respuesta exitosa
      return true;
    } catch (error) {
      console.error('Error en eliminarMensaje:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al eliminar notificación');
    }
  },
  
  marcarTodosLeidos: async (sedeId = null) => {
    try {
      if (!checkAuthToken()) {
        throw new Error('No hay token de autenticación');
      }

      // Si no se proporciona sede_id, intentar obtenerla del usuario actual
      const targetSedeId = sedeId || getCurrentUserSedeId();
      
      console.log('Marcando todos como leídos para sede:', targetSedeId);
      const params = {};
      if (targetSedeId) {
        params.sede_id = targetSedeId;
      }
      
      console.log('Parámetros:', params);
      await axiosInstance.put(`${API_URL}/sedes/mensajes/marcar-todos-leidos`, params);
      console.log('Todos los mensajes marcados como leídos');
      
      // Aceptar cualquier respuesta exitosa
      return true;
    } catch (error) {
      console.error('Error en marcarTodosLeidos:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al marcar todas las notificaciones como leídas');
    }
  }
};