# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG BACKEND_URL

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV BACKEND_URL=${BACKEND_URL:-http://localhost:3001}

# Build the Vite app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/http.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/httpd.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN chgrp -R nginx /usr/share/nginx/html && \
    chmod -R g+rX /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
