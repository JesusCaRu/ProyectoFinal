import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as _motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, AlertCircle } from 'lucide-react';
import { AuthHeader } from './components/AuthHeader';
import { FormInput } from './components/FormInput';
import { AuthError } from './components/AuthError';
import { AuthButton } from './components/AuthButton';
import { AuthFooter } from './components/AuthFooter';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmación de contraseña es requerida';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!termsAccepted) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Enviando datos de registro:', {
        nombre: formData.name,
        email: formData.email,
        password: formData.password
      });

      const success = await register({
        nombre: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (success) {
        navigate('/dashboard/verificacion-pendiente');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || 'Error al registrar usuario'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="h-fit flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <_motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-bg rounded-xl shadow-lg p-8"
      >
        <AuthHeader
          title="Crear una cuenta"
          subtitle={
            <>
              Regístrate para gestionar el inventario
              <div className="mt-2 text-xs text-warning">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Un administrador deberá aprobar tu cuenta y asignarte un rol
              </div>
            </>
          }
          icon={<UserPlus className="h-8 w-8 text-solid-color" />}
        />

        <AuthError error={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            type="text"
            name="name"
            label="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Tu nombre completo"
            icon="username"
            delay={0.1}
          />

          <FormInput
            type="email"
            name="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ejemplo@correo.com"
            icon="email"
            delay={0.2}
          />

          <FormInput
            type="password"
            name="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            icon="password"
            delay={0.3}
          />

          <FormInput
            type="password"
            name="confirmPassword"
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••"
            icon="password"
            delay={0.4}
          />

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-border text-solid-color focus:ring-solid-color"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-accessibility-text">
                Acepto los{' '}
                <Link to="/terms" className="text-solid-color hover:text-solid-color-secondary">
                  términos y condiciones
                </Link>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-border-tertiary flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.terms}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <AuthButton isLoading={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </AuthButton>
          </div>
        </form>

        <AuthFooter
          text="¿Ya tienes una cuenta?"
          linkText="Inicia sesión"
          linkTo="/auth/login"
        />
      </_motion.div>
    </div>
  );
};

export default Register;