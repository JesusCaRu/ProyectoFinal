import { useState, useEffect } from 'react';
import { X, Send, Loader2, Users, Building2, User, MessageSquare } from 'lucide-react';
import { messageService } from '../services/messageService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { motion as _motion } from 'framer-motion';

const SendMessageModal = ({ isOpen, onClose, initialRecipientId = null, initialSedeId = null }) => {
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState(initialRecipientId);
  const [sedeId, setSedeId] = useState(initialSedeId);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'sede', 'all'
  const { user } = useAuthStore();

  // Cargar usuarios y sedes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchUsuarios();
      fetchSedes();
      
      // Establecer el tab activo basado en los parámetros iniciales
      if (initialRecipientId) {
        setActiveTab('user');
      } else if (initialSedeId) {
        setActiveTab('sede');
      } else if (user?.data?.rol?.nombre === 'Administrador') {
        setActiveTab('all');
      }
    } else {
      // Limpiar el formulario al cerrar
      setMessage('');
      setRecipientId(null);
      setSedeId(null);
    }
  }, [isOpen, initialRecipientId, initialSedeId, user?.data?.rol?.nombre]);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        setUsuarios(data.data.filter(u => u.id !== user?.data?.id)); // Filtrar el usuario actual
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar sedes
  const fetchSedes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/sedes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        setSedes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar sedes:', error);
      toast.error('Error al cargar sedes');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío de mensaje
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    try {
      setIsLoading(true);
      
      let response;
      
      if (activeTab === 'all') {
        // Verificar si el usuario es administrador
        if (user?.data?.rol?.nombre !== 'Administrador') {
          toast.error('Solo los administradores pueden enviar mensajes a todos');
          return;
        }
        
        response = await messageService.sendToAll(message);
      } else if (activeTab === 'sede' && sedeId) {
        response = await messageService.sendToSede(sedeId, message);
      } else if (activeTab === 'user' && recipientId) {
        response = await messageService.sendToUser(recipientId, message);
      } else {
        toast.error('Debes seleccionar un destinatario');
        return;
      }
      
      toast.success(response.message || 'Mensaje enviado correctamente');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error(error.message || 'Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar de tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRecipientId(null);
    setSedeId(null);
  };

  if (!isOpen) return null;

  return (
    <_motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <_motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-secondary rounded-xl shadow-lg w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-solid-color to-solid-color-hover p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Enviar mensaje</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tabs de destinatario */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('user')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'user' 
                  ? 'text-solid-color border-b-2 border-solid-color' 
                  : 'text-text-tertiary hover:text-accessibility-text'
              }`}
            >
              <User className="h-4 w-4" />
              Usuario
            </button>
            
            <button
              type="button"
              onClick={() => handleTabChange('sede')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'sede' 
                  ? 'text-solid-color border-b-2 border-solid-color' 
                  : 'text-text-tertiary hover:text-accessibility-text'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Sede
            </button>
            
            {user?.data?.rol?.nombre === 'Administrador' && (
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'all' 
                    ? 'text-solid-color border-b-2 border-solid-color' 
                    : 'text-text-tertiary hover:text-accessibility-text'
                }`}
              >
                <Users className="h-4 w-4" />
                Todos
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Selector de destinatario según el tab activo */}
            {activeTab === 'user' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-accessibility-text">Usuario destinatario</label>
                <select
                  value={recipientId || ''}
                  onChange={(e) => setRecipientId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isLoading}
                  className="w-full p-3 border border-border rounded-lg bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color/20 focus:border-solid-color transition-all"
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {activeTab === 'sede' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-accessibility-text">Sede destinataria</label>
                <select
                  value={sedeId || ''}
                  onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isLoading}
                  className="w-full p-3 border border-border rounded-lg bg-bg text-accessibility-text focus:ring-2 focus:ring-solid-color/20 focus:border-solid-color transition-all"
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {activeTab === 'all' && (
              <div className="p-4 bg-solid-color/10 rounded-lg border border-solid-color/20">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-solid-color" />
                  <p className="text-sm text-accessibility-text">
                    El mensaje se enviará a <span className="font-semibold">todos los usuarios</span> del sistema.
                  </p>
                </div>
              </div>
            )}
            
            {/* Mensaje */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-accessibility-text">Mensaje</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="w-full p-3 border border-border rounded-lg bg-bg text-accessibility-text resize-none focus:ring-2 focus:ring-solid-color/20 focus:border-solid-color transition-all"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-border rounded-lg text-accessibility-text hover:bg-interactive-component transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading || 
                !message.trim() || 
                (activeTab === 'user' && !recipientId) || 
                (activeTab === 'sede' && !sedeId)
              }
              className="px-4 py-2 bg-solid-color text-white rounded-lg hover:bg-solid-color-hover transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </_motion.div>
    </_motion.div>
  );
};

export default SendMessageModal; 