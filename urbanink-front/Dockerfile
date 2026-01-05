# ETAPA 1: Construcción de Angular
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Asegúrate de que el script 'build' en package.json sea el de producción
RUN npm run build 

# ETAPA 2: Servidor Nginx
FROM nginx:alpine

# Copiamos el build de Angular a la carpeta de Nginx
# OJO: Verifica en tu angular.json si la salida es dist/urbanink-front/browser o solo dist/urbanink-front
COPY --from=build /app/dist/urbanink-front/browser /usr/share/nginx/html

# Copiamos nuestra config personalizada (ver paso 4)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80