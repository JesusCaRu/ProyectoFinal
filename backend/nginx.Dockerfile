FROM nginx:alpine

# Copiar la configuración de Nginx
COPY backend/nginx-laravel.conf /etc/nginx/conf.d/default.conf

# Crear directorio para los archivos de Laravel
RUN mkdir -p /var/www/public

# Verificar la configuración de Nginx
RUN nginx -t

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
