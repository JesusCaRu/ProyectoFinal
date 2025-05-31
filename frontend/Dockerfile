# Etapa 1: Construcción
FROM node:20-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /

# Copia los archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del proyecto y construye
COPY . .
RUN npm run build

# Etapa 2: Producción con NGINX
FROM nginx:stable-alpine

# Copia los archivos construidos al directorio que NGINX sirve
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto por defecto
EXPOSE 80

# Comando por defecto para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
