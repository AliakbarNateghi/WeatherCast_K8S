#!/bin/bash

# Optimized build and deploy script that avoids re-downloading

set -e

# Configuration
MINIKUBE_PROFILE="weather-app"
K8S_VERSION="v1.32.0"

echo "🚀 Starting optimized deployment..."

# Check if minikube profile exists, create if not
if ! minikube profile list | grep -q "$MINIKUBE_PROFILE"; then
    echo "📦 Creating new minikube profile with persistent cache..."
    minikube start \
        --profile="$MINIKUBE_PROFILE" \
        --kubernetes-version="$K8S_VERSION" \
        --driver=docker \
        --memory=4096 \
        --cpus=2 \
        --disk-size=20GB \
        --cache-images=true
else
    echo "♻️  Using existing minikube profile..."
    minikube start --profile="$MINIKUBE_PROFILE"
fi

# Set context to use our profile
kubectl config use-context "$MINIKUBE_PROFILE"

# Set Docker environment to use minikube's Docker daemon
echo "🐳 Setting Docker environment..."
eval $(minikube docker-env --profile="$MINIKUBE_PROFILE")

# Build images only if they don't exist
echo "🔨 Building Docker images..."

# Check if images exist
BACKEND_EXISTS=$(docker images -q fastapi-k8s:latest)
FRONTEND_EXISTS=$(docker images -q react-k8s:latest)

if [[ -z "$BACKEND_EXISTS" ]]; then
    echo "Building FastAPI backend..."
    cd backend
    docker build -t fastapi-k8s:latest .
    cd ..
else
    echo "✅ Backend image up to date"
fi

if [[ -z "$FRONTEND_EXISTS" ]]; then
    echo "Building React frontend..."
    cd frontend
    docker build -t react-k8s:latest .
    cd ..
else
    echo "✅ Frontend image up to date"
fi

echo "🚀 Deploying to Kubernetes..."

# Force restart deployments to pick up new images
kubectl delete deployments --ignore-not-found=true fastapi-backend react-frontend

# Apply configurations
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# Wait for deployments
echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=60s deployment/fastapi-backend
kubectl wait --for=condition=available --timeout=100s deployment/react-frontend

echo "✅ Deployment complete!"

# Show status and access information
kubectl get deployments
kubectl get services

echo ""
echo "🌐 Access URLs:"
echo "Frontend: $(minikube service react-service --url --profile="$MINIKUBE_PROFILE")"
echo "Backend: $(minikube service fastapi-service --url --profile="$MINIKUBE_PROFILE")"

# Keep minikube running
echo ""
echo "💡 To stop: minikube stop --profile=$MINIKUBE_PROFILE"
echo "💡 To delete: minikube delete --profile=$MINIKUBE_PROFILE"

