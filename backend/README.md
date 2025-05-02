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
- `POST /api/register` - Registro de nuevos usuarios
- `POST /api/login` - Inicio de sesión
- `POST /api/logout` - Cierre de sesión

### Endpoints Protegidos

#### Gestión de Usuarios y Roles
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios/{id}` - Ver usuario
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario
- `GET /api/roles` - Listar roles

#### Gestión de Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/{id}` - Ver producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

#### Gestión de Inventario
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Registrar movimiento
- `GET /api/movimientos/{id}` - Ver movimiento

#### Gestión de Compras
- `GET /api/compras` - Listar compras
- `POST /api/compras` - Crear compra
- `GET /api/compras/{id}` - Ver compra
- `GET /api/compra-detalles` - Listar detalles de compra

#### Gestión de Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Crear venta
- `GET /api/ventas/{id}` - Ver venta
- `GET /api/venta-detalles` - Listar detalles de venta

#### Gestión de Transferencias
- `GET /api/transferencias` - Listar transferencias
- `POST /api/transferencias` - Crear transferencia
- `GET /api/transferencias/{id}` - Ver transferencia

#### Gestión de Sedes
- `GET /api/sedes` - Listar sedes
- `POST /api/sedes` - Crear sede
- `GET /api/sedes/{id}` - Ver sede
- `PUT /api/sedes/{id}` - Actualizar sede
- `DELETE /api/sedes/{id}` - Eliminar sede

#### Gestión de Proveedores
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores` - Crear proveedor
- `GET /api/proveedores/{id}` - Ver proveedor
- `PUT /api/proveedores/{id}` - Actualizar proveedor
- `DELETE /api/proveedores/{id}` - Eliminar proveedor

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
