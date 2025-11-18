# --- Stage 1: Build ---
FROM node:22-alpine as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias (incluye tsconfig-paths)
RUN npm ci

# Copiar código fuente (incluye .api/)
COPY . .

# Build de la aplicación
# Esto compila src/ y .api/ a dist/
# También copia los archivos JSON gracias a nest-cli.json
RUN npm run build

# --- Stage 2: Production ---
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de producción
COPY package*.json ./

# Instalar SOLO dependencias de producción
# IMPORTANTE: tsconfig-paths debe estar en "dependencies", NO en "devDependencies"
RUN npm ci --only=production

# Copiar el código compilado desde la etapa de build
# Nota: views/ ahora se copia dentro de dist/ durante el build gracias a nest-cli.json
COPY --from=builder /app/dist ./dist

# Copiar archivos necesarios para runtime
COPY --from=builder /app/environments/.env.production ./environments/.env

# Puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/src/main"]

