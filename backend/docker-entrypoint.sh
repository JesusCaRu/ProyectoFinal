#!/bin/sh

# Esperar a que MySQL esté listo
echo "Esperando a MySQL..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL iniciado"

# Configurar la aplicación
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Ejecutar migraciones y seeders
echo "Ejecutando migraciones..."
php artisan migrate --force

echo "Ejecutando seeders..."
php artisan db:seed --force

# Optimizar la aplicación
php artisan optimize
php artisan config:cache
php artisan view:cache
php artisan route:cache

# Generar clave de Passport si es necesario (descomentar si usas Passport)
# php artisan passport:install --force

# Iniciar el servidor web
echo "Iniciando Apache..."
exec apache2-foreground