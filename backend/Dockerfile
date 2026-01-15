# ==================== STAGE 1: Base ====================
FROM node:20-alpine AS base

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# ==================== STAGE 2: Development ====================
FROM base AS development

# Installe TOUTES les dépendances (dev + prod)
RUN npm install

# Copie tout le code
COPY . .

# Expose le port
EXPOSE 5000

# Commande de développement
CMD ["npm", "run", "dev"]

# ==================== STAGE 3: Production ====================
FROM base AS production

# Installe dumb-init
RUN apk add --no-cache dumb-init

# Installe uniquement les dépendances de production
RUN npm ci --only=production

# Crée un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copie le code source
COPY --chown=nodejs:nodejs . .

# Change vers l'utilisateur non-root
USER nodejs

# Expose le port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Utilise dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Commande de production
CMD ["npm", "start"]