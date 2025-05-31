# Etapa 1: Construcción de la app con Node
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /

# Copiar los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la app para producción
RUN npm run build

# Etapa 2: Servir la app con Nginx
FROM nginx:stable-alpine

# Copiar los archivos compilados desde la etapa anterior
COPY --from=build /dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx si existe
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto estándar de Nginx
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
