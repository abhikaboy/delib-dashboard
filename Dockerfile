# Multi-stage Docker build for Delibs application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files for both frontend and backend
COPY package.json ./
COPY backend/package.json ./backend/

# Install dependencies (include dev deps for SSR)
RUN npm install && \
    cd backend && npm install --only=production

# Build the frontend
FROM base AS builder
WORKDIR /app

# Copy package files (without lock file to avoid architecture issues)
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built frontend (both server and public assets)
COPY --from=builder --chown=nextjs:nodejs /app/.output ./frontend

# Copy backend and its dependencies
COPY --from=deps --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --chown=nextjs:nodejs backend/ ./backend/

# Copy start script
COPY --chown=nextjs:nodejs docker-start.sh ./
RUN chmod +x docker-start.sh

# Switch to non-root user
USER nextjs

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start both services
CMD ["./docker-start.sh"]
