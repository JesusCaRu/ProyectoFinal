# StockFlow - Sistema de Gestión de Inventario para Tienda de Robots

## Descripción
StockFlow es un sistema de gestión de inventario desarrollado para una tienda especializada en robots. El backend está construido con Laravel 12 y proporciona una API RESTful para gestionar todos los aspectos del inventario, ventas, compras y transferencias entre sedes.

## Características Principales
- Gestión completa de inventario
- Sistema de autenticación y autorización por roles
- Control de múltiples sedes
- Gestión de proveedores
- Registro de compras y ventas
- Sistema de transferencias entre sedes
- Auditoría de movimientos
- API RESTful con Laravel Sanctum

## Requisitos del Sistema
- PHP 8.2 o superior
- Composer
- MySQL/MariaDB
- Node.js y NPM (para desarrollo)

## Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd backend
```

2. Instalar dependencias:
```bash
composer install
```

3. Configurar el entorno:
```bash
cp .env.example .env
php artisan key:generate
```

4. Configurar la base de datos en el archivo `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stockflow
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

5. Ejecutar migraciones:
```bash
php artisan migrate
```

6. Iniciar el servidor:
```bash
php artisan serve
```

## Estructura de la API

### Autenticación
- `POST /api/login` - Inicio de sesión
- `POST /api/register` - Registro de nuevos usuarios
- `POST /api/logout` - Cierre de sesión
- `GET /api/me` - Obtener usuario autenticado

### Gestión de Usuarios y Roles
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios/{id}` - Ver usuario
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario
- `GET /api/usuarios/trashed` - Listar usuarios eliminados
- `POST /api/usuarios/{id}/restore` - Restaurar usuario
- `PATCH /api/usuarios/{usuario}/estado` - Cambiar estado del usuario
- `GET /api/roles` - Listar roles

### Gestión de Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/{id}` - Ver producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto
- `GET /api/productos/por-sede/{sedeId}` - Productos por sede
- `GET /api/productos/stock-bajo` - Listar productos con stock bajo

### Gestión de Inventario
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Registrar movimiento
- `GET /api/movimientos/{id}` - Ver movimiento
- `GET /api/movimientos/por-fecha` - Movimientos por fecha
- `GET /api/movimientos/por-producto/{productoId}` - Movimientos por producto
- `GET /api/movimientos/por-sede/{sedeId}` - Movimientos por sede
- `GET /api/movimientos/resumen` - Resumen de movimientos

### Gestión de Compras
- `GET /api/compras` - Listar compras
- `POST /api/compras` - Crear compra
- `GET /api/compras/{id}` - Ver compra
- `PATCH /api/compras/{compra}` - Actualizar compra
- `DELETE /api/compras/{compra}` - Eliminar compra
- `GET /api/compras/por-fechas` - Compras por rango de fechas
- `GET /api/compras/resumen` - Resumen de compras
- `GET /api/compra-detalles` - Listar detalles de compra
- `GET /api/compra-detalles/por-compra/{compraId}` - Detalles por compra
- `GET /api/compra-detalles/por-producto/{productoId}` - Detalles por producto

### Gestión de Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Crear venta
- `GET /api/ventas/{id}` - Ver venta
- `PATCH /api/ventas/{venta}` - Actualizar venta
- `DELETE /api/ventas/{venta}` - Eliminar venta
- `GET /api/ventas/por-fechas` - Ventas por rango de fechas
- `GET /api/ventas/resumen` - Resumen de ventas
- `GET /api/venta-detalles` - Listar detalles de venta
- `GET /api/venta-detalles/por-venta/{ventaId}` - Detalles por venta
- `GET /api/venta-detalles/por-producto/{productoId}` - Detalles por producto

### Gestión de Transferencias
- `GET /api/transferencias` - Listar transferencias
- `POST /api/transferencias` - Crear transferencia
- `GET /api/transferencias/{id}` - Ver transferencia
- `PUT /api/transferencias/{id}` - Actualizar transferencia
- `DELETE /api/transferencias/{id}` - Eliminar transferencia

### Gestión de Sedes
- `GET /api/sedes` - Listar sedes
- `POST /api/sedes` - Crear sede
- `GET /api/sedes/{id}` - Ver sede
- `PUT /api/sedes/{id}` - Actualizar sede
- `DELETE /api/sedes/{id}` - Eliminar sede

### Gestión de Proveedores
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores` - Crear proveedor
- `GET /api/proveedores/{id}` - Ver proveedor
- `PUT /api/proveedores/{id}` - Actualizar proveedor
- `DELETE /api/proveedores/{id}` - Eliminar proveedor
- `GET /api/proveedores/{proveedor}/resumen-compras` - Resumen de compras

### Sistema de Auditoría
- `GET /api/auditoria` - Listar registros de auditoría
- `GET /api/auditoria/{id}` - Ver registro específico
- `GET /api/auditoria/acciones` - Obtener tipos de acciones
- `GET /api/auditoria/tablas` - Obtener tablas auditadas

### Notificaciones y Mensajes
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/{id}/mark-as-read` - Marcar como leída
- `PUT /api/notifications/mark-all-as-read` - Marcar todas como leídas
- `DELETE /api/notifications/{id}` - Eliminar notificación
- `DELETE /api/notifications` - Eliminar todas
- `POST /api/messages/user` - Enviar mensaje a usuario
- `POST /api/messages/sede` - Enviar mensaje a sede
- `POST /api/messages/all` - Enviar mensaje a todos

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/ventas-por-mes` - Ventas por mes
- `GET /api/dashboard/productos-mas-vendidos` - Productos más vendidos
- `GET /api/dashboard/productos-stock-bajo` - Productos con stock bajo
- `GET /api/dashboard/ultimas-ventas` - Últimas ventas
- `GET /api/dashboard/ultimas-compras` - Últimas compras
- `GET /api/dashboard/ultimos-movimientos` - Últimos movimientos

### Facturas
- `GET /api/facturas` - Listar facturas
- `GET /api/facturas/venta/{id}` - Generar factura de venta
- `GET /api/facturas/compra/{id}` - Generar factura de compra
- `GET /api/facturas/descargar/{tipo}/{id}` - Descargar factura

## Modelos Principales

### Usuario
- Gestión de usuarios del sistema
- Autenticación y autorización
- Relación con roles

### Producto
- Información de robots y accesorios
- Control de stock
- Categorización y marcas

### Movimiento
- Registro de entradas y salidas
- Control de inventario
- Auditoría de cambios

### Compra/Venta
- Gestión de transacciones
- Detalles de productos
- Control de precios

### Transferencia
- Movimientos entre sedes
- Control de stock por ubicación
- Seguimiento de transferencias

## Seguridad
- Autenticación mediante Laravel Sanctum
- Tokens de acceso para API
- Control de acceso basado en roles
- Validación de datos
- Protección contra CSRF
- Sistema completo de auditoría usando Spatie Activity Log
- Registro detallado de todas las acciones de usuarios
- Trazabilidad de cambios en modelos (productos, ventas, compras, etc.)
- Helpers personalizados para registrar actividades específicas del negocio
- Filtrado y búsqueda de registros de auditoría

## Desarrollo
Para iniciar el entorno de desarrollo:
```bash
composer run dev
```

## Testing
Para ejecutar las pruebas:
```bash
php artisan test
```

## Contribución
1. Fork del proyecto
2. Crear rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT.

## Copyright
Copyright © 2025 Jesús Canicio Ruiz. Todos los derechos reservados.
