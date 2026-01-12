# ==================== STAGE 1: Dependencies ====================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm ci

# ==================== STAGE 2: Builder ====================
FROM node:18-alpine AS builder

WORKDIR /app

# Copie les dépendances
COPY --from=dependencies /app/node_modules ./node_modules

# Copie le code source
COPY . .

# Build l'application pour la production
# Les variables d'environnement sont injectées au build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==================== STAGE 3: Development ====================
FROM node:18-alpine AS development

WORKDIR /app

# Copie les dépendances
COPY --from=dependencies /app/node_modules ./node_modules

# Copie le code source
COPY . .

# Expose le port Vite
EXPOSE 5173

# Commande de développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==================== STAGE 4: Production ====================
FROM nginx:alpine AS production

# Copie la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarre Nginx
CMD ["nginx", "-g", "daemon off;"]