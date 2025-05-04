import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as _motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { User, AlertCircle } from 'lucide-react';
import { AuthHeader } from './components/AuthHeader';
import { FormInput } from './components/FormInput';
import { AuthError } from './components/AuthError';
import { AuthButton } from './components/AuthButton';
import { AuthFooter } from './components/AuthFooter';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await login(formData);
    if (success) {
      navigate('/dashboard');
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
    <div className="h-fit flex items-center justify-center py-12 px-4 sm:px-6">
      <_motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-bg rounded-xl shadow-lg p-8"
      >
        <AuthHeader
          title="Bienvenido de nuevo"
          subtitle="Ingresa tus credenciales para continuar"
          icon={<User className="h-8 w-8 text-solid-color" />}
        />

        <AuthError error={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            type="email"
            name="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="ejemplo@correo.com"
            icon="email"
            delay={0.1}
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
            delay={0.2}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-solid-color focus:ring-solid-color"
              />
              <label htmlFor="remember-me" className="text-sm text-accessibility-text">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-solid-color hover:text-solid-color-secondary transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <AuthButton isLoading={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </AuthButton>
          </div>
        </form>

        <AuthFooter
          text="¿No tienes una cuenta?"
          linkText="Regístrate"
          linkTo="/auth/register"
        />
      </_motion.div>
    </div>
  );
};

export default Login;