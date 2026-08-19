# syntax=docker/dockerfile:1

# -------- BUILD STAGE --------
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl=3.* \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# -------- PRODUCTION STAGE --------
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production
ENV LOGO_PATH=/app/dist/modules/pdf/image.png

RUN apt-get update && apt-get install -y --no-install-recommends openssl=3.* \
    && rm -rf /var/lib/apt/lists/* \
    && chown node:node /app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node prisma ./prisma

USER node
# ignore-scripts : prisma CLI n'est pas en prod ; le client généré vient du builder
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/modules/pdf/image.png ./dist/modules/pdf/image.png

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
