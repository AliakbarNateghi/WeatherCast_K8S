# Multi-stage build for production Vite React app

# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with cache mounted to node_modules
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Stage 2: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copy configuration files first (smaller, change less frequently)
COPY vite.config.js tailwind.config.js postcss.config.js ./

# Copy source code
COPY public ./public
COPY src ./src
COPY index.html ./

# Build the application for production
RUN npm run build

# Stage 3: Production image
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optimize nginx
RUN rm /etc/nginx/conf.d/default.conf.default || true
RUN nginx -t

# Expose port 80 for nginx
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
