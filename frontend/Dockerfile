FROM node:18-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar dependencias con --legacy-peer-deps para evitar problemas de compatibilidad
RUN npm install

# Copiar el resto de archivos del frontend
COPY frontend/ .

# Verificar la estructura de archivos antes de compilar
RUN ls -la src/pages/dashboard && \
    echo "Verificando rutas de importación..." && \
    find src -type f -name "*.jsx" -o -name "*.js" | xargs grep -l "import.*from.*pages/dashboard"

# Construir la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos de construcción desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]