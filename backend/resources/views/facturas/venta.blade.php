<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura de Venta #{{ $venta->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24px;
            margin: 0;
        }
        .header p {
            margin: 5px 0;
        }
        .info {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .info-col {
            width: 48%;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .total-row {
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FACTURA DE VENTA</h1>
            <p><strong>{{ config('app.name', 'StockFlow') }}</strong></p>
            <p>Sistema de Gestión de Inventario</p>
        </div>

        <div class="info">
            <div class="info-row">
                <div class="info-col">
                    <p><strong>Factura N°:</strong> {{ $numero }}</p>
                    <p><strong>Fecha:</strong> {{ $fecha }}</p>
                    <p><strong>Vendedor:</strong> {{ $venta->usuario->nombre ?? 'N/A' }}</p>
                </div>
                <div class="info-col">
                    <p><strong>Sede:</strong> {{ $venta->sede->nombre ?? 'N/A' }}</p>
                    <p><strong>Dirección:</strong> {{ $venta->sede->direccion ?? 'N/A' }}</p>
                    <p><strong>Teléfono:</strong> {{ $venta->sede->telefono ?? 'N/A' }}</p>
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($venta->detalles as $index => $detalle)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $detalle->producto->nombre ?? 'Producto no disponible' }}</td>
                    <td>{{ $detalle->cantidad }}</td>
                    <td>${{ number_format($detalle->precio_unitario, 2) }}</td>
                    <td>${{ number_format($detalle->cantidad * $detalle->precio_unitario, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="4" style="text-align: right;">Total:</td>
                    <td>${{ number_format($venta->total, 2) }}</td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p>Esta factura es un comprobante válido de su compra.</p>
            <p>Gracias por su compra.</p>
            <p>Documento generado el {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
