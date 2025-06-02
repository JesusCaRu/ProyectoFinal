FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensiones PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Configurar opcache para producción
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Configurar PHP para mostrar errores en desarrollo
RUN { \
    echo 'display_errors=On'; \
    echo 'display_startup_errors=On'; \
    echo 'error_reporting=E_ALL'; \
    echo 'log_errors=On'; \
} > /usr/local/etc/php/conf.d/error-logging.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear directorio de trabajo
WORKDIR /var/www

# Copiar composer.json y composer.lock primero (para mejor cache)
COPY backend/composer.json backend/composer.lock ./

# Instalar dependencias de PHP
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copiar el resto de archivos de Laravel
COPY backend/ .

# Crear archivo .env si no existe
RUN if [ ! -f ".env" ]; then \
    echo "APP_NAME=StockFlow" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_DEBUG=true" >> .env && \
    echo "APP_URL=http://92.112.194.87:9000" >> .env && \
    echo "DB_CONNECTION=mysql" >> .env && \
    echo "DB_HOST=database" >> .env && \
    echo "DB_PORT=3306" >> .env && \
    echo "DB_DATABASE=stockflow" >> .env && \
    echo "DB_USERNAME=admin" >> .env && \
    echo "DB_PASSWORD=admin" >> .env && \
    echo "LOG_CHANNEL=stack" >> .env && \
    echo "LOG_LEVEL=debug" >> .env && \
    echo "FRONTEND_URL=http://92.112.194.87:3000" >> .env; \
    fi

# Generar key de la aplicación si no existe y optimizar la configuración
RUN php artisan key:generate --force

# Ejecutar scripts post-install
RUN composer dump-autoload --optimize

# Establecer permisos
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Crear directorios necesarios si no existen
RUN mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/framework/cache \
    && chown -R www-data:www-data /var/www/storage

# Configurar PHP para desarrollo en lugar de producción
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# Verificar que PHP-FPM puede encontrar los archivos
RUN ls -la /var/www/public

EXPOSE 9000

CMD ["php-fpm"]
