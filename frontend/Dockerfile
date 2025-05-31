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


