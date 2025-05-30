# 🤖 StockFlow - Sistema de Gestión de Inventario para Robots

<div align="center">

[![StockFlow Banner](mockups/DashboardAdminUI.jpg)](https://stockflow-demo.com)

![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Estado: En Desarrollo](https://img.shields.io/badge/Estado-En%20Desarrollo-blue?style=for-the-badge)](https://github.com/tuuser/stockflow)

[Ver Demo](https://stockflow-demo.com) • [Reportar Bug](https://github.com/tuuser/stockflow/issues) • [Solicitar Feature](https://github.com/tuuser/stockflow/issues)

</div>

## ✨ Descripción

StockFlow es una solución integral para la gestión de inventario diseñada específicamente para tiendas de robots y accesorios. Permite administrar productos, proveedores, compras, ventas y transferencias entre sedes de manera eficiente y en tiempo real.

El sistema está construido con tecnologías modernas para ofrecer una experiencia de usuario fluida y responsiva, con un diseño adaptado para dispositivos móviles y de escritorio.

## 📋 Tabla de Contenidos

- [✨ Descripción](#-descripción)
- [🚀 Características](#-características)
- [⚙️ Tecnologías](#️-tecnologías)
- [🛠️ Instalación](#️-instalación)
- [📱 Capturas de Pantalla](#-capturas-de-pantalla)
- [🔑 Endpoints API](#-endpoints-api)
- [📦 Estructura del Proyecto](#-estructura-del-proyecto)
- [📊 Modelos de Datos](#-modelos-de-datos)
- [👥 Roles y Permisos](#-roles-y-permisos)
- [📚 Documentación](#-documentación)
- [👥 Equipo](#-equipo)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🚀 Características

### Dashboard personalizado por rol

<div align="center">
  <img src="mockups/DashboardAdminUI.jpg" alt="Dashboard Admin" width="49%" />
  <img src="mockups/DashboardVendedorUI.jpg" alt="Dashboard Vendedor" width="49%" />
</div>

### Frontend
- 📊 **Dashboards intuitivos** para diferentes roles (Admin, Vendedor, Almacenista)
- 📱 **Diseño responsivo** optimizado para móvil, tablet y escritorio
- 🎨 **Interfaz moderna** con tema claro/oscuro y animaciones fluidas
- 📈 **Visualización de datos** con gráficos interactivos y reportes en tiempo real
- 🔍 **Búsqueda avanzada** con filtros dinámicos y sugerencias
- 🌐 **Internacionalización** con soporte para múltiples idiomas
- 🔐 **Autenticación segura** con JWT y protección de rutas

### Backend
- 🏢 **Gestión multi-sede** con transferencias de inventario entre ubicaciones
- 🔄 **Control de stock** con historial detallado de movimientos
- 📋 **Generación de facturas** en PDF con diseño personalizable
- 📊 **Reportes analíticos** para toma de decisiones
- 🛡️ **API RESTful** con documentación Swagger/OpenAPI
- 📝 **Registro de auditoría** para seguimiento de cambios
- 🔄 **Sincronización en tiempo real** entre dispositivos

## ⚙️ Tecnologías

### Frontend
- **React 19** - Framework JavaScript para construir interfaces de usuario
- **TailwindCSS** - Framework CSS para diseño rápido y responsivo
- **Zustand** - Gestión de estado simple y eficiente
- **Framer Motion** - Biblioteca para animaciones fluidas
- **React Query** - Gestión de estado del servidor y caché
- **Axios** - Cliente HTTP para realizar peticiones
- **React Router** - Navegación y enrutamiento
- **Lucide React** - Iconos modernos y personalizables

### Backend
- **Laravel 12** - Framework PHP moderno y potente
- **MySQL 8.0** - Sistema de gestión de bases de datos relacionales
- **Laravel Sanctum** - Autenticación API segura
- **Spatie Permissions** - Control de acceso basado en roles
- **Laravel Excel** - Exportación/importación de datos
- **Laravel PDF** - Generación de documentos PDF
- **Redis** - Almacenamiento en caché para mejor rendimiento
- **PHPUnit** - Framework de pruebas para PHP

### DevOps
- **Docker** - Contenedores para desarrollo y despliegue consistentes
- **GitHub Actions** - Integración y despliegue continuos (CI/CD)
- **Laravel Sail** - Entorno de desarrollo Docker optimizado
- **Vite** - Herramienta de construcción frontend ultrarrápida

## 🛠️ Instalación

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo)
- PHP 8.2+ (para desarrollo sin Docker)
- Composer (para desarrollo sin Docker)

### Usando Docker (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/tuuser/stockflow.git
cd stockflow

# Crear archivo .env
cp .env.example .env

# Iniciar contenedores
docker-compose up -d

# Instalar dependencias y configurar la aplicación
docker-compose exec backend composer install
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
docker-compose exec frontend npm install

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# PHPMyAdmin: http://localhost:8080
```

### Instalación Manual

#### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📱 Capturas de Pantalla

<div align="center">
  <img src="mockups/LoginUI.jpg" alt="Login" width="49%" />
  <img src="mockups/RegisterUI.jpg" alt="Register" width="49%" />
</div>

<div align="center">
  <img src="mockups/DashboardAlmacenistaUI.jpg" alt="Dashboard Almacenista" width="100%" />
  <p><em>Dashboard de Almacenista con gestión de inventario y transferencias</em></p>
</div>

## 🔑 Endpoints API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/user` | Obtener usuario actual |
| POST | `/api/auth/refresh` | Refrescar token |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos/{id}` | Obtener producto específico |
| POST | `/api/productos` | Crear nuevo producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |
| GET | `/api/productos/stock-bajo` | Productos con stock bajo |

### Transacciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/ventas` | Registrar venta |
| POST | `/api/compras` | Registrar compra |
| POST | `/api/transferencias` | Crear transferencia |
| GET | `/api/reportes/ventas` | Reporte de ventas |

[Ver documentación completa de la API](docs/api.md)

## 📦 Estructura del Proyecto

```
stockflow/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Estructuras de página
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── store/         # Estado global (Zustand)
│   │   ├── services/      # Servicios API
│   │   ├── hooks/         # Hooks personalizados
│   │   └── lib/           # Utilidades y helpers
│   ├── public/            # Archivos estáticos
│   └── ...
├── backend/           # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/  # Controladores
│   │   ├── Models/            # Modelos Eloquent
│   │   ├── Services/          # Servicios
│   │   └── ...
│   ├── database/
│   │   ├── migrations/        # Migraciones
│   │   └── seeders/          # Seeders
│   ├── routes/               # Definición de rutas
│   └── ...
├── docker/            # Configuración Docker
├── docs/              # Documentación
└── ...
```

## 📊 Modelos de Datos

- **Usuarios**: Administradores, vendedores y almacenistas
- **Productos**: Robots, repuestos y accesorios
- **Categorías**: Clasificación de productos
- **Marcas**: Fabricantes de productos
- **Proveedores**: Suministradores de productos
- **Sedes**: Ubicaciones físicas de la empresa
- **Ventas/Compras**: Transacciones con clientes/proveedores
- **Transferencias**: Movimientos entre sedes
- **Auditoría**: Registro de cambios en el sistema

## 👥 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Vendedor**: Gestión de ventas y consulta de inventario
- **Almacenista**: Control de inventario y transferencias

## 📚 Documentación

- [Guía de Usuario](docs/user-guide.md)
- [Documentación API](docs/api.md)
- [Arquitectura del Sistema](docs/architecture.md)
- [Guía de Contribución](CONTRIBUTING.md)

## 👥 Equipo

- 👨‍💻 **Desarrollador Frontend** - [Nombre](https://github.com/username)
- 👨‍💻 **Desarrollador Backend** - [Nombre](https://github.com/username)
- 👨‍🎨 **Diseñador UI/UX** - [Nombre](https://github.com/username)

## 🤝 Contribución

¡Agradecemos todas las contribuciones! Si deseas contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu característica: `git checkout -b feature/nueva-caracteristica`
3. Realiza tus cambios y haz commit: `git commit -m 'Añadir nueva característica'`
4. Sube tus cambios: `git push origin feature/nueva-caracteristica`
5. Crea un Pull Request

Por favor, lee nuestra [Guía de Contribución](CONTRIBUTING.md) para más detalles.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Copyright

Copyright © 2025 Jesús Canicio Ruiz. Todos los derechos reservados.