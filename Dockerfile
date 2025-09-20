# Multi-stage build for production
FROM node:18-alpine AS builder

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

# Build client
RUN npm run build:client

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies for server
RUN npm install --workspace=server --only=production

# Copy built client and server source
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/src ./server/src
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
