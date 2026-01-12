# ==================== STAGE 1: Dependencies ====================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm ci --only=production

# ==================== STAGE 2: Development ====================
FROM node:18-alpine AS development

WORKDIR /app

# Copie les dépendances depuis le stage précédent
COPY --from=dependencies /app/node_modules ./node_modules

# Copie tous les fichiers
COPY . .

# Expose le port
EXPOSE 5000

# Commande de développement
CMD ["npm", "run", "dev"]

# ==================== STAGE 3: Production ====================
FROM node:18-alpine AS production

# Installe dumb-init pour une meilleure gestion des signaux
RUN apk add --no-cache dumb-init

WORKDIR /app

# Crée un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copie les dépendances depuis le stage dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copie le code source
COPY --chown=nodejs:nodejs . .

# Change vers l'utilisateur non-root
USER nodejs

# Expose le port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Utilise dumb-init pour gérer les signaux correctement
ENTRYPOINT ["dumb-init", "--"]

# Commande de production
CMD ["npm", "start"]