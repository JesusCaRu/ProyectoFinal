import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return { success: true };
      } else {
        // Manejo de errores específicos
        let errorMessage = 'Error de autenticación';
        if (data.message) {
          if (data.message.includes('personal_access_tokens')) {
            errorMessage = 'Error en la configuración del servidor. Por favor, contacte al administrador.';
          } else if (data.message.includes('Bcrypt algorithm')) {
            errorMessage = 'Error en la contraseña. Por favor, contacte al administrador.';
          } else {
            errorMessage = data.message;
          }
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      return { success: false, error: 'Error al conectar con el servidor. Por favor, intente más tarde.' };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore; 