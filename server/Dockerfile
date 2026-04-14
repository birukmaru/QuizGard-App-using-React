# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for prisma)
RUN npm ci

# Copy prisma schema
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy node_modules from builder (contains generated prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy prisma folder for migrations
COPY --from=builder /app/prisma ./prisma

# Copy package.json for prisma commands
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Change ownership of Prisma engines directory to nodejs user
RUN chown -R nodejs:nodejs /app/node_modules/@prisma

# Copy application source
COPY --chown=nodejs:nodejs . ./src

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start command
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
