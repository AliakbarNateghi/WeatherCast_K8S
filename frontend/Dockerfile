# Simple development Dockerfile for Vite React
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development mode)
RUN npm install

# Copy source code and configuration
COPY . .

# Expose port 3000 (Vite default)
EXPOSE 3000

# Start Vite development server
# --host 0.0.0.0 allows external connections (required for Docker)
CMD ["npm", "run", "dev"]

