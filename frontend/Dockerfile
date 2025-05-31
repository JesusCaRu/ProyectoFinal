# 1. Imagen base con Node.js (ajusta la versión si es necesario)
FROM node:20-alpine AS build

# 2. Establece el directorio de trabajo
WORKDIR /app

# 3. Copia los archivos del proyecto
COPY package*.json ./
COPY . .

# 4. Instala dependencias
RUN npm install

# 5. Compila el proyecto para producción
RUN npm run build

# 6. Servidor web ligero para servir la app (usamos nginx)
FROM nginx:stable-alpine

# 7. Copia la app compilada al directorio de NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# 8. Copia configuración de NGINX (opcional si necesitas configurar rutas SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 9. Expone el puerto 80
EXPOSE 80

# 10. Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
