# Root Dockerfile for Render deployment
# Builds the backend API service

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server files
COPY server/package*.json server/prisma ./server/
WORKDIR /app/server

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY server/src ./src

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/src ./src
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/package-lock.json ./package-lock.json

ENV NODE_ENV=production
ENV PORT=3001

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]