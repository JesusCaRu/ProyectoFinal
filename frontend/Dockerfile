FROM node:18-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar todo el contenido del frontend
COPY frontend/ ./

# Verificar la estructura de archivos
RUN echo "Contenido del directorio actual:" && \
    ls -la && \
    echo "Estructura de directorios:" && \
    find . -type d | sort

# Limpiar caché de npm y reinstalar dependencias
RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm ci

# Construir la aplicación
RUN npm run build || (echo "Error en la compilación" && exit 1)

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Verificar el contenido del directorio HTML
RUN ls -la /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]