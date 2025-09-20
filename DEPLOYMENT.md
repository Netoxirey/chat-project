# Deployment Guide

This guide explains how to deploy the Chat Application to production.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- PM2 (optional, for process management)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

### 3. Set Up Environment Variables

Copy the production environment template:

```bash
cp server/env.production.example server/.env
```

Edit `server/.env` with your production values:

```bash
# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/chat_db_prod?schema=public"

# JWT
JWT_SECRET="your-super-secure-production-jwt-secret-key-here"

# Server
PORT=3000
NODE_ENV="production"

# CORS - Update with your production domain
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
```

### 4. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed:prod
```

### 5. Start Production Server

```bash
npm run start:prod
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Update environment variables in `docker-compose.yml`
2. Start services:

```bash
docker-compose up -d
```

### Using Docker directly

```bash
# Build image
docker build -t chat-app .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NODE_ENV="production" \
  chat-app
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | `7d` |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | No | `http://localhost:3000,http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | No | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |

## Available Scripts

### Root Level
- `npm install` - Install all dependencies (using workspaces)
- `npm run dev` - Start development servers
- `npm run build` - Build both client and server for production
- `npm run start:prod` - Build and start production server
- `npm run test` - Run all tests
- `npm run lint` - Run linting
- `npm run format` - Format code

### Server
- `npm run start` - Start server
- `npm run start:prod` - Start in production mode
- `npm run dev` - Start with nodemon
- `npm run build` - Generate Prisma client
- `npm run deploy` - Full deployment (build + migrate + start)
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:seed` - Seed database
- `npm run db:seed:prod` - Seed database (production)
- `npm run db:studio` - Open Prisma Studio

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET`
- [ ] Set up production database
- [ ] Update `CORS_ORIGIN` with your domain
- [ ] Configure SSL/HTTPS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure process manager (PM2)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all functionality

## Process Management with PM2

Install PM2:
```bash
npm install -g pm2
```

Create ecosystem file:
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'chat-app',
    script: 'server/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Monitoring

- Health check endpoint: `GET /health`
- Monitor logs: `pm2 logs chat-app`
- Monitor performance: `pm2 monit`

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` format
   - Ensure database is running
   - Verify network connectivity

2. **CORS errors**
   - Update `CORS_ORIGIN` with correct domains
   - Check frontend URL matches CORS settings

3. **Build failures**
   - Ensure all dependencies are installed
   - Check Node.js version (18+)
   - Clear node_modules and reinstall

4. **Static files not loading**
   - Verify `client/dist` directory exists
   - Check file permissions
   - Ensure build completed successfully

### Logs

Check application logs:
```bash
# Docker
docker-compose logs app

# PM2
pm2 logs chat-app

# Direct
npm run start:prod
```
