#!/bin/bash

# Robust APISIX deployment script with better error handling

set -e

# Configuration
MINIKUBE_PROFILE="weather-app"
K8S_VERSION="v1.32.0"

echo "🚀 Starting robust APISIX deployment..."

# Function to check if command succeeded
check_command() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 succeeded"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Start minikube with more resources
if ! minikube profile list | grep -q "$MINIKUBE_PROFILE"; then
    echo "📦 Creating minikube profile with increased resources..."
    minikube start \
        --profile="$MINIKUBE_PROFILE" \
        --kubernetes-version="$K8S_VERSION" \
        --driver=docker \
        --memory=6144 \
        --cpus=3 \
        --disk-size=30GB \
        --cache-images=true
    check_command "Minikube start"
else
    echo "♻️  Using existing minikube profile..."
    minikube start --profile="$MINIKUBE_PROFILE"
    check_command "Minikube restart"
fi

# Set context
kubectl config use-context "$MINIKUBE_PROFILE"
eval $(minikube docker-env --profile="$MINIKUBE_PROFILE")

# Build images
echo "🔨 Building Docker images..."
cd backend
docker build -t fastapi-k8s:latest .
check_command "Backend image build"
cd ..

cd frontend
rm -f package-lock.json
docker build -t react-k8s:latest .
check_command "Frontend image build"
cd ..

# Deploy applications first
echo "📦 Deploying applications..."
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/apisix-services.yaml
check_command "Application deployment"

# Wait for app deployments
echo "⏳ Waiting for application deployments..."
kubectl wait --for=condition=available --timeout=120s deployment/fastapi-backend
kubectl wait --for=condition=available --timeout=120s deployment/react-frontend
check_command "Application readiness"

# Clean up any existing APISIX installation
echo "🧹 Cleaning up existing APISIX..."
helm uninstall apisix -n apisix 2>/dev/null || true
helm uninstall apisix-ingress-controller -n apisix 2>/dev/null || true
kubectl delete namespace apisix --force --grace-period=0 2>/dev/null || true

# Wait for cleanup
sleep 10

# Create namespace
kubectl create namespace apisix
check_command "Namespace creation"

# Add APISIX repo
helm repo add apisix https://charts.apiseven.com
helm repo update
check_command "Helm repo update"

# Install APISIX with resource limits and longer timeout
echo "📦 Installing APISIX Gateway (this may take a few minutes)..."
helm install apisix apisix/apisix \
    --set gateway.type=NodePort \
    --set gateway.http.nodePort=30080 \
    --set gateway.tls.nodePort=30443 \
    --set admin.allow.ipList="{0.0.0.0/0}" \
    --set admin.credentials.admin="edd1c9f034335f136f87ad84b625c8f1" \
    --set apisix.resources.requests.cpu="100m" \
    --set apisix.resources.requests.memory="128Mi" \
    --set apisix.resources.limits.cpu="500m" \
    --set apisix.resources.limits.memory="512Mi" \
    --set etcd.resources.requests.cpu="100m" \
    --set etcd.resources.requests.memory="128Mi" \
    --set etcd.resources.limits.cpu="200m" \
    --set etcd.resources.limits.memory="256Mi" \
    --namespace apisix \
    --timeout=600s \
    --wait
check_command "APISIX Gateway installation"

# Install APISIX Ingress Controller with resource limits
echo "📦 Installing APISIX Ingress Controller..."
helm install apisix-ingress-controller apisix/apisix-ingress-controller \
    --set config.apisix.baseURL=http://apisix-admin.apisix.svc.cluster.local:9180/apisix/admin \
    --set config.apisix.adminKey="edd1c9f034335f136f87ad84b625c8f1" \
    --set image.tag="1.8.0" \
    --set resources.requests.cpu="50m" \
    --set resources.requests.memory="64Mi" \
    --set resources.limits.cpu="200m" \
    --set resources.limits.memory="256Mi" \
    --namespace apisix \
    --timeout=300s \
    --wait
check_command "APISIX Ingress Controller installation"

# Wait for all APISIX components
echo "⏳ Waiting for APISIX components to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/apisix -n apisix
kubectl wait --for=condition=available --timeout=300s deployment/apisix-ingress-controller -n apisix
check_command "APISIX components readiness"

# Apply ingress configuration
echo "📦 Applying ingress configuration..."
kubectl apply -f k8s/simple-apisix-ingress.yaml
check_command "Ingress configuration"

# Check if CRDs are available for advanced configuration
if kubectl get crd apisixroutes.apisix.apache.org >/dev/null 2>&1; then
    echo "✅ ApisixRoute CRD found, applying advanced configuration..."
    kubectl apply -f k8s/advanced-apisix-route.yaml
    check_command "Advanced ApisixRoute configuration"
else
    echo "⚠️  ApisixRoute CRD not found, using standard Ingress only"
fi

echo "✅ Deployment complete!"

# Show status
echo ""
echo "📊 Deployment Status:"
kubectl get deployments
kubectl get services
kubectl get ingress
kubectl get pods -n apisix

echo ""
echo "🌐 Access URLs:"
MINIKUBE_IP=$(minikube ip --profile="$MINIKUBE_PROFILE")
echo "Direct Gateway: http://$MINIKUBE_IP:30080"
echo "Application: http://weather-app.local"

echo ""
echo "📝 Add to /etc/hosts:"
echo "echo '$MINIKUBE_IP weather-app.local' | sudo tee -a /etc/hosts"

echo ""
echo "🧪 Test Commands:"
echo "curl -H 'Host: weather-app.local' http://$MINIKUBE_IP:30080/api/health"
echo "curl -H 'Host: weather-app.local' http://$MINIKUBE_IP:30080/"

echo ""
echo "💡 Management Commands:"
echo "kubectl get pods -n apisix  # Check APISIX status"
echo "kubectl logs -f deployment/apisix -n apisix  # APISIX logs"
echo "minikube stop --profile=$MINIKUBE_PROFILE  # Stop cluster"