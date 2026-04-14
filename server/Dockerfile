# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate


# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

RUN mkdir -p /home/nodejs/.cache/prisma && chown -R nodejs:nodejs /home/nodejs/.cache

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 🔥 FIX EVERYTHING PERMISSION RELATED
RUN chown -R nodejs:nodejs /app

COPY --chown=nodejs:nodejs src ./src

ENV NODE_ENV=production

USER nodejs

EXPOSE 3001

CMD ["node", "src/index.js"]

# Start command
CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
