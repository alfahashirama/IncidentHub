# ==================== STAGE 1: Base ====================
FROM node:20-alpine AS base

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# ==================== STAGE 2: Development ====================
FROM base AS development

# Installe toutes les dépendances
RUN npm install

# Copie tout le code
COPY . .

# Expose le port Vite
EXPOSE 5173

# Commande de développement
CMD ["npm", "run", "dev"]

# ==================== STAGE 3: Builder ====================
FROM base AS builder

# Installe les dépendances
RUN npm install

# Copie le code source
COPY . .

# Build pour la production
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==================== STAGE 4: Production ====================
FROM nginx:alpine AS production

# Copie la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Démarre Nginx
CMD ["nginx", "-g", "daemon off;"]