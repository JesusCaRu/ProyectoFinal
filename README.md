# 🤖 StockFlow - Gestor de Inventario para Robots

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Ver Demo](https://stockflow-demo.com) • [Reportar Bug](https://github.com/tuuser/stockflow/issues) • [Solicitar Feature](https://github.com/tuuser/stockflow/issues)

</div>

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [⚙️ Tecnologías](#️-tecnologías)
- [🛠️ Instalación](#️-instalación)
- [📱 Capturas de Pantalla](#-capturas-de-pantalla)
- [🔑 Endpoints API](#-endpoints-api)
- [📦 Estructura del Proyecto](#-estructura-del-proyecto)
- [👥 Equipo](#-equipo)
- [📄 Licencia](#-licencia)

## 🚀 Características

### Frontend
- 🎯 Dashboard interactivo con estadísticas en tiempo real
- 📊 Gráficos y visualizaciones de datos
- 🔐 Sistema de autenticación y roles
- 📱 Diseño responsivo (móvil, tablet, escritorio)
- ⚡ Rendimiento optimizado
- 🎨 Interfaz moderna con animaciones fluidas

### Backend
- 🏢 Gestión multi-sede
- 📦 Control de inventario en tiempo real
- 🔄 Sistema de transferencias entre sedes
- 📝 Registro detallado de movimientos
- 🛡️ API RESTful segura con Sanctum
- 📊 Reportes y análisis de datos

## ⚙️ Tecnologías

### Frontend
- **React 19** - Framework JavaScript
- **Zustand** - Gestión de estado
- **TailwindCSS** - Estilos
- **Framer Motion** - Animaciones
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

### Backend
- **Laravel 12** - Framework PHP
- **MySQL 8.0** - Base de datos
- **Laravel Sanctum** - Autenticación
- **Docker** - Containerización
- **Redis** - Caché

## 🛠️ Instalación

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+
- PHP 8.2+
- Composer

### Usando Docker (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/tuuser/stockflow.git

# Iniciar contenedores
docker-compose up -d

# El proyecto estará disponible en:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
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
  <img src="docs/dashboard.png" alt="Dashboard" width="400"/>
  <img src="docs/inventory.png" alt="Inventario" width="400"/>
</div>

## 🔑 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/products` | Listar productos |
| POST | `/api/transfers` | Crear transferencia |
| GET | `/api/reports/sales` | Reporte de ventas |

[Ver documentación completa de la API](docs/api.md)

## 📦 Estructura del Proyecto

```
stockflow/
├── frontend/          # Aplicación React
├── backend/          # API Laravel
├── docker/           # Configuración Docker
├── docs/            # Documentación
└── mysql_data/      # Datos persistentes MySQL
```

## 👥 Equipo

- 👨‍💻 **Frontend Developer** - [Nombre](https://github.com/username)
- 👨‍💻 **Backend Developer** - [Nombre](https://github.com/username)
- 👨‍🎨 **UI/UX Designer** - [Nombre](https://github.com/username)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.