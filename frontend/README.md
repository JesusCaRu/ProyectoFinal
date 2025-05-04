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
- Gestión de roles (Administrador y Empleado)
- Persistencia de sesión

### Interfaz de Usuario
- Diseño moderno y responsivo
- Animaciones suaves con Framer Motion
- Iconos intuitivos con Lucide React
- Estilos consistentes con Tailwind CSS

### Seguridad
- Validación de formularios
- Protección de rutas
- Manejo de errores
- Persistencia segura de tokens

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
VITE_API_URL=http://localhost:8000/api
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
