# ==========================================
# STAGE 1: Compilar Frontend React + Vite
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Compilar Backend Fastify
# ==========================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src/ ./src/
RUN npm run build

# ==========================================
# STAGE 3: Runner de Producción Ultra Ligero
# (Compatible con Google Cloud Run y Render)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache python3 make g++

# Instalar solo dependencias de producción
COPY backend/package.json ./
RUN npm install --omit=dev

# Copiar backend compilado y schema SQL
COPY --from=backend-builder /app/backend/dist ./dist

# Copiar frontend PWA compilado a la carpeta public servida por Fastify
COPY --from=frontend-builder /app/frontend/dist ./public

# Crear directorio de datos para SQLite
RUN mkdir -p /app/data

# Google Cloud Run asigna automáticamente la variable PORT (usualmente 8080)
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public
ENV DATABASE_PATH=/app/data/study.db

EXPOSE 8080

CMD ["node", "dist/index.js"]
