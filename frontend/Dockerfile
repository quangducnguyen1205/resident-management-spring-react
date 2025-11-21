# Multi-stage build for React + Vite application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Accept environment file as build argument
ARG ENV_FILE=.env.docker

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build tools like Vite)
RUN npm ci

# Copy source code
COPY . .

# Copy the appropriate environment file for Docker build
COPY ${ENV_FILE} .env.production

# Build the application in production mode
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
