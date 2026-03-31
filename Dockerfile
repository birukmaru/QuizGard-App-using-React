# Root Dockerfile for Render deployment
# Builds the backend API service

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Install all dependencies including prisma
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# Push schema to database (only runs during build, not on container start)
# Note: This uses DATABASE_URL from environment variable set by Render
RUN npx prisma db push --skip-generate

# Copy server source
COPY server/src ./src

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install openssl for prisma
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy from builder
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

CMD ["node", "src/index.js"]