import { 
  X, 
  Printer, 
  Download,
  DollarSign,
  Calendar,
  User,
  Building,
  Package,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const InvoiceDetails = ({ invoice, onClose, onPrint, onDownload, onMarkAsPaid, onCancel }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pagada':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pagada':
        return 'Pagada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pagada':
        return 'text-success';
      case 'cancelada':
        return 'text-error';
      default:
        return 'text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-accessibility-text">
            Factura #{invoice.numero}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusIcon(invoice.estado)}
            <span className={`text-sm font-medium ${getStatusColor(invoice.estado)}`}>
              {getStatusText(invoice.estado)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrint}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-lg transition-colors"
            title="Imprimir factura"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-lg transition-colors"
            title="Descargar PDF"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-error rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-text-tertiary mb-1">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Cliente</span>
            </div>
            <div className="text-accessibility-text">
              {invoice.cliente?.nombre}
            </div>
            <div className="text-sm text-text-tertiary">
              {invoice.cliente?.documento}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-text-tertiary mb-1">
              <Building className="h-5 w-5" />
              <span className="text-sm font-medium">Sede</span>
            </div>
            <div className="text-accessibility-text">
              {invoice.sede?.nombre}
            </div>
            <div className="text-sm text-text-tertiary">
              {invoice.sede?.direccion}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-text-tertiary mb-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Fecha</span>
            </div>
            <div className="text-accessibility-text">
              {formatDate(invoice.fecha)}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-text-tertiary mb-1">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-xl font-semibold text-accessibility-text">
              {formatCurrency(invoice.total)}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-interactive-component">
              <th className="px-4 py-2 text-left text-sm font-medium text-text-tertiary">Producto</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Cantidad</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Precio</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoice.detalles?.map((detalle, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-text-tertiary" />
                    <div>
                      <div className="text-sm font-medium text-accessibility-text">
                        {detalle.producto?.nombre}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        SKU: {detalle.producto?.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-accessibility-text text-right">
                  {detalle.cantidad}
                </td>
                <td className="px-4 py-2 text-sm text-accessibility-text text-right">
                  {formatCurrency(detalle.precio_unitario)}
                </td>
                <td className="px-4 py-2 text-sm text-accessibility-text text-right">
                  {formatCurrency(detalle.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-interactive-component/50">
              <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">
                Subtotal
              </td>
              <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                {formatCurrency(invoice.subtotal)}
              </td>
            </tr>
            <tr className="bg-interactive-component/50">
              <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">
                IVA (16%)
              </td>
              <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                {formatCurrency(invoice.iva)}
              </td>
            </tr>
            <tr className="bg-interactive-component">
              <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-text-tertiary">
                Total
              </td>
              <td className="px-4 py-2 text-right text-sm font-medium text-accessibility-text">
                {formatCurrency(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.estado === 'pendiente' && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-error hover:text-error-hover transition-colors"
          >
            Cancelar Factura
          </button>
          <button
            onClick={onMarkAsPaid}
            className="px-4 py-2 text-sm font-medium text-white bg-success hover:bg-success-hover rounded-lg transition-colors"
          >
            Marcar como Pagada
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails; 