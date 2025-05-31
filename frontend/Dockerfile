# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos de construcción desde la etapa anterior
COPY frontend/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (opcional)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]