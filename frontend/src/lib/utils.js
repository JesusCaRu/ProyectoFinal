export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
} 