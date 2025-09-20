# Multi-stage build for production
FROM node:20-bullseye-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files for workspaces
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including workspace dependencies)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build client
RUN npm run build:client

# Production stage
FROM node:20-bullseye-slim AS production

# Set working directory
WORKDIR /app

# Ensure OpenSSL is available for Prisma at runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies for server
RUN npm install --workspace=server --only=production

# Copy built client and server source
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/src ./server/src
COPY --from=builder /app/server/start.js ./server/start.js
COPY --from=builder /app/server/prisma ./server/prisma

# Create non-root user (Debian-based image)
RUN groupadd -g 1001 nodejs \
  && useradd -u 1001 -g nodejs -m -s /bin/bash nodejs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Start the application
CMD ["npm", "run", "start"]
