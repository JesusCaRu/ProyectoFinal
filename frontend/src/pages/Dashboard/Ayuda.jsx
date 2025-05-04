import { motion as _motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  MessageSquare,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Book,
  FileText,
  Video,
  Download
} from 'lucide-react';

const Ayuda = () => {
  const faqs = [
    {
      question: '¿Cómo puedo agregar un nuevo producto?',
      answer: 'Para agregar un nuevo producto, ve a la sección de Productos y haz clic en el botón "Nuevo Producto". Completa el formulario con la información requerida y haz clic en "Guardar".'
    },
    {
      question: '¿Cómo puedo generar un reporte de ventas?',
      answer: 'Para generar un reporte de ventas, ve a la sección de Reportes, selecciona el período deseado y haz clic en "Generar Reporte". Puedes exportar el reporte en diferentes formatos.'
    },
    {
      question: '¿Cómo puedo cambiar mi contraseña?',
      answer: 'Para cambiar tu contraseña, ve a Configuración > Seguridad. Ingresa tu contraseña actual y la nueva contraseña dos veces. Haz clic en "Guardar Cambios" para confirmar.'
    },
    {
      question: '¿Cómo puedo contactar al soporte técnico?',
      answer: 'Puedes contactar al soporte técnico a través del chat en vivo, correo electrónico o teléfono. Los detalles de contacto están disponibles en la sección de Soporte.'
    }
  ];

  const supportChannels = [
    {
      title: 'Chat en Vivo',
      icon: <MessageSquare className="h-6 w-6 text-solid-color" />,
      description: 'Chatea con nuestro equipo de soporte en tiempo real',
      availability: 'Disponible 24/7',
      action: 'Iniciar Chat'
    },
    {
      title: 'Correo Electrónico',
      icon: <Mail className="h-6 w-6 text-solid-color" />,
      description: 'Envíanos un correo y te responderemos en menos de 24 horas',
      availability: 'Respuesta en 24h',
      action: 'Enviar Correo'
    },
    {
      title: 'Teléfono',
      icon: <Phone className="h-6 w-6 text-solid-color" />,
      description: 'Llámanos para asistencia inmediata',
      availability: 'Lun-Vie 9:00-18:00',
      action: 'Llamar Ahora'
    }
  ];

  const resources = [
    {
      title: 'Guía de Usuario',
      icon: <Book className="h-6 w-6 text-solid-color" />,
      description: 'Manual completo del sistema',
      format: 'PDF',
      size: '2.5 MB'
    },
    {
      title: 'Tutoriales',
      icon: <Video className="h-6 w-6 text-solid-color" />,
      description: 'Videos instructivos paso a paso',
      format: 'MP4',
      size: 'Varios'
    },
    {
      title: 'Documentación Técnica',
      icon: <FileText className="h-6 w-6 text-solid-color" />,
      description: 'Documentación detallada para desarrolladores',
      format: 'PDF',
      size: '1.8 MB'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <HelpCircle className="h-8 w-8 text-solid-color" />
        <h1 className="text-2xl font-bold text-accessibility-text">Ayuda y Soporte</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-text-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en la ayuda..."
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-solid-color focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportChannels.map((channel, index) => (
          <_motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-bg rounded-xl shadow-md p-6 border border-border"
          >
            <div className="flex items-center space-x-3 mb-4">
              {channel.icon}
              <h2 className="text-lg font-semibold text-accessibility-text">
                {channel.title}
              </h2>
            </div>
            <p className="text-sm text-text-tertiary mb-4">
              {channel.description}
            </p>
            <div className="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
              <Clock className="h-4 w-4" />
              <span>{channel.availability}</span>
            </div>
            <button className="w-full px-4 py-2 bg-solid-color hover:bg-solid-color-hover text-white rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
              <span>{channel.action}</span>
            </button>
          </_motion.div>
        ))}
      </div>

      <div className="bg-bg rounded-xl shadow-md p-6 border border-border">
        <h2 className="text-xl font-semibold text-accessibility-text mb-6">
          Preguntas Frecuentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <_motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button className="w-full px-4 py-3 bg-interactive-component hover:bg-interactive-component-secondary text-left flex items-center justify-between transition-colors duration-200">
                <span className="font-medium text-accessibility-text">
                  {faq.question}
                </span>
                <ChevronDown className="h-5 w-5 text-text-tertiary" />
              </button>
              <div className="px-4 py-3 bg-bg">
                <p className="text-sm text-text-tertiary">{faq.answer}</p>
              </div>
            </_motion.div>
          ))}
        </div>
      </div>

      <div className="bg-bg rounded-xl shadow-md p-6 border border-border">
        <h2 className="text-xl font-semibold text-accessibility-text mb-6">
          Recursos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <_motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-interactive-component rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                {resource.icon}
                <h3 className="text-lg font-semibold text-accessibility-text">
                  {resource.title}
                </h3>
              </div>
              <p className="text-sm text-text-tertiary mb-4">
                {resource.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  {resource.format} • {resource.size}
                </span>
                <button className="p-1 text-info hover:text-info-hover rounded-lg transition-colors duration-200">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </_motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ayuda; 