# syntax=docker/dockerfile:1

# -------- BUILD STAGE --------
    FROM node:20-slim AS builder

    WORKDIR /app
    
    # Install deps
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # Copy source
    COPY prisma ./prisma
    COPY tsconfig.json ./
    COPY src ./src
    
    # Generate Prisma client (IMPORTANT)
    RUN npx prisma generate
    
    # Build app (NestJS)
    RUN npm run build
    
    # -------- PRODUCTION STAGE --------
    FROM node:20-slim
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Install only prod deps
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev
    
    # Copy built app + node_modules (avec Prisma généré)
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY prisma ./prisma
    
    # Security (non-root user)
    RUN chown -R node:node /app
    USER node
    
    EXPOSE 3000
    
    CMD ["node", "dist/main.js"]