import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de carga estandarizado con diferentes variantes
 * @param {Object} props
 * @param {string} props.variant - Variante del indicador de carga: 'table', 'fullscreen', 'inline', 'button'
 * @param {string} props.text - Texto a mostrar (opcional)
 * @param {number} props.colSpan - Número de columnas que abarca (para variant='table')
 * @param {string} props.className - Clases adicionales
 */
const LoadingIndicator = ({ 
  variant = 'inline', 
  text = 'Cargando...', 
  colSpan = 8,
  className = ''
}) => {
  // Variante para tablas (fila de carga)
  if (variant === 'table') {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 text-solid-color animate-spin" />
            <span className="text-text-tertiary text-sm font-medium">{text}</span>
          </div>
        </td>
      </tr>
    );
  }

  // Variante para pantalla completa
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-solid-color animate-spin" />
          <p className="text-accessibility-text text-lg font-medium">{text}</p>
        </div>
      </div>
    );
  }

  // Variante para botones
  if (variant === 'button') {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 text-current animate-spin" />
        <span>{text}</span>
      </div>
    );
  }

  // Variante de contenedor (para secciones de página)
  if (variant === 'container') {
    return (
      <div className={`flex items-center justify-center w-full h-64 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-solid-color animate-spin" />
          <p className="text-text-tertiary text-base">{text}</p>
        </div>
      </div>
    );
  }

  // Variante inline por defecto
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Loader2 className="h-5 w-5 text-solid-color animate-spin" />
      <span className="text-text-tertiary">{text}</span>
    </div>
  );
};

export default LoadingIndicator; 