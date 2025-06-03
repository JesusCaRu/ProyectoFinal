# RobotStock - Frontend

Frontend de RobotStock, un sistema de gestión de inventario para tiendas de robots, desarrollado con React.

## Tecnologías Utilizadas

- React 18
- React Router v6
- Zustand (Gestión de estado)
- Tailwind CSS (Estilos)
- Framer Motion (Animaciones)
- Lucide React (Iconos)
- Axios (Peticiones HTTP)

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   └── ProtectedRoute.jsx  # Componente para rutas protegidas
├── layouts/           # Layouts de la aplicación
│   └── AuthLayout.jsx     # Layout para páginas de autenticación
├── pages/            # Páginas de la aplicación
│   └── auth/         # Páginas de autenticación
│       ├── Login.jsx
│       ├── Register.jsx
│       └── components/    # Componentes específicos de autenticación
├── routes/           # Configuración de rutas
│   └── routes.jsx    # Definición de rutas de la aplicación
├── store/            # Estado global con Zustand
│   └── authStore.js  # Store de autenticación
└── App.jsx          # Componente principal
```

## Características Principales

### Autenticación
- Login y registro de usuarios
- Protección de rutas
- Gestión de roles (Administrador, Vendedor y Almacenista)
- Persistencia de sesión

### Inventario
- Gestión completa de productos
- Control de stock en múltiples sedes
- Alertas de stock bajo
- Transferencias entre sedes
- Historial de movimientos

### Compras y Ventas
- Registro de compras a proveedores
- Registro de ventas a clientes
- Facturas generadas automáticamente
- Historial de transacciones
- Reportes y estadísticas

### Sistema de Auditoría
- Seguimiento detallado de acciones de usuarios
- Registro de cambios en entidades (productos, usuarios, etc.)
- Filtrado por fechas, usuarios y tipos de acción
- Exportación de registros de auditoría
- Visualización de cambios específicos en datos

### Notificaciones y Comunicaciones
- Notificaciones en tiempo real
- Alertas de stock bajo
- Mensajes entre usuarios
- Comunicaciones por sede
- Historial de notificaciones

### Interfaz de Usuario
- Diseño moderno y responsivo
- Animaciones suaves con Framer Motion
- Iconos intuitivos con Lucide React
- Estilos consistentes con Tailwind CSS
- Tema claro/oscuro

### Dashboard Analítico
- Estadísticas de ventas y compras
- Gráficos interactivos
- KPIs de rendimiento
- Productos más vendidos
- Alertas y notificaciones

### Seguridad
- Validación de formularios
- Protección de rutas
- Manejo de errores
- Persistencia segura de tokens
- Control de acceso basado en roles

## Instalación y Configuración

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://92.112.194.87:8000/api
```

4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

## Rutas de la Aplicación

- `/auth/login` - Página de inicio de sesión
- `/auth/register` - Página de registro
- `/dashboard` - Panel principal (protegido)

## Contribución

1. Fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Copyright

Copyright © 2025 Jesús Canicio Ruiz. Todos los derechos reservados.
