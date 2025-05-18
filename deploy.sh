#!/bin/bash

# Build and deploy script for the K8s demo app

set -e  # Exit on any error

echo "Building Docker images..."

# Check if minikube is running
if ! command -v minikube &> /dev/null || ! minikube status | grep -q "host: Running"; then
    echo "Error: Minikube is not running. Please start it with: minikube start"
    exit 1
fi

# Set Docker environment to use minikube's Docker daemon
echo "Setting Docker environment to use minikube..."
eval $(minikube docker-env)

# Build backend image directly in minikube's Docker
echo "Building FastAPI backend in minikube..."
cd backend
docker build -t fastapi-k8s:latest .
cd ..

# Build frontend image directly in minikube's Docker  
echo "Building React frontend in minikube..."
cd frontend
# Remove any existing package-lock.json to avoid sync issues
rm -f package-lock.json
docker build -t react-k8s:latest .
cd ..

echo "Docker images built successfully in minikube!"

# Verify images exist in minikube
echo "Verifying images in minikube..."
minikube image ls | grep -E "(fastapi-k8s|react-k8s)" || echo "Warning: Images not found in minikube"

echo "Applying Kubernetes configurations..."

# Delete existing deployments to force recreation with new images
kubectl delete deployments --ignore-not-found=true fastapi-backend react-frontend

# Apply Kubernetes configurations
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

echo "Deployment complete!"

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=60s deployment/fastapi-backend
kubectl wait --for=condition=available --timeout=100s deployment/react-frontend

echo "Checking deployment status..."
kubectl get deployments
kubectl get services

# Get service URLs
echo -e "\n--- Service Information ---"
kubectl get services -o wide

if command -v minikube &> /dev/null && minikube status | grep -q "host: Running"; then
    echo -e "\n--- Minikube Service URLs ---"
    echo "Frontend: $(minikube service react-service --url)"
    echo "Backend: $(minikube service fastapi-service --url)"
else
    echo -e "\n--- Access the application ---"
    echo "Frontend: http://localhost:3000 (after port-forwarding)"
    echo "Backend: http://localhost:8000 (after port-forwarding)"
    echo ""
    echo "To access locally, run:"
    echo "kubectl port-forward service/react-service 3000:3000"
    echo "kubectl port-forward service/fastapi-service 8000:8000"
fi