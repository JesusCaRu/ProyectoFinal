import { useState } from 'react';
import { motion as _motion } from 'framer-motion';
import { 
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    LogOut,
    Settings,
    Key,
    Pencil
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserStore } from '../store/userStore';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const UserProfileModal = ({ isOpen, onClose, user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { logout, updateUser } = useUserStore();
    const navigate = useNavigate();

    if (!isOpen || !user) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return isValid(date) ? format(date, "dd/MM/yyyy HH:mm", { locale: es }) : 'No disponible';
    };

    const formatMonthYear = (dateString) => {
        if (!dateString) return 'No disponible';
        const date = new Date(dateString);
        return isValid(date) ? format(date, "MMMM yyyy", { locale: es }) : 'No disponible';
    };

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await userService.logout();
            logout();
            navigate('/auth/login');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const updatedUser = await userService.getProfile();
            updateUser(updatedUser);
            // Aquí podrías abrir un modal de configuración o redirigir a una página de configuración
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Aquí podrías abrir un modal para cambiar la contraseña
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                setError(null);
                const updatedUser = await userService.uploadAvatar(file);
                updateUser(updatedUser);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <_motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <_motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-bg rounded-xl shadow-lg w-full max-w-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header con imagen de perfil */}
                <div className="relative h-48 bg-gradient-to-r from-solid-color to-solid-color-hover">
                    <div className="absolute -bottom-16 left-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-bg overflow-hidden bg-interactive-component">
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-16 h-16 text-text-tertiary" />
                                    </div>
                                )}
                            </div>
                            <label 
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-solid-color text-white p-2 rounded-full hover:bg-solid-color-hover transition-colors cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Contenido del perfil */}
                <div className="pt-20 px-8 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-accessibility-text">{user.nombre}</h2>
                            <p className="text-text-tertiary">{user.rol?.nombre || 'Sin rol asignado'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <LogOut className="w-4 h-4" />
                            {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Información del usuario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Mail className="w-5 h-5 text-text-tertiary" />
                                <span>{user.email || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Phone className="w-5 h-5 text-text-tertiary" />
                                <span>{user.telefono || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <MapPin className="w-5 h-5 text-text-tertiary" />
                                <span>{user.direccion || 'No especificado'}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Calendar className="w-5 h-5 text-text-tertiary" />
                                <span>Miembro desde {formatMonthYear(user.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Shield className="w-5 h-5 text-text-tertiary" />
                                <span>{user.rol?.nombre || 'Sin rol asignado'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Key className="w-5 h-5 text-text-tertiary" />
                                <span>Último acceso: {formatDate(user.ultimo_acceso)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleUpdateProfile}
                            className="px-4 py-3 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Settings className="w-5 h-5" />
                            Configuración
                        </button>
                        <button 
                            onClick={handleChangePassword}
                            className="px-4 py-3 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Key className="w-5 h-5" />
                            Cambiar contraseña
                        </button>
                    </div>
                </div>
            </_motion.div>
        </_motion.div>
    );
};

export default UserProfileModal; 