# WeatherCast: React + FastAPI + Kubernetes

A modern weather application demonstrating a microservices architecture using FastAPI (backend), React (frontend), Docker containers, and Kubernetes orchestration.

## Features

- Current weather information for any city worldwide
- 5-day weather forecast with hourly breakdowns
- Real-time weather data from OpenWeatherMap API
- Responsive design with Tailwind CSS
- Containerized with Docker
- Orchestrated with Kubernetes

## Architecture Overview

```
                   ┌─── Ingress Controller ───┐
                   │    (NGINX Controller)    │
                   └───────────┬──────────────┘
                               │
                               ▼
        ┌────────────────────────────────────────┐
        │                                         │
┌───────▼───────┐                      ┌─────────▼────────┐
│  React Frontend│◄───── API calls ────►│ FastAPI Backend  │
│  (2 replicas)  │                      │   (3 replicas)   │
└───────┬───────┘                      └─────────┬────────┘
        │                                         │
        ▼                                         ▼
┌───────────────┐                      ┌─────────────────┐
│ react-service │                      │ fastapi-service │
│   (NodePort)  │                      │    (NodePort)   │
└───────────────┘                      └─────────────────┘
```

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI weather API application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend container definition
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React main component
│   │   ├── components/      # UI components
│   │   ├── index.css        # Tailwind styles
│   │   └── main.jsx         # React entry point
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   ├── nginx.conf           # Nginx configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── Dockerfile           # Frontend container definition
├── k8s/
│   ├── backend.yaml         # Backend K8s deployment & service
│   ├── frontend.yaml        # Frontend K8s deployment & service
│   └── ingress.yaml         # Ingress configuration
└── deploy.sh                # Deployment automation script
```

## Quick Start

### Prerequisites

- Docker
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured

### 1. Set Up Environment

```bash
# Start minikube with appropriate resources
minikube start --profile="weather-app" --cpus=2 --memory=4096mb --driver=docker

# Enable ingress addon
minikube addons enable ingress --profile="weather-app"
```

### 2. Configure Local Domain (Optional)

Add the following entry to your `/etc/hosts` file:

```
<minikube-ip> weather-app.local
```

Replace `<minikube-ip>` with the output of:

```bash
minikube ip --profile="weather-app"
```

### 3. Build and Deploy

```bash
# Make the deploy script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### 4. Access the Application

```bash
# Get the frontend URL
minikube service react-service --url --profile="weather-app"
```

Or access through the Ingress:
- http://weather-app.local (if you configured the hosts file)
- http://<minikube-ip> (direct IP access)

The API documentation is available at:
- http://weather-app.local/api/docs

## Kubernetes Features Demonstrated

1. **Multi-Pod Deployments**: Frontend (2 replicas) and Backend (3 replicas)
2. **Services**: NodePort for direct access; ClusterIP for Ingress routing
3. **Ingress**: Path-based routing with regex support
4. **Health Checks**: Liveness and readiness probes
5. **Resource Management**: CPU and memory limits
6. **Rolling Updates**: Zero-downtime deployments

## Key Commands

```bash
# View all resources
kubectl get all

# Scale the backend
kubectl scale deployment fastapi-backend --replicas=3

# View logs
kubectl logs -l app=fastapi-backend
kubectl logs -l app=react-frontend

# Access pod shell
kubectl exec -it $(kubectl get pod -l app=react-frontend -o name | head -1) -- /bin/sh

# Port forwarding (for debugging)
kubectl port-forward svc/fastapi-service 8000:8000
```

## Environment Variables

- `WEATHER_API_KEY`: API key for OpenWeatherMap (backend)
- `NODE_ENV`: Environment for React/Node.js (frontend)

## Troubleshooting

### Ingress Issues

If the Ingress is not routing correctly:

```bash
# Check Ingress status
kubectl get ingress
kubectl describe ingress weather-app-ingress

# Verify Ingress controller is running
kubectl get pods -n ingress-nginx

# Check Ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Service Connectivity

If services cannot connect:

```bash
# Check endpoints
kubectl get endpoints

# Test service DNS resolution
kubectl run -it --rm --restart=Never busybox --image=busybox -- nslookup fastapi-service
```

### Pod Health

If pods are not starting properly:

```bash
# Check pod status in detail
kubectl describe pod <pod-name>

# Check container logs
kubectl logs <pod-name>
```

## Production Considerations

For production deployment, consider:

1. **Persistent Storage**: For stateful components
2. **Secrets Management**: For API keys and sensitive data
3. **Horizontal Pod Autoscaler**: For dynamic scaling
4. **External Database**: For data persistence
5. **CDN Integration**: For static assets
6. **Monitoring**: Implement Prometheus/Grafana
7. **CI/CD Pipeline**: Automate builds and deployments

## Further Reading

### Core Kubernetes Concepts
- [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) - The smallest deployable units used for both frontend and backend
- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) - Managing replicated pods and updates
- [Services](https://kubernetes.io/docs/concepts/services-networking/service/) - Network abstraction for pod access
- [ConfigMaps & Secrets](https://kubernetes.io/docs/concepts/configuration/) - Environment configuration

### Kubernetes Networking
- [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress/) - HTTP routing with nginx-ingress
- [Ingress Path Types](https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types) - Understanding Prefix vs Exact path matching
- [Service Types](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) - NodePort vs ClusterIP vs LoadBalancer
- [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) - Understanding internal DNS resolution

### Health Checks & Monitoring
- [Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) - Understanding pod states
- [Container Probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes) - Liveness and readiness checks
- [Resource Metrics](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/) - Monitoring pod resource usage

### Resource Management
- [Managing Resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) - CPU and memory allocation
- [Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/) - Limiting resource consumption

### Minikube
- [Minikube Handbook](https://minikube.sigs.k8s.io/docs/handbook/) - Comprehensive guide
- [Minikube Addons](https://minikube.sigs.k8s.io/docs/handbook/addons/) - Including Ingress setup
- [Accessing Apps](https://minikube.sigs.k8s.io/docs/handbook/accessing/) - Different ways to access services

### Practical Guides
- [Kubernetes Patterns](https://k8spatterns.io/) - Common implementation patterns
- [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) - In-depth understanding
- [NGINX Ingress Controller Documentation](https://kubernetes.github.io/ingress-nginx/) - Detailed configuration options
