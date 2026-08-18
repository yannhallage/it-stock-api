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

    RUN apt-get update && apt-get install -y --no-install-recommends openssl=3.* \
        && rm -rf /var/lib/apt/lists/*
    
    # Schema Prisma avant npm ci : postinstall lance prisma generate
    COPY package.json package-lock.json ./
    COPY prisma ./prisma
    RUN npm ci
    
    COPY tsconfig.json ./
    COPY src ./src
    
    # Build app
    RUN npm run build
    
    # -------- PRODUCTION STAGE --------
    FROM node:20-slim
    
    WORKDIR /app
    ENV NODE_ENV=production

    RUN apt-get update && apt-get install -y --no-install-recommends openssl=3.* \
        && rm -rf /var/lib/apt/lists/*
    
    # Schema Prisma avant npm ci : postinstall lance prisma generate
    COPY package.json package-lock.json ./
    COPY prisma ./prisma
    RUN npm ci --omit=dev && npm cache clean --force
    
    # Copy only necessary Prisma runtime
    COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
    COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
    
    # Copy app
    COPY --from=builder /app/dist ./dist

    # Copy PDF assets (logo) not emitted by the TypeScript build
    COPY --from=builder /app/src/modules/pdf/image.png ./dist/modules/pdf/image.png

    # All PDF services read LOGO_PATH first, so point it to the copied logo
    ENV LOGO_PATH=/app/dist/modules/pdf/image.png
    
    # Security (non-root user)
    RUN chown -R node:node /app
    USER node
    
    EXPOSE 3000
    
    # Run migrations + start app
    CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]