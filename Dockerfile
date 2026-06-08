# Usar una imagen base de Node.js Alpine
FROM node:20-alpine

# Instalar procps para solucionar error de 'ps'
RUN apk add --no-cache procps

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias desde la carpeta backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código desde la carpeta backend
COPY backend/ .

# Exponer el puerto que usa la app
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
