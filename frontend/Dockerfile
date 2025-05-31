# Etapa 1: Construcción
FROM node:20-alpine AS build

# Establece el directorio de trabajo
WORKDIR /

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el proyecto y construye la aplicación
COPY . .
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:stable-alpine

# Elimina la configuración por defecto de NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Copia tu configuración personalizada de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos construidos al directorio que NGINX sirve
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto que usará Coolify (80 por defecto)
EXPOSE 80

# Inicia NGINX
CMD ["nginx", "-g", "daemon off;"]
