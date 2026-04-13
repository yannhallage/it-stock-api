# # syntax=docker/dockerfile:1

# # -------- BUILD STAGE --------
#     FROM node:20-slim AS builder

#     WORKDIR /app
    
#     # Install deps
#     COPY package.json package-lock.json ./
#     RUN npm ci
    
#     # Copy source
#     COPY prisma ./prisma
#     COPY tsconfig.json ./
#     COPY src ./src
    
#     # Generate Prisma client (IMPORTANT)
#     RUN npx prisma generate
    
#     # Build app (NestJS)
#     RUN npm run build
    
#     # -------- PRODUCTION STAGE --------
#     FROM node:20-slim
    
#     WORKDIR /app
    
#     ENV NODE_ENV=production
    
#     # Install only prod deps
#     COPY package.json package-lock.json ./
#     RUN npm ci --omit=dev
    
#     # Copy built app + node_modules (avec Prisma généré)
#     COPY --from=builder /app/dist ./dist
#     COPY --from=builder /app/node_modules ./node_modules
#     COPY prisma ./prisma
    
#     # Security (non-root user)
#     RUN chown -R node:node /app
#     USER node
    
#     EXPOSE 3000
    
#     CMD ["node", "dist/main.js"]


# syntax=docker/dockerfile:1

# -------- BUILD STAGE --------
    FROM node:20-slim AS builder

    WORKDIR /app
    
    # Install deps + generate Prisma + build (regroupé pour Hadolint)
    COPY package.json package-lock.json ./
    RUN npm ci && \
        npx prisma generate
    
    # Copy source
    COPY prisma ./prisma
    COPY tsconfig.json ./
    COPY src ./src
    
    # Build app
    RUN npm run build
    
    # -------- PRODUCTION STAGE --------
    FROM node:20-slim
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Install only prod deps
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev && npm cache clean --force
    
    # Copy only necessary Prisma runtime
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
    
    # Copy app
    COPY --from=builder /app/dist ./dist
    COPY prisma ./prisma
    
    # Security (non-root user)
    RUN chown -R node:node /app
    USER node
    
    EXPOSE 3000
    
    # Run migrations + start app
    CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]