# Simple development Dockerfile for React
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development mode)
RUN npm install

# Copy source code and configuration
COPY src/ src/
COPY public/ public/
COPY .env ./

# Expose port 3000 (React development server default)
EXPOSE 3000

# Start React development server
# --host 0.0.0.0 allows external connections (required for Docker)
CMD ["npm", "start"]