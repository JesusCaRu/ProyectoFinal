<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura de Compra #{{ $compra->id }}</title>
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
        .estado {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
        }
        .estado-pendiente {
            background-color: #fff3cd;
            color: #856404;
        }
        .estado-completada {
            background-color: #d4edda;
            color: #155724;
        }
        .estado-cancelada {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FACTURA DE COMPRA</h1>
            <p><strong>{{ config('app.name', 'StockFlow') }}</strong></p>
            <p>Sistema de Gestión de Inventario</p>
        </div>

        <div class="info">
            <div class="info-row">
                <div class="info-col">
                    <p><strong>Factura N°:</strong> {{ $numero }}</p>
                    <p><strong>Fecha:</strong> {{ $fecha }}</p>
                    <p><strong>Estado:</strong>
                        <span class="estado estado-{{ $compra->estado }}">
                            {{ ucfirst($compra->estado) }}
                        </span>
                    </p>
                </div>
                <div class="info-col">
                    <p><strong>Sede:</strong> {{ $compra->sede->nombre ?? 'N/A' }}</p>
                    <p><strong>Proveedor:</strong> {{ $compra->proveedor->nombre ?? 'N/A' }}</p>
                    <p><strong>Usuario:</strong> {{ $compra->usuario->nombre ?? 'N/A' }}</p>
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
                @foreach($compra->detalles as $index => $detalle)
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
                    <td>${{ number_format($compra->total, 2) }}</td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p>Este documento es un comprobante de la compra realizada al proveedor.</p>
            <p>Documento generado el {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
