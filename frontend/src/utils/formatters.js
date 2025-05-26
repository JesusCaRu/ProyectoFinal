/**
 * Formatea un número como moneda
 * @param {number} value - El valor a formatear
 * @param {string} [currency='MXN'] - El código de la moneda
 * @returns {string} El valor formateado como moneda
 */
export const formatCurrency = (value, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Formatea una fecha en formato local
 * @param {string|Date} date - La fecha a formatear
 * @param {boolean} [includeTime=true] - Si se debe incluir la hora
 * @returns {string} La fecha formateada
 */
export const formatDate = (date, includeTime = true) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(includeTime && {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    return new Intl.DateTimeFormat('es-MX', options).format(new Date(date));
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - El valor a formatear
 * @param {number} [decimals=0] - El número de decimales a mostrar
 * @returns {string} El valor formateado
 */
export const formatNumber = (value, decimals = 0) => {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - El valor a formatear (0-100)
 * @param {number} [decimals=1] - El número de decimales a mostrar
 * @returns {string} El valor formateado como porcentaje
 */
export const formatPercent = (value, decimals = 1) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}; 