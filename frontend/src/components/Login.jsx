import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookF, FaApple, FaRocket } from 'react-icons/fa';
import '../globals.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[--blue-12]">
      <div className="w-full max-w-md p-4 bg-[--blue-12] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-[--blue-11] text-white"
              placeholder="Correo electrónico"
            />
            <FaEnvelope className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-[--blue-11] text-white"
              placeholder="Contraseña"
            />
            <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button type="submit" className="w-full p-2 rounded-md bg-[--blue-11] text-white">
            Iniciar Sesión
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};


export default Login;