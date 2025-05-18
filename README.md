# FastAPI + React + Kubernetes Demo

This project demonstrates a simple microservices architecture using FastAPI (backend), React (frontend), Docker containers, and Kubernetes orchestration.

## Architecture Overview

```
[React Frontend] ←→ [FastAPI Backend]
       ↓                    ↓
   [dev-server:3000]   [uvicorn:8000]
       ↓                    ↓
[react-service]      [fastapi-service]
       ↓                    ↓
    [K8s Pod]           [K8s Pod]
```

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container definition
├── frontend/
│   ├── src/
│   │   ├── App.js          # React main component
│   │   ├── App.css         # Styles
│   │   └── index.js        # React entry point
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── package.json        # Node.js dependencies
│   ├── .env                # React dev server config
│   └── Dockerfile          # Frontend container definition
├── k8s/
│   ├── backend.yaml        # Backend K8s deployment & service
│   └── frontend.yaml       # Frontend K8s deployment & service
└── deploy.sh               # Deployment automation script
```

## Quick Start

### Prerequisites

- Docker
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured

### 1. Clone and Setup

```bash
# Create project structure
mkdir fastapi-react-k8s
cd fastapi-react-k8s

# Create directories
mkdir -p backend frontend/src frontend/public k8s
```

### 2. Build and Deploy

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### 3. Access the Application

For minikube:
```bash
# Get the frontend URL
minikube service react-service --url

# Get the backend URL (for testing)
minikube service fastapi-service --url
```

For other K8s clusters:
```bash
# Check service status
kubectl get services

# Port forward for local testing
kubectl port-forward service/react-service 3000:80
kubectl port-forward service/fastapi-service 8000:8000
```

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build Docker Images

```bash
# Backend
cd backend
docker build -t fastapi-k8s:latest .

# Frontend
cd ../frontend
docker build -t react-k8s:latest .
```

### 2. Load Images (minikube only)

```bash
minikube image load fastapi-k8s:latest
minikube image load react-k8s:latest
```

### 3. Deploy to Kubernetes

```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods

# Check service status
kubectl get services

# Check deployment status
kubectl get deployments

# View logs
kubectl logs -l app=fastapi-backend
kubectl logs -l app=react-frontend
```

## Key Kubernetes Concepts Demonstrated

1. **Deployments**: Manage replica sets and rolling updates
2. **Services**: Provide stable network endpoints
3. **Health Checks**: Liveness and readiness probes
4. **Resource Management**: CPU and memory limits
5. **Service Discovery**: Internal DNS resolution
6. **Multi-container Architecture**: Frontend and backend separation

## Troubleshooting

### Common Issues

1. **Images not found**: Make sure images are loaded into your cluster
2. **Service not accessible**: Check LoadBalancer support or use port-forwarding
3. **Backend connection failed**: Verify service names and ports match

### Useful Commands

```bash
# View all resources
kubectl get all

# Describe a problematic pod
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Execute into a container
kubectl exec -it <pod-name> -- /bin/sh

# Delete all resources
kubectl delete -f k8s/
```

## Production Considerations

For production deployment, consider:

1. **Image Registry**: Push images to a registry like Docker Hub or ECR
2. **Secrets Management**: Use K8s secrets for sensitive data
3. **Ingress Controller**: Replace LoadBalancer with Ingress for better routing
4. **Persistent Storage**: Add volumes for stateful components
5. **Monitoring**: Implement Prometheus/Grafana for observability
6. **Security**: Network policies, RBAC, and security contexts
7. **CI/CD**: Automate builds and deployments

## Environment Variables

- `REACT_APP_BACKEND_URL`: Backend API URL for React app
- Automatically set to K8s service DNS name in deployment

## Scaling

```bash
# Scale backend
kubectl scale deployment fastapi-backend --replicas=5

# Scale frontend
kubectl scale deployment react-frontend --replicas=3
```