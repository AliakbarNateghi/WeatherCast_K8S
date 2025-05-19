# Multi-stage build for production Vite React app

# Stage 1: Dependencies
FROM nexus.runc.info/node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (use npm install since no package-lock.json exists)
RUN npm install --omit=dev

# Stage 2: Build the application
FROM nexus.runc.info/node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy configuration files
COPY vite.config.js tailwind.config.js postcss.config.js ./

# Copy source code
COPY public ./public
COPY src ./src
COPY index.html ./

# Build the application for production
RUN npm run build

# Stage 3: Production image with nginx
FROM nexus.runc.info/nginx:1.25-alpine AS runner

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]