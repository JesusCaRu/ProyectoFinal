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
    Pencil,
    Store,
    AlertCircle
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const UserProfileModal = ({ isOpen, onClose, user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const { logout } = useAuthStore();
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
            authService.logout();
            logout();
            navigate('/auth/login');
        } catch (error) {
            setError(error.message || 'Error al cerrar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenSettings = () => {
        onClose();
        navigate('/dashboard/configuracion');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Validación
        const errors = {};
        if (!passwordData.current_password) {
            errors.current_password = 'La contraseña actual es requerida';
        }
        if (!passwordData.password) {
            errors.password = 'La nueva contraseña es requerida';
        } else if (passwordData.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        }
        if (passwordData.password !== passwordData.password_confirmation) {
            errors.password_confirmation = 'Las contraseñas no coinciden';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setPasswordErrors({});
            
            await userService.updatePassword(passwordData);
            
            // Reiniciar formulario
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
            
            setShowPasswordForm(false);
            alert('Contraseña actualizada correctamente');
        } catch (error) {
            setError(error.message || 'Error al cambiar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('El archivo no debe superar los 2MB');
                return;
            }
            
            try {
                setIsLoading(true);
                setError(null);
                await userService.uploadAvatar(file);
                // Recargar la página para mostrar el nuevo avatar
                window.location.reload();
            } catch (error) {
                setError(error.message || 'Error al subir el avatar');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: null }));
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
                className="bg-bg rounded-xl shadow-lg w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
                        <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
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
                            
                            {user.telefono && (
                                <div className="flex items-center gap-3 text-accessibility-text">
                                    <Phone className="w-5 h-5 text-text-tertiary" />
                                    <span>{user.telefono}</span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-accessibility-text">
                                <Store className="w-5 h-5 text-text-tertiary" />
                                <span>{user.sede?.nombre || 'Sin sede asignada'}</span>
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
                            {user.ultimo_acceso && (
                                <div className="flex items-center gap-3 text-accessibility-text">
                                    <Key className="w-5 h-5 text-text-tertiary" />
                                    <span>Último acceso: {formatDate(user.ultimo_acceso)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Formulario de cambio de contraseña */}
                    {showPasswordForm && (
                        <div className="mt-8 p-4 bg-bg-secondary rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-accessibility-text">Cambiar contraseña</h3>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-accessibility-text mb-1">
                                        Contraseña actual
                                    </label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordInputChange}
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-solid-color bg-interactive-component text-accessibility-text"
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="text-error text-xs mt-1">{passwordErrors.current_password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-accessibility-text mb-1">
                                        Nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordInputChange}
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-solid-color bg-interactive-component text-accessibility-text"
                                    />
                                    {passwordErrors.password && (
                                        <p className="text-error text-xs mt-1">{passwordErrors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-accessibility-text mb-1">
                                        Confirmar nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={passwordData.password_confirmation}
                                        onChange={handlePasswordInputChange}
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-solid-color bg-interactive-component text-accessibility-text"
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="text-error text-xs mt-1">{passwordErrors.password_confirmation}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordForm(false)}
                                        className="px-4 py-2 text-accessibility-text rounded-lg border border-border hover:bg-bg-secondary transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-solid-color text-white rounded-lg hover:bg-solid-color-hover transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Acciones rápidas */}
                    {!showPasswordForm && (
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleOpenSettings}
                                className="px-4 py-3 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Settings className="w-5 h-5" />
                                Configuración
                            </button>
                            <button 
                                onClick={() => setShowPasswordForm(true)}
                                className="px-4 py-3 bg-interactive-component hover:bg-interactive-component-secondary text-accessibility-text rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Key className="w-5 h-5" />
                                Cambiar contraseña
                            </button>
                        </div>
                    )}
                </div>
            </_motion.div>
        </_motion.div>
    );
};

export default UserProfileModal; 