# Root Dockerfile for Render deployment
# Builds the backend API service

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Install all dependencies including prisma as devDependency
RUN npm ci --include=dev

# Generate Prisma client (needs to be done as root)
RUN npx prisma generate

# Copy server source
COPY server/src ./src

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder (read-only is fine)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

ENV NODE_ENV=production
ENV PORT=3001

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Don't run prisma db push on every deploy - just start the server
# Database should already be migrated
CMD ["node", "src/index.js"]