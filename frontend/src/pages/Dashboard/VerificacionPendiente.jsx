import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as _motion } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const VerificacionPendiente = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirigir al dashboard solo si el usuario ya tiene un rol asignado
  useEffect(() => {
    if (user?.data?.rol?.nombre) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg">
      <_motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-bg-secondary rounded-xl shadow-lg p-8 border border-border"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-warning/10 rounded-full mb-4">
            <Clock className="h-12 w-12 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-accessibility-text mb-2">
            Verificación Pendiente
          </h1>
          <p className="text-text-tertiary mb-6 max-w-md">
            Tu cuenta ha sido creada exitosamente pero necesita ser verificada por un administrador.
          </p>
          
          <div className="w-full bg-bg rounded-lg p-6 mb-6 border border-border">
            <h2 className="text-lg font-medium text-accessibility-text mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-solid-color" />
              Información de tu cuenta
            </h2>
            <div className="space-y-2">
              <p className="text-text-tertiary">
                <span className="font-medium">Nombre:</span> {user?.data?.nombre || 'No disponible'}
              </p>
              <p className="text-text-tertiary">
                <span className="font-medium">Email:</span> {user?.data?.email || 'No disponible'}
              </p>
              <p className="text-text-tertiary">
                <span className="font-medium">Estado:</span> <span className="text-warning">Pendiente de verificación</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-4 w-full">
            <div className="flex items-start p-4 bg-info/10 rounded-lg border border-info/20">
              <AlertCircle className="h-5 w-5 text-info mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-accessibility-text">¿Qué sucede ahora?</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  Un administrador necesita asignarte un rol y una sede antes de que puedas acceder al sistema. 
                  Este proceso puede tomar algún tiempo.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-success/10 rounded-lg border border-success/20">
              <CheckCircle className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-accessibility-text">Próximos pasos</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  Una vez que tu cuenta sea verificada, podrás iniciar sesión normalmente y acceder a todas las funciones del sistema según tu rol asignado.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-8 px-6 py-2 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </_motion.div>
    </div>
  );
};

export default VerificacionPendiente; 