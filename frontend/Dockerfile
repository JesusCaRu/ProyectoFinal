# Etapa única: solo para servir archivos estáticos ya construidos
FROM nginx:stable-alpine

# Copia el contenido de dist/ (ya generado) al directorio que sirve NGINX
COPY dist/ /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando por defecto para iniciar NGINX
CMD ["nginx", "-g", "daemon off;"]
